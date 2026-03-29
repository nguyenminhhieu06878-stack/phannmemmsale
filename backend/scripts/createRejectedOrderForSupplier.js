const { sequelize, PurchaseOrder, Supplier, Product, User } = require('../src/models');

async function createRejectedOrderForSupplier() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find DEF Hardware supplier
    const defSupplier = await Supplier.findOne({
      where: { companyName: 'Công ty TNHH Phần cứng DEF' }
    });

    if (!defSupplier) {
      console.log('❌ DEF Hardware supplier not found');
      return;
    }

    console.log('🏢 Found supplier:', defSupplier.companyName);

    // Find admin user to create the order
    const admin = await User.findOne({ where: { role: 'admin' } });

    // Create a rejected order for DEF Hardware
    const rejectedPO = await PurchaseOrder.create({
      poNumber: 'PO-REJECTED-DEF-001',
      stockRequestId: '3d8f1fd9-21d2-40ee-bf55-30ca81d143f7',
      supplierId: defSupplier.id,
      createdById: admin.id,
      productId: '23d73558-0731-459f-9e82-cb2a96f2c288',
      quantity: 15,
      unitPrice: 150000,
      totalAmount: 2250000,
      status: 'rejected',
      deliveryDate: new Date('2026-03-30'),
      rejectedAt: new Date(),
      rejectedById: admin.id,
      notes: JSON.stringify({
        rejectedBy: 'Phạm Thị Warehouse',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'quality_issues',
        qualityIssues: ['defective', 'poor_quality'],
        packagingIssues: ['torn', 'wet'],
        rejectionNotes: 'Sản phẩm không đạt chất lượng, bao bì hư hỏng nghiêm trọng',
        requestReplacement: true
      })
    });

    console.log('✅ Created rejected order:', rejectedPO.poNumber);

    // Create replacement order automatically
    const replacementPO = await PurchaseOrder.create({
      poNumber: 'PO-REP-DEF-001',
      stockRequestId: '3d8f1fd9-21d2-40ee-bf55-30ca81d143f7',
      supplierId: defSupplier.id,
      createdById: admin.id,
      productId: '23d73558-0731-459f-9e82-cb2a96f2c288',
      quantity: 15,
      unitPrice: 150000,
      totalAmount: 2250000,
      status: 'sent',
      deliveryDate: new Date('2026-04-05'),
      parentOrderId: rejectedPO.id,
      notes: `Đơn thay thế cho ${rejectedPO.poNumber} - Bị từ chối do vấn đề chất lượng`
    });

    console.log('✅ Created replacement order:', replacementPO.poNumber);

    // List all orders for DEF Hardware
    const allOrders = await PurchaseOrder.findAll({
      where: { supplierId: defSupplier.id },
      attributes: ['poNumber', 'status', 'parentOrderId'],
      order: [['createdAt', 'DESC']]
    });

    console.log('\n📦 All orders for DEF Hardware:');
    allOrders.forEach(order => {
      const isReplacement = order.parentOrderId ? ' (Replacement)' : '';
      console.log(`  ${order.poNumber}: ${order.status}${isReplacement}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createRejectedOrderForSupplier();