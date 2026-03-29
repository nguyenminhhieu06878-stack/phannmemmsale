const { sequelize } = require('../src/config/database');
const { StockRequest } = require('../src/models');

async function clearStockRequests() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🗑️  Clearing all stock requests...');
    
    const deletedCount = await StockRequest.destroy({
      where: {},
      truncate: true
    });

    console.log(`✅ Deleted ${deletedCount} stock requests`);
    
    // Check remaining count
    const remainingCount = await StockRequest.count();
    console.log(`📊 Remaining stock requests: ${remainingCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  clearStockRequests();
}

module.exports = { clearStockRequests };