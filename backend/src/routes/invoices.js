const express = require('express');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getInvoicePayments,
  updateStatus
} = require('../controllers/invoiceController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/payments', getInvoicePayments);
router.post('/', roleCheck(['admin', 'accountant', 'sales_manager']), createInvoice);
router.put('/:id', roleCheck(['admin', 'accountant']), updateInvoice);
router.delete('/:id', roleCheck(['admin', 'accountant']), deleteInvoice);
router.post('/:id/payment', roleCheck(['admin', 'accountant']), recordPayment);
router.patch('/:id/status', roleCheck(['admin', 'accountant']), updateStatus);

module.exports = router;
