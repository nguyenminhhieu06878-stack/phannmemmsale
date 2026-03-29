const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const authenticateToken = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');
const { uploadImages } = require('../middlewares/upload');

// Get all purchase orders
router.get('/', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'director', 'warehouse_staff', 'supplier']),
  purchaseOrderController.getAllPurchaseOrders
);

// Get supplement orders (for suppliers) - MUST be before /:id route
router.get('/supplements', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  purchaseOrderController.getSupplementOrders
);

// Create purchase order from stock request
router.post('/', 
  authenticateToken, 
  roleCheck(['admin', 'director']),
  purchaseOrderController.createPurchaseOrder
);

// Get purchase order by ID
router.get('/:id', 
  authenticateToken, 
  roleCheck(['admin', 'sales_manager', 'director', 'warehouse_staff', 'supplier']),
  purchaseOrderController.getPurchaseOrderById
);

// Send purchase order to supplier
router.put('/:id/send', 
  authenticateToken, 
  roleCheck(['admin', 'director']),
  purchaseOrderController.sendPurchaseOrder
);

// Supplier confirms purchase order
router.put('/:id/confirm', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  purchaseOrderController.confirmPurchaseOrder
);

// Supplier marks as shipped
router.put('/:id/ship', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  uploadImages,
  purchaseOrderController.markAsShipped
);

// Warehouse staff confirms receipt
router.put('/:id/receive', 
  authenticateToken, 
  roleCheck(['admin', 'warehouse_staff']),
  uploadImages,
  purchaseOrderController.confirmReceipt
);

// Warehouse staff rejects delivery due to quality issues
router.put('/:id/reject', 
  authenticateToken, 
  roleCheck(['admin', 'warehouse_staff']),
  uploadImages,
  purchaseOrderController.rejectDelivery
);

// Handle supplement order (supplier actions)
router.put('/:id/supplement', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  purchaseOrderController.handleSupplementOrder
);

// Confirm replacement for rejected order
router.put('/:id/confirm-replacement', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  purchaseOrderController.confirmReplacement
);

// Ship replacement for rejected order
router.put('/:id/ship-replacement', 
  authenticateToken, 
  roleCheck(['admin', 'supplier']),
  purchaseOrderController.shipReplacement
);

module.exports = router;