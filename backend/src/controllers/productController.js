const { Product } = require('../models');
const { Op } = require('sequelize');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
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

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure numeric fields are properly converted
    const updateData = { ...req.body };
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock) || 0;
      console.log(`🔧 Converting stock: ${req.body.stock} → ${updateData.stock}`);
    }
    if (updateData.minStock !== undefined) {
      updateData.minStock = Number(updateData.minStock) || 0;
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price) || 0;
    }
    if (updateData.cost !== undefined) {
      updateData.cost = Number(updateData.cost) || 0;
    }

    await product.update(updateData);

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log(`🗑️ Attempting to delete product with ID: ${req.params.id}`);
    
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log(`🔍 Found product: ${product.name}`);
    
    // Check if product is being used in any orders, quotations, invoices, etc.
    const { QuotationItem, OrderItem, InvoiceItem, StockRequest, PurchaseOrder } = require('../models');
    
    const [quotationItems, orderItems, invoiceItems, stockRequests, purchaseOrders] = await Promise.all([
      QuotationItem.count({ where: { productId: req.params.id } }),
      OrderItem.count({ where: { productId: req.params.id } }),
      InvoiceItem.count({ where: { productId: req.params.id } }),
      StockRequest.count({ where: { productId: req.params.id } }),
      PurchaseOrder.count({ where: { productId: req.params.id } })
    ]);

    const totalReferences = quotationItems + orderItems + invoiceItems + stockRequests + purchaseOrders;
    
    if (totalReferences > 0) {
      console.log(`❌ Product is being used in ${totalReferences} records`);
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete this product because it is being used in ${totalReferences} records (quotations, orders, invoices, stock requests, purchase orders)` 
      });
    }
    
    await product.destroy();
    
    console.log('✅ Product deleted successfully');

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity, type } = req.body; // type: 'add', 'subtract', or 'set'
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure quantity is a number
    const quantityNum = Number(quantity) || 0;
    console.log(`🔧 Stock update: ${product.stock} → ${type} ${quantityNum}`);

    let newStock;
    if (type === 'set') {
      newStock = quantityNum;
    } else if (type === 'add') {
      newStock = product.stock + quantityNum;
    } else if (type === 'subtract') {
      newStock = product.stock - quantityNum;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid operation type' });
    }

    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    await product.update({ stock: newStock });
    
    // Reload product to get updated data
    await product.reload();

    res.json({ 
      success: true, 
      data: product,
      message: `Stock updated from ${product.stock} to ${newStock}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
