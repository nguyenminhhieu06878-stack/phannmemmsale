const { Supplier, PurchaseOrder, Product } = require('../models');
const { Op } = require('sequelize');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, supplierType, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { supplierCode: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } }
      ];
    }
    if (supplierType) where.supplierType = supplierType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { rows: suppliers, count } = await Supplier.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        suppliers,
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

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplierData = req.body;

    // Generate supplier code if not provided
    if (!supplierData.supplierCode) {
      const count = await Supplier.count();
      supplierData.supplierCode = `SUP${String(count + 1).padStart(4, '0')}`;
    }

    const supplier = await Supplier.create(supplierData);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrders',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'productCode']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await supplier.update(updateData);

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Check if supplier has active purchase orders
    const activePOs = await PurchaseOrder.count({
      where: {
        supplierId: id,
        status: { [Op.in]: ['sent', 'confirmed', 'shipped'] }
      }
    });

    if (activePOs > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with active purchase orders'
      });
    }

    await supplier.destroy();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};