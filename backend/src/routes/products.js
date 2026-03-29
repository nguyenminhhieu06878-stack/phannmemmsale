const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', roleCheck(['admin', 'sales_manager', 'warehouse_staff']), createProduct);
router.put('/:id', roleCheck(['admin', 'sales_manager', 'warehouse_staff']), updateProduct);
router.delete('/:id', roleCheck(['admin', 'sales_manager']), deleteProduct);
router.patch('/:id/stock', roleCheck(['admin', 'warehouse_staff']), updateStock);

module.exports = router;
