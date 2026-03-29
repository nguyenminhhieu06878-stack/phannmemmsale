const axios = require('axios');
const { sequelize, User, PurchaseOrder } = require('../src/models');

async function testRejectAPI() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get a warehouse staff user for authentication
    const warehouseUser = await User.findOne({ 
      where: { role: 'warehouse_staff' } 
    });
    
    if (!warehouseUser) {
      console.log('❌ No warehouse staff user found');
      return;
    }

    console.log(`👤 Using warehouse user: ${warehouseUser.fullName}`);

    // First, let's create a test token (simulate login)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: warehouseUser.id, 
        username: warehouseUser.username, 
        role: warehouseUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated test token');

    // Create a test purchase order in shipped status
    const testPO = await PurchaseOrder.create({
      poNumber: `TEST-PO-${Date.now()}`,
      stockRequestId: '3295e22b-5c80-4b3b-9848-f16f5b5aecd4', // Use existing stock request
      supplierId: '3295e22b-5c80-4b3b-9848-f16f5b5aecd4', // Use existing supplier
      createdById: warehouseUser.id,
      productId: '3295e22b-5c80-4b3b-9848-f16f5b5aecd4', // Use existing product
      quantity: 5,
      unitPrice: 50000,
      totalAmount: 250000,
      status: 'shipped'
    });

    console.log(`📦 Created test PO: ${testPO.poNumber}`);

    // Test the rejection API
    const rejectionData = {
      rejectionReason: 'quality_issues',
      qualityIssues: ['defective', 'scratched'],
      packagingIssues: ['torn'],
      quantityIssues: 'Thiếu 1 sản phẩm',
      rejectionNotes: 'API test - Sản phẩm không đạt chất lượng yêu cầu',
      requestReplacement: true
    };

    console.log('🧪 Testing rejection API...');

    try {
      const response = await axios.put(
        `http://localhost:5001/api/purchase-orders/${testPO.id}/reject`,
        rejectionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ API Response:', response.data);

      // Verify the results
      const updatedPO = await PurchaseOrder.findByPk(testPO.id);
      console.log('\\n📊 Updated PO Status:', updatedPO.status);
      
      if (updatedPO.notes) {
        const rejectionDetails = JSON.parse(updatedPO.notes);
        console.log('📋 Rejection Details Saved:');
        console.log('  Reason:', rejectionDetails.rejectionReason);
        console.log('  Quality Issues:', rejectionDetails.qualityIssues?.join(', '));
        console.log('  Notes:', rejectionDetails.rejectionNotes);
      }

      // Check for replacement order
      const replacementOrders = await PurchaseOrder.findAll({
        where: { parentOrderId: testPO.id }
      });

      if (replacementOrders.length > 0) {
        console.log('\\n🔄 Replacement Orders Created:');
        replacementOrders.forEach(order => {
          console.log(`  - ${order.poNumber} (${order.status})`);
        });
      }

      console.log('\\n🎉 API test completed successfully!');

    } catch (apiError) {
      console.error('❌ API Error:', apiError.response?.data || apiError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testRejectAPI();