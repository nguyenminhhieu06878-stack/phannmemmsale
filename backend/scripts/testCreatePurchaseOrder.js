const { sequelize, User, StockRequest, PurchaseOrder } = require('../src/models');
const jwt = require('jsonwebtoken');

async function testCreatePurchaseOrder() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find director user
    const director = await User.findOne({ where: { role: 'director' } });
    if (!director) {
      console.log('❌ Director user not found');
      return;
    }
    console.log('👤 Director user found:', director.id, director.fullName);

    // Create test token
    const payload = {
      id: director.id,
      username: director.username,
      role: director.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🔑 Test token created');

    // Find approved stock request
    const stockRequest = await StockRequest.findOne({ 
      where: { status: 'approved' },
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          required: false
        }
      ]
    });

    if (!stockRequest) {
      console.log('❌ No approved stock request found');
      return;
    }

    console.log('📋 Stock request found:', stockRequest.requestNumber);
    console.log('📦 Has purchase order:', stockRequest.purchaseOrder ? 'Yes' : 'No');

    if (!stockRequest.purchaseOrder) {
      console.log('✅ Button should be visible - no purchase order exists');
    } else {
      console.log('❌ Button should be hidden - purchase order exists');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  testCreatePurchaseOrder();
}

module.exports = { testCreatePurchaseOrder };