const { StockRequest, Product, User, PurchaseOrder } = require('../models');
const { Op } = require('sequelize');

// Get all stock requests
exports.getAllStockRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const { rows: stockRequests, count } = await StockRequest.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock']
        },
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'fullName', 'username', 'role']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'fullName', 'username'],
          required: false
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'poNumber', 'status', 'supplierId'],
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
        stockRequests,
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

// Create stock request
exports.createStockRequest = async (req, res) => {
  try {
    const { productId, requestedQuantity, reason, priority = 'medium' } = req.body;
    const requestedById = req.user.id;

    // Get product info
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Generate request number
    const count = await StockRequest.count();
    const requestNumber = `SR${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

    const stockRequest = await StockRequest.create({
      requestNumber,
      productId,
      requestedById,
      requestedQuantity,
      currentStock: product.stock,
      reason,
      priority
    });

    // Get the created request with includes
    const createdRequest = await StockRequest.findByPk(stockRequest.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock']
        },
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'fullName', 'username', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Stock request created successfully',
      data: createdRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stock request status
exports.updateStockRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvalNotes } = req.body;
    const approvedById = req.user.id;

    const stockRequest = await StockRequest.findByPk(id);
    if (!stockRequest) {
      return res.status(404).json({ success: false, message: 'Stock request not found' });
    }

    const updateData = { status };
    
    if (status === 'approved' || status === 'rejected') {
      updateData.approvedById = approvedById;
      updateData.approvedAt = new Date();
      if (approvalNotes) updateData.approvalNotes = approvalNotes;
    }

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await stockRequest.update(updateData);

    // Get updated request with includes
    const updatedRequest = await StockRequest.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock']
        },
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'fullName', 'username', 'role']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'fullName', 'username'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: 'Stock request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stock request by ID
exports.getStockRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productCode', 'stock', 'minStock', 'category']
        },
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'fullName', 'username', 'role']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'fullName', 'username'],
          required: false
        }
      ]
    });

    if (!stockRequest) {
      return res.status(404).json({ success: false, message: 'Stock request not found' });
    }

    res.json({ success: true, data: stockRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete stock request
exports.deleteStockRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findByPk(id);
    if (!stockRequest) {
      return res.status(404).json({ success: false, message: 'Stock request not found' });
    }

    // Only allow deletion if status is pending
    if (stockRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete stock request that is not pending' 
      });
    }

    await stockRequest.destroy();

    res.json({
      success: true,
      message: 'Stock request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};