const express = require('express');
const {
  getSalesReport,
  getRevenueReport,
  getCustomerReport,
  getProductReport,
  getSalesPerformance,
  getDashboardStats
} = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/sales', roleCheck(['admin', 'sales_manager', 'director', 'accountant']), getSalesReport);
router.get('/revenue', roleCheck(['admin', 'sales_manager', 'director', 'accountant']), getRevenueReport);
router.get('/customers', roleCheck(['admin', 'sales_manager', 'director', 'accountant']), getCustomerReport);
router.get('/products', roleCheck(['admin', 'sales_manager', 'warehouse_staff', 'accountant']), getProductReport);
router.get('/sales-performance', roleCheck(['admin', 'sales_manager', 'director', 'accountant']), getSalesPerformance);
router.get('/dashboard', getDashboardStats);

module.exports = router;
