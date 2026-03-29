const { Order, OrderItem, Customer, User, Quotation, Product, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.orderNumber = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'companyName', 'email'] },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'username', 'fullName'] },
        { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }
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

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'username', 'fullName'] },
        { model: Quotation, as: 'quotation' },
        { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create order with items
exports.createOrder = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { items, ...orderData } = req.body;

    // Generate order number
    const count = await Order.count();
    const orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;

    // Calculate totals from items
    let subtotal = 0;
    let totalDiscount = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        // Check stock availability
        const product = await Product.findByPk(item.productId);
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ 
            success: false, 
            message: `Product with ID ${item.productId} not found` 
          });
        }

        if (product.stock < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            success: false, 
            message: `Printsufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }

        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      }
    }

    const totalAmount = subtotal - totalDiscount;

    // Create order
    const order = await Order.create({
      ...orderData,
      orderNumber,
      subtotal,
      discountAmount: totalDiscount,
      totalAmount,
      salesPersonId: req.user.id,
      createdBy: req.user.id
    }, { transaction });

    // Create order items and reserve stock
    if (items && items.length > 0) {
      for (const item of items) {
        await OrderItem.create({
          ...item,
          orderId: order.id
        }, { transaction });

        // Reserve stock (decrease quantity)
        const product = await Product.findByPk(item.productId);
        await product.update({
          stock: product.stock - item.quantity
        }, { transaction });
      }
    }

    // Create notification for sales manager
    await Notification.create({
      userId: req.user.id, // Will be updated to manager in production
      type: 'order_created',
      title: 'Order mới',
      message: `Order ${orderNumber} đã được tạo và chờ duyệt`,
      link: `/orders/${order.id}`
    }, { transaction });

    await transaction.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({ success: true, data: completeOrder });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'orderItems' }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update completed or cancelled order' 
      });
    }

    const { items, ...orderData } = req.body;

    // If items are being updated, restore old stock and reserve new stock
    if (items) {
      // Restore old stock
      for (const oldItem of order.orderItems) {
        const product = await Product.findByPk(oldItem.productId);
        await product.update({
          stock: product.stock + oldItem.quantity
        }, { transaction });
      }

      // Calculate new totals and check new stock
      let subtotal = 0;
      let totalDiscount = 0;

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ 
            success: false, 
            message: `Product with ID ${item.productId} not found` 
          });
        }

        if (product.stock < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            success: false, 
            message: `Printsufficient stock for ${product.name}` 
          });
        }

        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      }

      orderData.subtotal = subtotal;
      orderData.discountAmount = totalDiscount;
      orderData.totalAmount = subtotal - totalDiscount;

      // Delete old items and create new ones
      await OrderItem.destroy({ where: { orderId: order.id }, transaction });
      
      for (const item of items) {
        await OrderItem.create({
          ...item,
          orderId: order.id
        }, { transaction });

        // Reserve new stock
        const product = await Product.findByPk(item.productId);
        await product.update({
          stock: product.stock - item.quantity
        }, { transaction });
      }
    }

    await order.update(orderData, { transaction });
    await transaction.commit();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'salesPerson', attributes: ['id', 'username', 'fullName'] },
        { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.json({ success: true, data: completeOrder });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'orderItems' }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Can only delete draft orders' 
      });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findByPk(item.productId);
      await product.update({
        stock: product.stock + item.quantity
      }, { transaction });
    }

    await order.destroy({ transaction });
    await transaction.commit();

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve order
exports.approveOrder = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending orders can be approved' 
      });
    }

    await order.update({
      status: 'approved',
      approvedById: req.user.id,
      approvedAt: new Date()
    }, { transaction });

    // Create notification
    await Notification.create({
      userId: order.salesPersonId,
      type: 'order_approved',
      title: 'Order đã được duyệt',
      message: `Order ${order.orderNumber} đã được duyệt`,
      link: `/orders/${order.id}`
    }, { transaction });

    await transaction.commit();

    res.json({ success: true, data: order });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.update({ status });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fix OrderItem calculations
exports.fixOrderItemCalculations = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'orderItems' }]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let fixed = 0;
    for (const item of order.orderItems) {
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
      message: `Fixed ${fixed} OrderItems`,
      data: { fixedItems: fixed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete order with preparation images
exports.completeWithImages = async (req, res) => {
  try {
    const { preparationNotes } = req.body;
    
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderItem, as: 'orderItems' }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'processing') {
      return res.status(400).json({ success: false, message: 'Order must be in processing status' });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updateData = {
      status: 'completed',
      preparationImages: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
    };

    if (preparationNotes) {
      updateData.notes = preparationNotes;
    }

    await order.update(updateData);

    // Tự động tạo delivery record
    const { Delivery } = require('../models');
    
    const deliveryNumber = `DEL${Date.now()}`;
    const delivery = await Delivery.create({
      orderId: order.id,
      deliveryDate: new Date(),
      deliveryAddress: order.shippingAddress?.address || 
                      (typeof order.customer.address === 'string' ? order.customer.address : 
                       order.customer.address?.street || 'Address khách hàng'),
      status: 'pending',
      notes: `Order ${order.orderNumber} đã được chuẩn bị xong, sẵn sàng giao hàng`,
      createdBy: req.user.id
    });

    console.log(`✅ Created delivery: ${deliveryNumber} for order: ${order.orderNumber}`);

    res.json({
      success: true,
      message: 'Order completed and delivery created successfully',
      data: {
        preparationNotes: preparationNotes,
        images: imageUrls,
        deliveryId: delivery.id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};