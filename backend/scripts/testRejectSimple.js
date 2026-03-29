const { sequelize, PurchaseOrder, User } = require('../src/models');

async function testRejectSimple() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the existing purchase order
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { poNumber: 'PO20260001' },
      include: [
        { model: require('../src/models').Product, as: 'product' },
        { model: require('../src/models').Supplier, as: 'supplier' }
      ]
    });

    if (!purchaseOrder) {
      console.log('❌ Purchase order PO20260001 not found');
      return;
    }

    console.log(`🧪 Testing rejection for PO: ${purchaseOrder.poNumber}`);
    console.log(`   Status: ${purchaseOrder.status}`);

    // Find a warehouse staff user
    const warehouseUser = await User.findOne({ 
      where: { role: 'warehouse_staff' } 
    });
    
    if (!warehouseUser) {
      console.log('❌ No warehouse staff user found');
      return;
    }

    console.log(`👤 Using warehouse user: ${warehouseUser.fullName}`);

    // Test rejection data
    const rejectionData = {
      rejectionReason: 'quality_issues',
      qualityIssues: ['defective', 'damaged'],
      packagingIssues: ['torn', 'wet'],
      quantityIssues: 'Thiếu 2 sản phẩm',
      rejectionNotes: 'Sản phẩm bị hư hỏng nghiêm trọng, không thể sử dụng được.',
      requestReplacement: true
    };

    // Create rejection details
    const rejectionDetails = {
      rejectedBy: warehouseUser.fullName,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionData.rejectionReason,
      qualityIssues: rejectionData.qualityIssues,
      packagingIssues: rejectionData.packagingIssues,
      quantityIssues: rejectionData.quantityIssues,
      rejectionNotes: rejectionData.rejectionNotes,
      requestReplacement: rejectionData.requestReplacement,
      orderedQuantity: purchaseOrder.quantity
    };

    console.log('🔄 Rejecting purchase order...');

    // Update purchase order to rejected status
    await purchaseOrder.update({
      status: 'rejected',
      rejectedById: warehouseUser.id,
      rejectedAt: new Date(),
      notes: JSON.stringify(rejectionDetails)
    });

    console.log('✅ Purchase order rejected successfully');

    // Create replacement order if requested
    if (rejectionData.requestReplacement) {
      console.log('🔄 Creating replacement order...');
      
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
        status: 'sent',
        parentOrderId: purchaseOrder.id
      });

      console.log(`✅ Created replacement order: ${replacementPO.poNumber}`);
    }

    // Verify results
    const updatedPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        { model: User, as: 'rejectedBy', attributes: ['fullName'], required: false }
      ]
    });

    console.log('\n📊 Final Results:');
    console.log(`   PO: ${updatedPO.poNumber}`);
    console.log(`   Status: ${updatedPO.status}`);
    console.log(`   Rejected by: ${updatedPO.rejectedBy?.fullName || 'N/A'}`);
    console.log(`   Rejected at: ${updatedPO.rejectedAt}`);

    // Check for replacement orders
    const replacementOrders = await PurchaseOrder.findAll({
      where: { parentOrderId: purchaseOrder.id }
    });

    if (replacementOrders.length > 0) {
      console.log('\n🔄 Replacement Orders:');
      replacementOrders.forEach(order => {
        console.log(`   - ${order.poNumber} (${order.status})`);
      });
    }

    console.log('\n🎉 Rejection test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testRejectSimple();