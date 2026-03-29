const { sequelize } = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const Product = require('./Product');
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Delivery = require('./Delivery');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Payment = require('./Payment');
const Notification = require('./Notification');
const StockRequest = require('./StockRequest');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');

// User - Customer relationships
User.hasMany(Customer, { foreignKey: 'assignedSalesId', as: 'assignedCustomers' });
Customer.belongsTo(User, { foreignKey: 'assignedSalesId', as: 'assignedSales' });

// User - Quotation relationships
User.hasMany(Quotation, { foreignKey: 'salesPersonId', as: 'quotations' });
Quotation.belongsTo(User, { foreignKey: 'salesPersonId', as: 'salesPerson' });

// Customer - Quotation relationships
Customer.hasMany(Quotation, { foreignKey: 'customerId', as: 'quotations' });
Quotation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Quotation - QuotationItem relationships
Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'quotationItems', onDelete: 'CASCADE' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

// Product - QuotationItem relationships
Product.hasMany(QuotationItem, { foreignKey: 'productId', as: 'quotationItems' });
QuotationItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User - Order relationships
User.hasMany(Order, { foreignKey: 'salesPersonId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'salesPersonId', as: 'salesPerson' });

// Customer - Order relationships
Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Quotation - Order relationships
Quotation.hasOne(Order, { foreignKey: 'quotationId', as: 'order' });
Order.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

// Order - OrderItem relationships
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product - OrderItem relationships
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order approval relationships
User.hasMany(Order, { foreignKey: 'approvedById', as: 'approvedOrders' });
Order.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });

// Order - Delivery relationships
Order.hasMany(Delivery, { foreignKey: 'orderId', as: 'deliveries' });
Delivery.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User - Delivery relationships
User.hasMany(Delivery, { foreignKey: 'deliveryStaffId', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'deliveryStaffId', as: 'deliveryStaff' });

// Order - Invoice relationships
Order.hasMany(Invoice, { foreignKey: 'orderId', as: 'invoices' });
Invoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Customer - Invoice relationships
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Invoice - InvoiceItem relationships
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'invoiceItems', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Product - InvoiceItem relationships
Product.hasMany(InvoiceItem, { foreignKey: 'productId', as: 'invoiceItems' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Invoice - Payment relationships
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// User - Payment relationships
User.hasMany(Payment, { foreignKey: 'createdBy', as: 'paymentsCreated' });
Payment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Notification relationships
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User created relationships
User.hasMany(User, { foreignKey: 'createdBy', as: 'createdUsers' });
User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// StockRequest relationships
User.hasMany(StockRequest, { foreignKey: 'requestedById', as: 'stockRequests' });
StockRequest.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });

User.hasMany(StockRequest, { foreignKey: 'approvedById', as: 'approvedStockRequests' });
StockRequest.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });

Product.hasMany(StockRequest, { foreignKey: 'productId', as: 'stockRequests' });
StockRequest.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// PurchaseOrder relationships
StockRequest.hasOne(PurchaseOrder, { foreignKey: 'stockRequestId', as: 'purchaseOrder' });
PurchaseOrder.belongsTo(StockRequest, { foreignKey: 'stockRequestId', as: 'stockRequest' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

User.hasMany(PurchaseOrder, { foreignKey: 'createdById', as: 'createdPurchaseOrders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(PurchaseOrder, { foreignKey: 'receivedById', as: 'receivedPurchaseOrders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });

Product.hasMany(PurchaseOrder, { foreignKey: 'productId', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Customer,
  Product,
  Quotation,
  QuotationItem,
  Order,
  OrderItem,
  Delivery,
  Invoice,
  InvoiceItem,
  Payment,
  Notification,
  StockRequest,
  Supplier,
  PurchaseOrder
};
