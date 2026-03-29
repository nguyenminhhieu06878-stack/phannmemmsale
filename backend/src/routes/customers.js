const express = require('express');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', roleCheck(['admin', 'sales_manager', 'sales_staff']), createCustomer);
router.put('/:id', roleCheck(['admin', 'sales_manager', 'sales_staff']), updateCustomer);
router.delete('/:id', roleCheck(['admin', 'sales_manager']), deleteCustomer);

module.exports = router;
