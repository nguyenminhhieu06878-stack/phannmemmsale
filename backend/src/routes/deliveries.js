const express = require('express');
const {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  updateStatus,
  updateStatusWithImages
} = require('../controllers/deliveryController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');
const { uploadImages } = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllDeliveries);
router.get('/:id', getDeliveryById);
router.post('/', roleCheck(['admin', 'sales_manager', 'warehouse_staff']), createDelivery);
router.put('/:id', roleCheck(['admin', 'delivery_staff', 'warehouse_staff']), updateDelivery);
router.delete('/:id', roleCheck(['admin', 'sales_manager']), deleteDelivery);

// Debug route to check user role
router.get('/debug/user', (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Current user info'
  });
});

router.patch('/:id/status', roleCheck(['admin', 'delivery_staff']), updateStatus);
router.patch('/:id/status-with-images', roleCheck(['admin', 'delivery_staff']), uploadImages, updateStatusWithImages);

module.exports = router;
