const { 
  sequelize, 
  Order, 
  OrderItem, 
  Customer, 
  Product, 
  User, 
  Quotation, 
  QuotationItem,
  Invoice,
  InvoiceItem,
  Payment,
  Delivery,
  Notification,
  PurchaseOrder, 
  StockRequest,
  Supplier
} = require('../src/models');

async function clearAllData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Clear in proper order to avoid foreign key constraints
    console.log('🗑️ Clearing all data...');

    // Clear dependent tables first
    await Payment.destroy({ where: {}, truncate: true });
    console.log('   ✓ Payments cleared');

    await InvoiceItem.destroy({ where: {}, truncate: true });
    console.log('   ✓ Invoice items cleared');

    await Invoice.destroy({ where: {}, truncate: true });
    console.log('   ✓ Invoices cleared');

    await Delivery.destroy({ where: {}, truncate: true });
    console.log('   ✓ Deliveries cleared');

    await OrderItem.destroy({ where: {}, truncate: true });
    console.log('   ✓ Order items cleared');

    await Order.destroy({ where: {}, truncate: true });
    console.log('   ✓ Orders cleared');

    await QuotationItem.destroy({ where: {}, truncate: true });
    console.log('   ✓ Quotation items cleared');

    await Quotation.destroy({ where: {}, truncate: true });
    console.log('   ✓ Quotations cleared');

    await PurchaseOrder.destroy({ where: {}, truncate: true });
    console.log('   ✓ Purchase orders cleared');

    await StockRequest.destroy({ where: {}, truncate: true });
    console.log('   ✓ Stock requests cleared');

    await Notification.destroy({ where: {}, truncate: true });
    console.log('   ✓ Notifications cleared');

    // Clear master data
    await Customer.destroy({ where: {}, truncate: true });
    console.log('   ✓ Customers cleared');

    await Product.destroy({ where: {}, truncate: true });
    console.log('   ✓ Products cleared');

    await Supplier.destroy({ where: {}, truncate: true });
    console.log('   ✓ Suppliers cleared');

    // Clear users except admin
    await User.destroy({ 
      where: { 
        username: { [sequelize.Sequelize.Op.ne]: 'admin' }
      }
    });
    console.log('   ✓ Users cleared (except admin)');

    console.log('\n✅ All data cleared successfully!');
    console.log('📋 Database is now empty and ready for fresh testing');
    console.log('💡 Only admin user remains for system access');

  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

clearAllData();