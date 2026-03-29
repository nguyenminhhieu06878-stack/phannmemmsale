const { Delivery, Order, User, Customer } = require('../models');
const { Op } = require('sequelize');

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const { search, status, orderId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.trackingNumber = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const { count, rows } = await Delivery.findAndCountAll({
      where,
      include: [
        { 
          model: Order, 
          as: 'order', 
          attributes: ['id', 'orderNumber', 'totalAmount'],
          include: [
            { model: Customer, as: 'customer', attributes: ['id', 'companyName', 'phone', 'email'] }
          ]
        },
        { model: User, as: 'deliveryStaff', attributes: ['id', 'username', 'fullName'] }
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
    console.error('❌ Error in getAllDeliveries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        { 
          model: Order, 
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount', 'preparationImages', 'notes'],
          include: [
            { model: Customer, as: 'customer', attributes: ['id', 'companyName', 'phone', 'email'] }
          ]
        },
        { model: User, as: 'deliveryStaff', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    console.error('❌ Error in getDeliveryById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create delivery
exports.createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery
exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    await delivery.update(req.body);

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    await delivery.destroy();

    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await delivery.update(updateData);

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery status with images (for delivery confirmation)
exports.updateStatusWithImages = async (req, res) => {
  try {
    const { status, deliveryNotes } = req.body;
    const delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updateData = { status };
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.deliveryImages = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
      updateData.proofOfDelivery = imageUrls.length > 0 ? imageUrls[0] : null; // First image as main proof
    }

    if (deliveryNotes) {
      updateData.notes = deliveryNotes;
    }

    await delivery.update(updateData);

    console.log(`✅ Updated delivery ${delivery.id} to ${status} with ${imageUrls.length} images`);

    // Tự động tạo hóa đơn khi giao hàng thành công
    if (status === 'delivered') {
      try {
        const { Invoice, InvoiceItem } = require('../models');
        
        // Lấy thông tin đơn hàng và items
        const orderWithItems = await Order.findByPk(delivery.orderId, {
          include: [
            { model: require('../models').OrderItem, as: 'orderItems', 
              include: [{ model: require('../models').Product, as: 'product' }] 
            },
            { model: require('../models').Customer, as: 'customer' }
          ]
        });
        
        // Tạo hóa đơn
        const invoiceNumber = `INV${Date.now()}`;
        const invoice = await Invoice.create({
          invoiceNumber,
          orderId: delivery.orderId,
          customerId: orderWithItems.customerId,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          subtotal: orderWithItems.subtotal,
          discountAmount: orderWithItems.discountAmount,
          taxAmount: orderWithItems.taxAmount || 0,
          totalAmount: orderWithItems.totalAmount,
          paidAmount: 0,
          remainingAmount: orderWithItems.totalAmount,
          status: 'pending',
          paymentMethod: orderWithItems.paymentMethod,
          notes: `Invoice tự động tạo từ đơn hàng ${orderWithItems.orderNumber} đã giao thành công`,
          createdBy: req.user.id
        });
        
        // Tạo invoice items
        for (const orderItem of orderWithItems.orderItems) {
          await InvoiceItem.create({
            invoiceId: invoice.id,
            productId: orderItem.productId,
            productName: orderItem.productName,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
            discount: orderItem.discount,
            discountAmount: orderItem.discountAmount,
            subtotal: orderItem.subtotal,
            total: orderItem.total
          });
        }
        
        console.log(`✅ Auto-created invoice: ${invoiceNumber} for delivered order: ${orderWithItems.orderNumber}`);
        
        // Tạo notification cho kế toán
        const { Notification, User } = require('../models');
        const accountants = await User.findAll({ where: { role: 'accountant', isActive: true } });
        
        for (const accountant of accountants) {
          await Notification.create({
            userId: accountant.id,
            type: 'invoice_created',
            title: 'Invoice mới cần xử lý',
            message: `Invoice ${invoiceNumber} đã được tạo từ đơn hàng ${orderWithItems.orderNumber} đã giao thành công`,
            link: `/invoices/${invoice.id}`
          });
        }
        
      } catch (invoiceError) {
        console.error('❌ Error creating auto invoice:', invoiceError);
        // No throw error để không ảnh hưởng đến việc cập nhật delivery
      }
    }

    res.json({ 
      success: true, 
      data: delivery,
      message: status === 'delivered' ? 'Confirm giao hàng thành công' : 'Cập nhật trạng thái thành công'
    });
  } catch (error) {
    console.error('❌ Error updating delivery status with images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
