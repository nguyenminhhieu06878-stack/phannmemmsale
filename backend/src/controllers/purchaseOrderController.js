const { PurchaseOrder, StockRequest, Supplier, Product, User } = require('../models');
const { Op } = require('sequelize');

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, supplierId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    // If user is supplier, only show their orders
    if (req.user.role === 'supplier') {
      // Assume supplier user has supplierId in their profile or we match by email
      const supplier = await Supplier.findOne({ where: { email: req.user.email } });
      if (supplier) {
        where.supplierId = supplier.id;
      } else {
        return res.json({ success: true, data: { purchaseOrders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } });
      }
    }

    const { rows: purchaseOrders, count } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        {
          model: StockRequest,
          as: 'stockRequest',
          attributes: ['id', 'requestNumber', 'reason', 'priority']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'fullName', 'username']
        },
        {
          model: User,
          as: 'receivedBy',
          attributes: ['id', 'fullName', 'username'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create purchase order from stock request
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { stockRequestId, supplierId, unitPrice, deliveryDate, notes } = req.body;
    const createdById = req.user.id;

    // Get stock request details
    const stockRequest = await StockRequest.findByPk(stockRequestId, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!stockRequest) {
      return res.status(404).json({ success: false, message: 'Stock request not found' });
    }

    if (stockRequest.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Stock request must be approved first' });
    }

    // Check if PO already exists for this stock request
    const existingPO = await PurchaseOrder.findOne({ where: { stockRequestId } });
    if (existingPO) {
      return res.status(400).json({ success: false, message: 'Purchase order already exists for this stock request' });
    }

    // Generate PO number
    const count = await PurchaseOrder.count();
    const poNumber = `PO${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

    // Set default values for draft orders
    const purchaseOrderData = {
      poNumber,
      stockRequestId,
      supplierId,
      createdById,
      productId: stockRequest.productId,
      quantity: stockRequest.requestedQuantity,
      unitPrice: unitPrice || null, // Explicitly set to null for draft orders
      totalAmount: null, // Will be calculated when unitPrice is set
      deliveryDate: deliveryDate || null, // Allow null for draft orders
      notes,
      status: 'draft'
    };

    const purchaseOrder = await PurchaseOrder.create(purchaseOrderData);

    // Get created PO with includes
    const createdPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        { model: StockRequest, as: 'stockRequest' },
        { model: Supplier, as: 'supplier' },
        { model: Product, as: 'product' },
        { model: User, as: 'createdBy' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: createdPO
    });
  } catch (error) {
    console.error('Purchase Order Creation Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send purchase order to supplier
exports.sendPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft purchase orders can be sent' });
    }

    await purchaseOrder.update({ status: 'sent' });

    // TODO: Send email notification to supplier

    res.json({
      success: true,
      message: 'Purchase order sent to supplier successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supplier confirms purchase order
exports.confirmPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierNotes, estimatedDeliveryDate } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'sent') {
      return res.status(400).json({ success: false, message: 'Purchase order must be sent first' });
    }

    const updateData = {
      status: 'confirmed',
      supplierConfirmedAt: new Date()
    };

    if (supplierNotes) updateData.supplierNotes = supplierNotes;
    if (estimatedDeliveryDate) updateData.deliveryDate = estimatedDeliveryDate;

    await purchaseOrder.update(updateData);

    res.json({
      success: true,
      message: 'Purchase order confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supplier marks as shipped
exports.markAsShipped = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, shippingNotes } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Purchase order must be confirmed first' });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updateData = {
      status: 'shipped',
      shippedAt: new Date(),
      shippingImages: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (shippingNotes) updateData.supplierNotes = shippingNotes;

    await purchaseOrder.update(updateData);

    res.json({
      success: true,
      message: 'Purchase order marked as shipped successfully',
      data: {
        trackingNumber: trackingNumber,
        shippingNotes: shippingNotes,
        images: imageUrls
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Warehouse staff confirms receipt
exports.confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      receivedQuantity: receivedQuantityRaw, 
      qualityStatus, 
      packagingCondition, 
      deliveryNotes, 
      warehouseLocation, 
      inspectionDate 
    } = req.body;
    
    // Convert receivedQuantity to number to prevent concatenation
    const receivedQuantity = Number(receivedQuantityRaw) || 0;
    console.log(`🔧 Converting receivedQuantity: "${receivedQuantityRaw}" → ${receivedQuantity}`);
    const receivedById = req.user.id;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' },
        { model: StockRequest, as: 'stockRequest' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'shipped') {
      return res.status(400).json({ success: false, message: 'Purchase order must be shipped first' });
    }

    // Validate received quantity
    if (receivedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Received quantity must be greater than 0' });
    }

    const quantityVariance = receivedQuantity - purchaseOrder.quantity;
    const isShortage = quantityVariance < 0;
    const shortageQuantity = Math.abs(quantityVariance);

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Create detailed receipt notes (without images - images are stored separately)
    const receiptDetails = {
      orderedQuantity: purchaseOrder.quantity,
      receivedQuantity: receivedQuantity,
      qualityStatus: qualityStatus,
      packagingCondition: packagingCondition,
      warehouseLocation: warehouseLocation,
      inspectionDate: inspectionDate,
      deliveryNotes: deliveryNotes,
      quantityVariance: quantityVariance,
      isShortage: isShortage,
      shortageQuantity: isShortage ? shortageQuantity : 0,
      receivedBy: req.user.fullName,
      receivedAt: new Date().toISOString()
    };

    // Update purchase order
    await purchaseOrder.update({
      status: isShortage ? 'partial_received' : 'completed',
      receivedById,
      receivedAt: new Date(),
      receivedQuantity,
      receiptImages: JSON.stringify(imageUrls),
      notes: JSON.stringify(receiptDetails)
    });

    let responseData = {
      receivedQuantity: receivedQuantity,
      orderedQuantity: purchaseOrder.quantity,
      quantityVariance: quantityVariance,
      qualityStatus: qualityStatus,
      packagingCondition: packagingCondition,
      warehouseLocation: warehouseLocation,
      isShortage: isShortage,
      shortageQuantity: isShortage ? shortageQuantity : 0,
      images: imageUrls
    };

    // **XỬ LÝ TRƯỜNG HỢP THIẾU HÀNG**
    if (isShortage && shortageQuantity > 0) {
      // Tạo đơn đặt hàng bổ sung cho số lượng thiếu
      const count = await PurchaseOrder.count();
      const supplementPONumber = `PO${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}-SUP`;

      const supplementPO = await PurchaseOrder.create({
        poNumber: supplementPONumber,
        stockRequestId: purchaseOrder.stockRequestId,
        supplierId: purchaseOrder.supplierId,
        createdById: receivedById,
        productId: purchaseOrder.productId,
        quantity: shortageQuantity,
        unitPrice: purchaseOrder.unitPrice,
        totalAmount: shortageQuantity * (purchaseOrder.unitPrice || 0),
        deliveryDate: purchaseOrder.deliveryDate,
        notes: `Đơn bổ sung cho PO ${purchaseOrder.poNumber} - Thiếu ${shortageQuantity} sản phẩm`,
        status: 'draft',
        parentOrderId: purchaseOrder.id // Link to original order
      });

      // Tự động gửi đơn bổ sung cho nhà cung cấp
      await supplementPO.update({ status: 'sent' });

      responseData.supplementOrder = {
        id: supplementPO.id,
        poNumber: supplementPO.poNumber,
        quantity: shortageQuantity,
        status: 'sent'
      };

      // TODO: Send email thông báo cho nhà cung cấp về đơn bổ sung
      console.log(`📧 Sending supplement order ${supplementPONumber} to supplier ${purchaseOrder.supplier.companyName}`);
    }

    // Update stock request status
    if (!isShortage) {
      await StockRequest.update(
        { status: 'completed' },
        { where: { id: purchaseOrder.stockRequestId } }
      );
    }

    // Prepare response message
    let message = `Confirmed nhận hàng. Nhận được ${receivedQuantity} sản phẩm`;
    
    if (imageUrls.length > 0) {
      message += `. Đã lưu ${imageUrls.length} hình ảnh hàng hóa`;
    }
    
    if (isShortage) {
      message += `. ⚠️ THIẾU ${shortageQuantity} sản phẩm - Đã tự động tạo đơn bổ sung ${responseData.supplementOrder?.poNumber} và gửi cho nhà cung cấp`;
    } else if (quantityVariance > 0) {
      message += ` (Nhận thêm ${quantityVariance} sản phẩm so với đặt hàng)`;
    }

    // Add quality status to message
    const qualityMessages = {
      excellent: 'Chất lượng tuyệt vời',
      good: 'Chất lượng tốt',
      acceptable: 'Chất lượng chấp nhận được',
      poor: 'Chất lượng kém - cần theo dõi',
      rejected: 'Chất lượng không đạt - cần xử lý'
    };

    if (qualityStatus && qualityMessages[qualityStatus]) {
      message += `. ${qualityMessages[qualityStatus]}`;
    }

    res.json({
      success: true,
      message: message,
      data: responseData
    });
  } catch (error) {
    console.error('Receipt confirmation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supplier handles supplement order (for shortage)
exports.handleSupplementOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, estimatedDeliveryDate, supplierNotes } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' },
        { model: StockRequest, as: 'stockRequest' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    // Verify this is a supplement order and supplier has access
    if (!purchaseOrder.poNumber.includes('-SUP')) {
      return res.status(400).json({ success: false, message: 'This is not a supplement order' });
    }

    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ where: { email: req.user.email } });
      if (!supplier || supplier.id !== purchaseOrder.supplierId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'confirm':
        if (purchaseOrder.status !== 'sent') {
          return res.status(400).json({ success: false, message: 'Order must be in sent status' });
        }
        updateData = {
          status: 'confirmed',
          supplierConfirmedAt: new Date(),
          deliveryDate: estimatedDeliveryDate,
          supplierNotes: supplierNotes
        };
        message = 'Confirmed đơn bổ sung. Sẽ giao hàng theo lịch trình.';
        break;

      case 'ship':
        if (purchaseOrder.status !== 'confirmed') {
          return res.status(400).json({ success: false, message: 'Order must be confirmed first' });
        }
        updateData = {
          status: 'shipped',
          shippedAt: new Date(),
          supplierNotes: supplierNotes
        };
        message = 'Sent hàng bổ sung. Đang trên đường giao đến kho.';
        break;

      case 'reject':
        updateData = {
          status: 'cancelled',
          supplierNotes: supplierNotes || 'Supplier từ chối đơn bổ sung'
        };
        message = 'Rejected đơn bổ sung.';
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await purchaseOrder.update(updateData);

    res.json({
      success: true,
      message: message,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Supplement order handling error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get supplement orders for supplier
exports.getSupplementOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      poNumber: {
        [Op.like]: '%-SUP'
      }
    };

    if (status) where.status = status;

    // If user is supplier, only show their orders
    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ where: { email: req.user.email } });
      if (supplier) {
        where.supplierId = supplier.id;
      } else {
        return res.json({ success: true, data: { supplementOrders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } });
      }
    }

    const { rows: supplementOrders, count } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        {
          model: StockRequest,
          as: 'stockRequest',
          attributes: ['id', 'requestNumber', 'reason', 'priority']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        supplementOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get supplement orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Warehouse staff rejects delivery due to quality issues
exports.rejectDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      rejectionReason, 
      qualityIssues, 
      packagingIssues, 
      quantityIssues,
      rejectionNotes,
      requestReplacement 
    } = req.body;
    const rejectedById = req.user.id;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' },
        { model: StockRequest, as: 'stockRequest' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'shipped') {
      return res.status(400).json({ success: false, message: 'Can only reject shipped orders' });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Create detailed rejection notes (without images - images are stored separately)
    const rejectionDetails = {
      rejectedBy: req.user.fullName,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionReason,
      qualityIssues: qualityIssues,
      packagingIssues: packagingIssues,
      quantityIssues: quantityIssues,
      rejectionNotes: rejectionNotes,
      requestReplacement: requestReplacement || false,
      orderedQuantity: purchaseOrder.quantity,
      supplierInfo: {
        companyName: purchaseOrder.supplier.companyName,
        contactPerson: purchaseOrder.supplier.contactPerson,
        email: purchaseOrder.supplier.email
      }
    };

    // Update purchase order status
    await purchaseOrder.update({
      status: 'rejected',
      rejectedById,
      rejectedAt: new Date(),
      rejectionImages: JSON.stringify(imageUrls),
      notes: JSON.stringify(rejectionDetails)
    });

    let responseData = {
      rejectionReason: rejectionReason,
      qualityIssues: qualityIssues,
      packagingIssues: packagingIssues,
      quantityIssues: quantityIssues,
      rejectionNotes: rejectionNotes,
      requestReplacement: requestReplacement,
      images: imageUrls
    };

    // If replacement is requested, create a replacement order
    if (requestReplacement) {
      const count = await PurchaseOrder.count();
      const replacementPONumber = `PO${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}-REP`;

      const replacementPO = await PurchaseOrder.create({
        poNumber: replacementPONumber,
        stockRequestId: purchaseOrder.stockRequestId,
        supplierId: purchaseOrder.supplierId,
        createdById: rejectedById,
        productId: purchaseOrder.productId,
        quantity: purchaseOrder.quantity,
        unitPrice: purchaseOrder.unitPrice,
        totalAmount: purchaseOrder.quantity * (purchaseOrder.unitPrice || 0),
        deliveryDate: purchaseOrder.deliveryDate,
        notes: `Đơn thay thế cho PO ${purchaseOrder.poNumber} - Bị từ chối do: ${rejectionReason}`,
        status: 'draft',
        parentOrderId: purchaseOrder.id // Link to rejected order
      });

      // Auto-send replacement order to supplier
      await replacementPO.update({ status: 'sent' });

      responseData.replacementOrder = {
        id: replacementPO.id,
        poNumber: replacementPO.poNumber,
        quantity: replacementPO.quantity,
        status: 'sent'
      };

      console.log(`📧 Sending replacement order ${replacementPONumber} to supplier ${purchaseOrder.supplier.companyName}`);
    }

    // Prepare response message
    let message = `Rejected nhận hàng do: ${rejectionReason}`;
    
    if (imageUrls.length > 0) {
      message += `. Đã lưu ${imageUrls.length} hình ảnh minh chứng`;
    }
    
    if (requestReplacement) {
      message += `. Đã tự động tạo đơn thay thế ${responseData.replacementOrder?.poNumber} và gửi cho nhà cung cấp`;
    }

    res.json({
      success: true,
      message: message,
      data: responseData
    });
  } catch (error) {
    console.error('Delivery rejection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supplier confirms replacement for rejected order
exports.confirmReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { estimatedDeliveryDate, supplierNotes } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Can only confirm replacement for rejected orders' });
    }

    // Update order status to confirmed for replacement
    await purchaseOrder.update({
      status: 'confirmed',
      supplierConfirmedAt: new Date(),
      deliveryDate: estimatedDeliveryDate,
      supplierNotes: supplierNotes
    });

    res.json({
      success: true,
      message: 'Confirmed sẽ bổ sung hàng thay thế',
      data: {
        estimatedDeliveryDate,
        supplierNotes
      }
    });
  } catch (error) {
    console.error('Confirm replacement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supplier ships replacement for rejected order
exports.shipReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, supplierNotes } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'rejected' && purchaseOrder.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Can only ship replacement for rejected or confirmed orders' });
    }

    // Update order status to shipped
    await purchaseOrder.update({
      status: 'shipped',
      shippedAt: new Date(),
      trackingNumber: trackingNumber,
      supplierNotes: supplierNotes
    });

    res.json({
      success: true,
      message: 'Delivered hàng thay thế',
      data: {
        trackingNumber,
        supplierNotes,
        shippedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Ship replacement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: StockRequest,
          as: 'stockRequest',
          include: [
            { model: User, as: 'requestedBy', attributes: ['id', 'fullName'] }
          ]
        },
        { model: Supplier, as: 'supplier' },
        { model: Product, as: 'product' },
        { model: User, as: 'createdBy', attributes: ['id', 'fullName'] },
        { model: User, as: 'receivedBy', attributes: ['id', 'fullName'], required: false }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, data: purchaseOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};