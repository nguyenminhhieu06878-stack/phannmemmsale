const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authenticateToken = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

// Get all suppliers
router.get('/', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'director', 'warehouse_staff']),
  supplierController.getAllSuppliers
);

// Create supplier
router.post('/', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager']),
  supplierController.createSupplier
);

// Get supplier by ID
router.get('/:id', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'director', 'supplier']),
  supplierController.getSupplierById
);

// Update supplier
router.put('/:id', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager']),
  supplierController.updateSupplier
);

// Delete supplier
router.delete('/:id', 
  authenticateToken, 
  roleCheck(['admin']),
  supplierController.deleteSupplier
);

module.exports = router;