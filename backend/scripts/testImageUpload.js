const { sequelize } = require('../src/config/database');
const { PurchaseOrder, Product, Supplier, User, StockRequest } = require('../src/models');

async function createTestOrderWithImages() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connected');

    // Find existing data
    const product = await Product.findOne();
    const supplier = await Supplier.findOne();
    const user = await User.findOne({ where: { role: 'warehouse_staff' } });
    const stockRequest = await StockRequest.findOne();

    if (!product || !supplier || !user || !stockRequest) {
      console.log('❌ Missing required data. Need product, supplier, user, and stock request');
      return;
    }

    // Create a test purchase order
    const poNumber = `PO${Date.now()}`;
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      stockRequestId: stockRequest.id,
      supplierId: supplier.id,
      createdById: user.id,
      productId: product.id,
      quantity: 10,
      unitPrice: 100000,
      totalAmount: 1000000,
      deliveryDate: new Date(),
      status: 'shipped'
    });

    console.log(`✅ Created test purchase order: ${poNumber}`);

    // Simulate receipt with images
    const testImageUrls = [
      '/uploads/test-image-1.jpg',
      '/uploads/test-image-2.jpg'
    ];

    const receiptDetails = {
      orderedQuantity: 10,
      receivedQuantity: 10,
      qualityStatus: 'good',
      packagingCondition: 'intact',
      warehouseLocation: 'Kệ A1-B2',
      inspectionDate: new Date().toISOString().split('T')[0],
      deliveryNotes: 'Hàng hóa đạt chất lượng tốt, không có vấn đề gì',
      quantityVariance: 0,
      isShortage: false,
      shortageQuantity: 0,
      receivedBy: user.fullName,
      receivedAt: new Date().toISOString(),
      images: testImageUrls
    };

    await purchaseOrder.update({
      status: 'completed',
      receivedById: user.id,
      receivedAt: new Date(),
      receivedQuantity: 10,
      receiptImages: JSON.stringify(testImageUrls),
      notes: JSON.stringify(receiptDetails)
    });

    console.log('✅ Updated order with receipt images');
    console.log('📸 Receipt images:', testImageUrls);

    // Create another order for rejection test
    const poNumber2 = `PO${Date.now() + 1}`;
    const purchaseOrder2 = await PurchaseOrder.create({
      poNumber: poNumber2,
      stockRequestId: stockRequest.id,
      supplierId: supplier.id,
      createdById: user.id,
      productId: product.id,
      quantity: 5,
      unitPrice: 150000,
      totalAmount: 750000,
      deliveryDate: new Date(),
      status: 'shipped'
    });

    console.log(`✅ Created second test purchase order: ${poNumber2}`);

    // Simulate rejection with images
    const rejectionImageUrls = [
      '/uploads/rejection-image-1.jpg',
      '/uploads/rejection-image-2.jpg'
    ];

    const rejectionDetails = {
      rejectedBy: user.fullName,
      rejectedAt: new Date().toISOString(),
      rejectionReason: 'quality_issues',
      qualityIssues: ['defective', 'damaged'],
      packagingIssues: ['torn'],
      quantityIssues: 'Thiếu 2 sản phẩm',
      rejectionNotes: 'Sản phẩm bị lỗi và bao bì rách, không đạt yêu cầu chất lượng',
      requestReplacement: true,
      orderedQuantity: 5,
      images: rejectionImageUrls,
      supplierInfo: {
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        email: supplier.email
      }
    };

    await purchaseOrder2.update({
      status: 'rejected',
      rejectedById: user.id,
      rejectedAt: new Date(),
      rejectionImages: JSON.stringify(rejectionImageUrls),
      notes: JSON.stringify(rejectionDetails)
    });

    console.log('✅ Updated second order with rejection images');
    console.log('🚫 Rejection images:', rejectionImageUrls);

    console.log('\n📋 Test orders created:');
    console.log(`1. ${poNumber} - Status: completed (with receipt images)`);
    console.log(`2. ${poNumber2} - Status: rejected (with rejection images)`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestOrderWithImages();