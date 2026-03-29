const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { roleCheck, ROLES } = require('../middlewares/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', roleCheck(['admin', 'sales_manager']), getAllUsers);
router.get('/:id', getUserById);
router.post('/', roleCheck(['admin']), createUser);
router.put('/:id', roleCheck(['admin']), updateUser);
router.delete('/:id', roleCheck(['admin']), deleteUser);
router.put('/:id/change-password', changePassword);

module.exports = router;
