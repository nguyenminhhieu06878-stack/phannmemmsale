const express = require('express');
const router = express.Router();
const stockRequestController = require('../controllers/stockRequestController');
const authenticateToken = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

// Get all stock requests
router.get('/', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'warehouse_staff', 'director']),
  stockRequestController.getAllStockRequests
);

// Create stock request
router.post('/', 
  authenticateToken, 
  roleCheck(['warehouse_staff', 'admin']),
  stockRequestController.createStockRequest
);

// Get stock request by ID
router.get('/:id', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'warehouse_staff', 'director']),
  stockRequestController.getStockRequestById
);

// Update stock request status (approve/reject/complete)
router.put('/:id/status', 
  authenticateToken, 
  roleCheck(['admin', 'director']),
  stockRequestController.updateStockRequestStatus
);

// Delete stock request
router.delete('/:id', 
  authenticateToken, 
  roleCheck(['admin', 'warehouse_staff']),
  stockRequestController.deleteStockRequest
);

module.exports = router;