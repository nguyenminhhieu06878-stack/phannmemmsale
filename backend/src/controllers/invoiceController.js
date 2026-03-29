const { Invoice, InvoiceItem, Payment, Order, Customer, User, Product } = require('../models');
const { Op } = require('sequelize');

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.invoiceNumber = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNumber'] },
        { model: Customer, as: 'customer', attributes: ['id', 'companyName', 'email'] },
        { model: InvoiceItem, as: 'invoiceItems', include: [{ model: Product, as: 'product' }] },
        { model: Payment, as: 'payments' }
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

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'invoiceItems', include: [{ model: Product, as: 'product' }] },
        { model: Payment, as: 'payments', include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] }] }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create invoice from order
exports.createInvoice = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { orderId, items, dueDate, paymentTerms, notes } = req.body;

    // Get order
    const { OrderItem } = require('../models');
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Generate invoice number
    const count = await Invoice.count();
    const invoiceNumber = `INV${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    const invoiceItems = items || order.items;

    for (const item of invoiceItems) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    }

    const totalAmount = subtotal - totalDiscount;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      orderId,
      customerId: order.customerId,
      invoiceDate: new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      subtotal,
      discountAmount: totalDiscount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      status: 'draft',
      paymentTerms,
      notes,
      createdBy: req.user.id
    }, { transaction });

    // Create invoice items
    for (const item of invoiceItems) {
      await InvoiceItem.create({
        invoiceId: invoice.id,
        productId: item.productId,
        productName: item.productName || item.product?.name,
        productSku: item.productSku || item.product?.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0
      }, { transaction });
    }

    await transaction.commit();

    // Fetch complete invoice
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'invoiceItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({ success: true, data: completeInvoice });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update paid invoice' 
      });
    }

    const { items, ...invoiceData } = req.body;

    // Recalculate if items provided
    if (items) {
      let subtotal = 0;
      let totalDiscount = 0;

      for (const item of items) {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      }

      const totalAmount = subtotal - totalDiscount;
      invoiceData.subtotal = subtotal;
      invoiceData.discountAmount = totalDiscount;
      invoiceData.totalAmount = totalAmount;
      invoiceData.remainingAmount = totalAmount - invoice.paidAmount;

      // Delete old items and create new ones
      await InvoiceItem.destroy({ where: { invoiceId: invoice.id }, transaction });
      
      for (const item of items) {
        await InvoiceItem.create({
          ...item,
          invoiceId: invoice.id
        }, { transaction });
      }
    }

    await invoice.update(invoiceData, { transaction });
    await transaction.commit();

    // Fetch complete invoice
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'invoiceItems', include: [{ model: Product, as: 'product' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    res.json({ success: true, data: completeInvoice });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete paid invoice' 
      });
    }

    await invoice.destroy();

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record payment
exports.recordPayment = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { amount, paymentMethod, paymentDate, referenceNumber, notes } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Payment amount must be greater than 0' 
      });
    }

    if (amount > invoice.remainingAmount) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount cannot exceed remaining amount (${invoice.remainingAmount})` 
      });
    }

    // Generate payment number
    const paymentCount = await Payment.count();
    const paymentNumber = `PAY${String(paymentCount + 1).padStart(6, '0')}`;

    // Create payment record
    await Payment.create({
      invoiceId: invoice.id,
      paymentNumber,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      referenceNumber,
      notes,
      createdBy: req.user.id
    }, { transaction });

    // Update invoice
    const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(amount);
    const newRemainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;

    let status = 'partial';
    if (newRemainingAmount <= 0) {
      status = 'paid';
    } else if (newPaidAmount === 0) {
      status = 'sent';
    }

    await invoice.update({
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status,
      paymentMethod
    }, { transaction });

    // Create notification
    const { Notification } = require('../models');
    await Notification.create({
      userId: invoice.createdBy || req.user.id,
      type: 'payment_received',
      title: 'New Payment',
      message: `Received payment ${amount.toLocaleString()} VND for invoice ${invoice.invoiceNumber}`,
      link: `/invoices/${invoice.id}`
    }, { transaction });

    await transaction.commit();

    // Fetch complete invoice
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'invoiceItems' },
        { model: Payment, as: 'payments', include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] }] }
      ]
    });

    res.json({ success: true, data: completeInvoice });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payments for invoice
exports.getInvoicePayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { invoiceId: req.params.id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] }],
      order: [['paymentDate', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update invoice status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await invoice.update({ status });

    console.log(`✅ Updated invoice ${invoice.invoiceNumber} status to: ${status}`);

    res.json({ 
      success: true, 
      data: invoice,
      message: `Invoice status updated successfully: ${status}`
    });
  } catch (error) {
    console.error('❌ Error updating invoice status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};