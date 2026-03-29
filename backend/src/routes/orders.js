const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  approveOrder,
  updateStatus,
  completeWithImages,
  fixOrderItemCalculations
} = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');
const { uploadImages } = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', roleCheck(['admin', 'sales_manager', 'sales_staff']), createOrder);
router.put('/:id', roleCheck(['admin', 'sales_manager', 'sales_staff']), updateOrder);
router.delete('/:id', roleCheck(['admin', 'sales_manager']), deleteOrder);
router.post('/:id/approve', roleCheck(['admin', 'sales_manager', 'director']), approveOrder);
router.patch('/:id/status', roleCheck(['admin', 'sales_manager', 'warehouse_staff']), updateStatus);
router.patch('/:id/complete', roleCheck(['admin', 'warehouse_staff']), uploadImages, completeWithImages);
router.post('/:id/fix-calculations', roleCheck(['admin']), fixOrderItemCalculations);

module.exports = router;
