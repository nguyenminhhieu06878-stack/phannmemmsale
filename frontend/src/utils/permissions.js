// Role-based permission utility functions

export const ROLES = {
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  SALES_STAFF: 'sales_staff',
  CUSTOMER_SERVICE: 'customer_service',
  WAREHOUSE_STAFF: 'warehouse_staff',
  ACCOUNTANT: 'accountant',
  DELIVERY_STAFF: 'delivery_staff',
  DIRECTOR: 'director',
  SUPPLIER: 'supplier'
}

// Define permissions for each menu item
export const MENU_PERMISSIONS = {
  '/': ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'warehouse_staff', 'accountant', 'delivery_staff', 'director', 'supplier'], // Dashboard - all roles
  '/customers': ['admin', 'sales_manager', 'sales_staff', 'customer_service'], // Customer management
  '/products': ['admin', 'sales_manager', 'sales_staff', 'warehouse_staff'], // Product management
  '/quotations': ['admin', 'sales_manager', 'sales_staff'], // Quotation management
  '/orders': ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'warehouse_staff'], // Order management
  '/deliveries': ['admin', 'sales_manager', 'customer_service', 'warehouse_staff', 'delivery_staff'], // Delivery management
  '/invoices': ['admin', 'sales_manager', 'customer_service', 'accountant'], // Invoice management
  '/stock-requests': ['admin', 'sales_manager', 'warehouse_staff', 'director'], // Stock request management
  '/suppliers': ['admin', 'sales_manager', 'director'], // Supplier management
  '/purchase-orders': ['admin', 'sales_manager', 'director', 'warehouse_staff', 'supplier'], // Purchase order management
  '/reports': ['admin', 'sales_manager', 'accountant', 'director'], // Reports
  '/users': ['admin'] // User management - admin only
}

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SALES_MANAGER]: 'Sales Manager',
  [ROLES.SALES_STAFF]: 'Sales Staff',
  [ROLES.CUSTOMER_SERVICE]: 'Customer Service',
  [ROLES.WAREHOUSE_STAFF]: 'Warehouse Staff',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.DELIVERY_STAFF]: 'Delivery Staff',
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.SUPPLIER]: 'Supplier'
}

/**
 * Check if user has permission to access a specific menu item
 * @param {string} userRole - Current user's role
 * @param {string} menuKey - Menu item key (route path)
 * @returns {boolean} - Whether user has access
 */
export const hasMenuAccess = (userRole, menuKey) => {
  if (!userRole || !menuKey) return false
  
  const allowedRoles = MENU_PERMISSIONS[menuKey]
  if (!allowedRoles) return false
  
  return allowedRoles.includes(userRole)
}

/**
 * Filter menu items based on user role
 * @param {Array} menuItems - Array of menu items
 * @param {string} userRole - Current user's role
 * @returns {Array} - Filtered menu items
 */
export const filterMenuByRole = (menuItems, userRole) => {
  if (!userRole) return []
  
  return menuItems.filter(item => hasMenuAccess(userRole, item.key))
}

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string} - Display name in Vietnamese
 */
export const getRoleDisplayName = (role) => {
  if (!role) return 'Not defined'
  return ROLE_DISPLAY_NAMES[role] || role
}

/**
 * Check if user can perform specific actions
 * @param {string} userRole - Current user's role
 * @param {string} action - Action to check
 * @returns {boolean} - Whether user can perform action
 */
export const canPerformAction = (userRole, action) => {
  const permissions = {
    // Customer actions
    'customer.create': ['admin', 'sales_manager', 'sales_staff'],
    'customer.edit': ['admin', 'sales_manager', 'sales_staff', 'customer_service'],
    'customer.delete': ['admin', 'sales_manager'],
    'customer.view': ['admin', 'sales_manager', 'sales_staff', 'customer_service'],
    
    // Product actions
    'product.create': ['admin', 'sales_manager'],
    'product.edit': ['admin', 'sales_manager', 'warehouse_staff'],
    'product.delete': ['admin', 'sales_manager'],
    'product.view': ['admin', 'sales_manager', 'sales_staff', 'warehouse_staff'],
    
    // Quotation actions
    'quotation.create': ['admin', 'sales_manager', 'sales_staff'],
    'quotation.edit': ['admin', 'sales_manager', 'sales_staff'],
    'quotation.approve': ['admin', 'sales_manager'],
    'quotation.delete': ['admin', 'sales_manager'],
    'quotation.view': ['admin', 'sales_manager', 'sales_staff'],
    
    // Order actions
    'order.create': ['admin', 'sales_manager', 'sales_staff'],
    'order.edit': ['admin', 'sales_manager', 'sales_staff', 'customer_service'],
    'order.approve': ['admin', 'sales_manager'],
    'order.process': ['admin', 'warehouse_staff'],
    'order.complete': ['admin', 'warehouse_staff'],
    'order.delete': ['admin', 'sales_manager'],
    'order.view': ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'warehouse_staff'],
    
    // Invoice actions
    'invoice.create': ['admin', 'accountant'],
    'invoice.edit': ['admin', 'accountant'],
    'invoice.delete': ['admin'],
    'invoice.view': ['admin', 'sales_manager', 'customer_service', 'accountant'],
    
    // Delivery actions
    'delivery.create': ['admin', 'warehouse_staff'],
    'delivery.edit': ['admin', 'warehouse_staff', 'delivery_staff'],
    'delivery.view': ['admin', 'sales_manager', 'customer_service', 'warehouse_staff', 'delivery_staff'],
    
    // User management
    'user.create': ['admin'],
    'user.edit': ['admin'],
    'user.delete': ['admin'],
    'user.view': ['admin'],
    
    // Reports
    'report.sales': ['admin', 'sales_manager', 'director'],
    'report.financial': ['admin', 'accountant', 'director'],
    'report.inventory': ['admin', 'warehouse_staff', 'director'],
    'report.all': ['admin', 'director'],
    
    // Stock Request actions
    'stock_request.create': ['admin', 'warehouse_staff'],
    'stock_request.view': ['admin', 'sales_manager', 'warehouse_staff', 'director'],
    'stock_request.approve': ['admin', 'director'],
    'stock_request.delete': ['admin', 'warehouse_staff']
  }
  
  const allowedRoles = permissions[action]
  if (!allowedRoles) return false
  
  return allowedRoles.includes(userRole)
}