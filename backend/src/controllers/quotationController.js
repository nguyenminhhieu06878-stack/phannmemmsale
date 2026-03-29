const { Quotation, QuotationItem, Customer, User, Product } = require('../models');
const { Op } = require('sequelize');

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.quotationNumber = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const { count, rows } = await Quotation.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'companyName', 'email'] },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: QuotationItem, as: 'quotationItems', include: [{ model: Product, as: 'product' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: QuotationItem, as: 'quotationItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create quotation with items
exports.createQuotation = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { items, ...quotationData } = req.body;

    // Generate quotation number
    const count = await Quotation.count();
    const quotationNumber = `QT${String(count + 1).padStart(6, '0')}`;

    // Calculate totals from items
    let subtotal = 0;
    let totalDiscount = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      }
    }

    const totalAmount = subtotal - totalDiscount;

    // Create quotation
    const quotation = await Quotation.create({
      ...quotationData,
      quotationNumber,
      subtotal,
      discountAmount: totalDiscount,
      totalAmount,
      salesPersonId: req.user.id,
      createdBy: req.user.id
    }, { transaction });

    // Create quotation items
    if (items && items.length > 0) {
      const quotationItems = items.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const discountAmount = (subtotal * (item.discount || 0)) / 100;
        const total = subtotal - discountAmount;
        
        return {
          ...item,
          quotationId: quotation.id,
          discountAmount,
          subtotal,
          total
        };
      });
      await QuotationItem.bulkCreate(quotationItems, { transaction });
    }

    await transaction.commit();

    // Fetch complete quotation with items
    const completeQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: QuotationItem, as: 'quotationItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({ success: true, data: completeQuotation });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quotation
exports.updateQuotation = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.status === 'approved' || quotation.status === 'rejected') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update approved or rejected quotation' 
      });
    }

    const { items, ...quotationData } = req.body;

    // Recalculate totals if items provided
    if (items) {
      let subtotal = 0;
      let totalDiscount = 0;

      for (const item of items) {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      }

      quotationData.subtotal = subtotal;
      quotationData.discountAmount = totalDiscount;
      quotationData.totalAmount = subtotal - totalDiscount;

      // Delete old items and create new ones
      await QuotationItem.destroy({ where: { quotationId: quotation.id }, transaction });
      
      const quotationItems = items.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const discountAmount = (subtotal * (item.discount || 0)) / 100;
        const total = subtotal - discountAmount;
        
        return {
          ...item,
          quotationId: quotation.id,
          discountAmount,
          subtotal,
          total
        };
      });
      await QuotationItem.bulkCreate(quotationItems, { transaction });
    }

    await quotation.update(quotationData, { transaction });
    await transaction.commit();

    // Fetch complete quotation
    const completeQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: QuotationItem, as: 'quotationItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.json({ success: true, data: completeQuotation });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only delete draft quotations' 
      });
    }

    await quotation.destroy();

    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quotation status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    await quotation.update({ status });

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Convert quotation to order
exports.convertToOrder = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [{ model: QuotationItem, as: 'quotationItems' }]
    });

    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.status !== 'approved') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Only approved quotations can be converted to orders' 
      });
    }

    // Check if already converted
    const { Order } = require('../models');
    const existingOrder = await Order.findOne({ where: { quotationId: quotation.id } });
    if (existingOrder) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Quotation already converted to order',
        orderId: existingOrder.id
      });
    }

    // Generate order number
    const orderCount = await Order.count();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      quotationId: quotation.id,
      customerId: quotation.customerId,
      salesPersonId: quotation.salesPersonId,
      subtotal: quotation.subtotal,
      discountAmount: quotation.discountAmount,
      totalAmount: quotation.totalAmount,
      paymentMethod: 'credit_terms', // Default payment method
      status: 'pending',
      notes: quotation.notes,
      createdBy: req.user.id
    }, { transaction });

    // Create order items from quotation items
    const { OrderItem } = require('../models');
    const orderItems = quotation.quotationItems.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = (subtotal * (item.discount || 0)) / 100;
      const total = subtotal - discountAmount;
      
      return {
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountAmount,
        subtotal,
        total,
        notes: item.notes
      };
    });
    await OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Quotation converted to order successfully',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error in convertToOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fix QuotationItem calculations
exports.fixQuotationItemCalculations = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [{ model: QuotationItem, as: 'quotationItems' }]
    });
    
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    let fixed = 0;
    for (const item of quotation.quotationItems) {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = (subtotal * (item.discount || 0)) / 100;
      const total = subtotal - discountAmount;
      
      if (item.subtotal !== subtotal || item.discountAmount !== discountAmount || item.total !== total) {
        await item.update({
          subtotal,
          discountAmount,
          total
        });
        fixed++;
      }
    }

    res.json({ 
      success: true, 
      message: `Fixed ${fixed} QuotationItems`,
      data: { fixedItems: fixed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};