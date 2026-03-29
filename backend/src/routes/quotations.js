const express = require('express');
const {
  getAllQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updateStatus,
  convertToOrder,
  fixQuotationItemCalculations
} = require('../controllers/quotationController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.post('/', roleCheck(['admin', 'sales_manager', 'sales_staff']), createQuotation);
router.put('/:id', roleCheck(['admin', 'sales_manager', 'sales_staff']), updateQuotation);
router.delete('/:id', roleCheck(['admin', 'sales_manager']), deleteQuotation);
router.patch('/:id/status', roleCheck(['admin', 'sales_manager']), updateStatus);
router.post('/:id/convert-to-order', roleCheck(['admin', 'sales_manager']), convertToOrder);
router.post('/:id/fix-calculations', roleCheck(['admin']), fixQuotationItemCalculations);

module.exports = router;
