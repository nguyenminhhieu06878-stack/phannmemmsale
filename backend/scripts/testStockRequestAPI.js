const { sequelize, User } = require('../src/models');
const jwt = require('jsonwebtoken');

async function testStockRequestAPI() {
  try {
    console.log('🔄 Testing Stock Request API...');
    await sequelize.authenticate();

    // Find director user
    const director = await User.findOne({ where: { role: 'director' } });
    if (!director) {
      console.log('❌ Director user not found');
      return;
    }

    // Create test token
    const payload = {
      id: director.id,
      username: director.username,
      role: director.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🔑 Token created for:', director.fullName);
    console.log('📋 Use this token to test API:');
    console.log(token);
    console.log('\n🧪 Test command:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5001/api/stock-requests`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  testStockRequestAPI();
}

module.exports = { testStockRequestAPI };