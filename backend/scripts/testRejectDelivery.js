const { sequelize, PurchaseOrder, StockRequest, Supplier, Product, User } = require('../src/models');

async function testRejectDelivery() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find an existing purchase order or create one for testing
    let purchaseOrder = await PurchaseOrder.findOne({
      where: { status: 'shipped' },
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    if (!purchaseOrder) {
      console.log('📦 No shipped purchase order found. Creating test data...');
      
      // Create test data
      const supplier = await Supplier.findOne();
      const product = await Product.findOne();
      const user = await User.findOne({ where: { role: 'director' } });
      
      if (!supplier || !product || !user) {
        console.log('❌ Missing test data (supplier, product, or user)');
        return;
      }

      // Create a stock request first
      const stockRequest = await StockRequest.create({
        requestNumber: `SR${Date.now()}`,
        productId: product.id,
        requestedQuantity: 10,
        currentStock: product.stock,
        minStockLevel: product.minStock,
        reason: 'Test rejection workflow',
        priority: 'medium',
        requestedById: user.id,
        status: 'approved'
      });

      // Create purchase order
      purchaseOrder = await PurchaseOrder.create({
        poNumber: `PO${Date.now()}`,
        stockRequestId: stockRequest.id,
        supplierId: supplier.id,
        createdById: user.id,
        productId: product.id,
        quantity: 10,
        unitPrice: 100000,
        totalAmount: 1000000,
        status: 'shipped'
      });

      // Reload with includes
      purchaseOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
        include: [
          { model: Product, as: 'product' },
          { model: Supplier, as: 'supplier' }
        ]
      });

      console.log(`✅ Created test purchase order: ${purchaseOrder.poNumber}`);
    }

    console.log(`🧪 Testing rejection for PO: ${purchaseOrder.poNumber}`);
    console.log(`   Product: ${purchaseOrder.product.name}`);
    console.log(`   Supplier: ${purchaseOrder.supplier.companyName}`);
    console.log(`   Status: ${purchaseOrder.status}`);

    // Test rejection data
    const rejectionData = {
      rejectionReason: 'quality_issues',
      qualityIssues: ['defective', 'damaged'],
      packagingIssues: ['torn', 'wet'],
      quantityIssues: 'Thiếu 2 sản phẩm',
      rejectionNotes: 'Sản phẩm bị hư hỏng nghiêm trọng, bao bì rách và ướt. Không thể sử dụng được.',
      requestReplacement: true
    };

    // Find a warehouse staff user for testing
    const warehouseUser = await User.findOne({ where: { role: 'warehouse_staff' } });
    if (!warehouseUser) {
      console.log('❌ No warehouse staff user found for testing');
      return;
    }

    console.log(`👤 Testing with warehouse user: ${warehouseUser.fullName}`);

    // Simulate the rejection process
    console.log('🔄 Simulating rejection process...');
    
    // Create detailed rejection notes
    const rejectionDetails = {
      rejectedBy: warehouseUser.fullName,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionData.rejectionReason,
      qualityIssues: rejectionData.qualityIssues,
      packagingIssues: rejectionData.packagingIssues,
      quantityIssues: rejectionData.quantityIssues,
      rejectionNotes: rejectionData.rejectionNotes,
      requestReplacement: rejectionData.requestReplacement,
      orderedQuantity: purchaseOrder.quantity,
      supplierInfo: {
        companyName: purchaseOrder.supplier.companyName,
        contactPerson: purchaseOrder.supplier.contactPerson,
        email: purchaseOrder.supplier.email
      }
    };

    // Update purchase order status
    await purchaseOrder.update({
      status: 'rejected',
      rejectedById: warehouseUser.id,
      rejectedAt: new Date(),
      notes: JSON.stringify(rejectionDetails)
    });

    console.log('✅ Purchase order rejected successfully');

    // Create replacement order if requested
    if (rejectionData.requestReplacement) {
      const count = await PurchaseOrder.count();
      const replacementPONumber = `PO${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}-REP`;

      const replacementPO = await PurchaseOrder.create({
        poNumber: replacementPONumber,
        stockRequestId: purchaseOrder.stockRequestId,
        supplierId: purchaseOrder.supplierId,
        createdById: warehouseUser.id,
        productId: purchaseOrder.productId,
        quantity: purchaseOrder.quantity,
        unitPrice: purchaseOrder.unitPrice,
        totalAmount: purchaseOrder.quantity * purchaseOrder.unitPrice,
        deliveryDate: purchaseOrder.deliveryDate,
        notes: `Đơn thay thế cho PO ${purchaseOrder.poNumber} - Bị từ chối do: ${rejectionData.rejectionReason}`,
        status: 'sent', // Auto-send to supplier
        parentOrderId: purchaseOrder.id
      });

      console.log(`✅ Created replacement order: ${replacementPO.poNumber}`);
      console.log(`   Status: ${replacementPO.status}`);
      console.log(`   Parent order: ${purchaseOrder.poNumber}`);
    }

    // Verify the results
    const updatedPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'rejectedBy', attributes: ['id', 'fullName'], required: false }
      ]
    });

    console.log('\n📊 Final Results:');
    console.log(`   Original PO: ${updatedPO.poNumber}`);
    console.log(`   Status: ${updatedPO.status}`);
    console.log(`   Rejected by: ${updatedPO.rejectedBy?.fullName || 'N/A'}`);
    console.log(`   Rejected at: ${updatedPO.rejectedAt || 'N/A'}`);
    
    if (updatedPO.notes) {
      try {
        const rejectionInfo = JSON.parse(updatedPO.notes);
        console.log(`   Rejection reason: ${rejectionInfo.rejectionReason}`);
        console.log(`   Quality issues: ${rejectionInfo.qualityIssues?.join(', ') || 'None'}`);
        console.log(`   Packaging issues: ${rejectionInfo.packagingIssues?.join(', ') || 'None'}`);
      } catch (e) {
        console.log(`   Notes: ${updatedPO.notes}`);
      }
    }

    // Check for replacement orders
    const replacementOrders = await PurchaseOrder.findAll({
      where: { parentOrderId: purchaseOrder.id },
      attributes: ['id', 'poNumber', 'status', 'createdAt']
    });

    if (replacementOrders.length > 0) {
      console.log('\n🔄 Replacement Orders:');
      replacementOrders.forEach(order => {
        console.log(`   - ${order.poNumber} (${order.status})`);
      });
    }

    console.log('\n🎉 Rejection workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testRejectDelivery();