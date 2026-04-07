const { User, Product, StockRequest } = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const createStockRequests = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    console.log('📦 Creating stock requests...');

    // Get existing users and products
    const warehouse = await User.findOne({ where: { username: 'warehouse' } });
    const admin = await User.findOne({ where: { username: 'admin' } });
    const products = await Product.findAll({ limit: 5 });

    if (!warehouse || !admin || products.length === 0) {
      console.log('❌ Please ensure users and products exist first!');
      process.exit(1);
    }

    // Create stock requests
    const stockRequests = [
      {
        requestNumber: 'SR2026001',
        productId: products[0].id,
        currentStock: products[0].stock,
        requestedQuantity: 20,
        priority: 'high',
        reason: 'Stock level is below minimum threshold. Need to replenish for upcoming orders.',
        status: 'pending',
        requestedById: warehouse.id
      },
      {
        requestNumber: 'SR2026002',
        productId: products[1].id,
        currentStock: products[1].stock,
        requestedQuantity: 15,
        priority: 'medium',
        reason: 'Preparing for seasonal demand increase.',
        status: 'approved',
        requestedById: warehouse.id,
        approvedById: admin.id,
        approvalNotes: 'Approved for seasonal preparation'
      }
    ];

    if (products.length > 2) {
      stockRequests.push({
        requestNumber: 'SR2026003',
        productId: products[2].id,
        currentStock: products[2].stock,
        requestedQuantity: 10,
        priority: 'urgent',
        reason: 'Critical stock shortage. Customer orders pending.',
        status: 'pending',
        requestedById: warehouse.id
      });
    }

    for (const requestData of stockRequests) {
      const [stockRequest, created] = await StockRequest.findOrCreate({
        where: { requestNumber: requestData.requestNumber },
        defaults: requestData
      });

      if (created) {
        console.log(`✅ Created: ${requestData.requestNumber}`);
      } else {
        console.log(`⚠️  Stock request ${requestData.requestNumber} already exists, skipping...`);
      }
    }

    console.log('🎉 Stock requests created successfully!');
    
    // Show summary
    const totalRequests = await StockRequest.count();
    console.log(`📊 Total stock requests in database: ${totalRequests}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating stock requests:', error);
    process.exit(1);
  }
};

createStockRequests();