const { sequelize } = require('../src/config/database');
const { PurchaseOrder } = require('../src/models');

async function clearPurchaseOrders() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🗑️  Clearing all purchase orders...');
    
    const deletedCount = await PurchaseOrder.destroy({
      where: {},
      truncate: true
    });

    console.log(`✅ Deleted ${deletedCount} purchase orders`);
    
    // Check remaining count
    const remainingCount = await PurchaseOrder.count();
    console.log(`📊 Remaining purchase orders: ${remainingCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  clearPurchaseOrders();
}

module.exports = { clearPurchaseOrders };