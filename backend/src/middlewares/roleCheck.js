const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Printsufficient permissions.'
      });
    }

    next();
  };
};

// Predefined role groups
const ROLES = {
  ADMIN: ['admin'],
  SALES_MANAGER: ['admin', 'sales_manager'],
  SALES_STAFF: ['admin', 'sales_manager', 'sales_staff'],
  CUSTOMER_SERVICE: ['admin', 'sales_manager', 'customer_service'],
  WAREHOUSE: ['admin', 'warehouse_staff'],
  ACCOUNTANT: ['admin', 'accountant'],
  DELIVERY: ['admin', 'delivery_staff'],
  DIRECTOR: ['admin', 'director'],
  ALL_STAFF: ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'warehouse_staff', 'accountant', 'delivery_staff', 'director']
};

module.exports = {
  roleCheck,
  ROLES
};