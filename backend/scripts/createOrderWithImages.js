const { sequelize } = require('../src/config/database');
const { PurchaseOrder, Product, Supplier, User, StockRequest } = require('../src/models');

async function createOrderWithImages() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connected');

    // Tìm dữ liệu cần thiết
    const product = await Product.findOne();
    const supplier = await Supplier.findOne();
    const user = await User.findOne({ where: { role: 'warehouse_staff' } });
    const stockRequest = await StockRequest.findOne();

    if (!product || !supplier || !user || !stockRequest) {
      console.log('❌ Thiếu dữ liệu cần thiết');
      return;
    }

    // Tạo đơn hàng mới với hình ảnh từ chối
    const poNumber = `PO${Date.now()}`;
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      stockRequestId: stockRequest.id,
      supplierId: supplier.id,
      createdById: user.id,
      productId: product.id,
      quantity: 5,
      unitPrice: 200000,
      totalAmount: 1000000,
      deliveryDate: new Date(),
      status: 'rejected',
      rejectedById: user.id,
      rejectedAt: new Date(),
      rejectionImages: JSON.stringify([
        '/uploads/test-image-1.jpg',
        '/uploads/test-image-2.jpg'
      ]),
      notes: JSON.stringify({
        rejectedBy: user.fullName,
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'quality_issues',
        qualityIssues: ['defective', 'damaged'],
        packagingIssues: ['torn'],
        quantityIssues: 'Thiếu 1 sản phẩm',
        rejectionNotes: 'Sản phẩm bị lỗi nghiêm trọng, bao bì rách, không đạt yêu cầu chất lượng',
        requestReplacement: true,
        orderedQuantity: 5,
        supplierInfo: {
          companyName: supplier.companyName,
          contactPerson: supplier.contactPerson,
          email: supplier.email
        }
      })
    });

    console.log(`✅ Tạo đơn hàng thành công: ${poNumber}`);
    console.log('🚫 Đơn hàng có hình ảnh từ chối');
    console.log('📸 Hình ảnh:', ['/uploads/test-image-1.jpg', '/uploads/test-image-2.jpg']);
    
    // Tạo thêm một đơn hàng hoàn thành với hình ảnh nhận hàng
    const poNumber2 = `PO${Date.now() + 1}`;
    const purchaseOrder2 = await PurchaseOrder.create({
      poNumber: poNumber2,
      stockRequestId: stockRequest.id,
      supplierId: supplier.id,
      createdById: user.id,
      productId: product.id,
      quantity: 8,
      unitPrice: 150000,
      totalAmount: 1200000,
      deliveryDate: new Date(),
      status: 'completed',
      receivedById: user.id,
      receivedAt: new Date(),
      receivedQuantity: 8,
      receiptImages: JSON.stringify([
        '/uploads/test-image-1.jpg',
        '/uploads/test-image-2.jpg'
      ]),
      notes: JSON.stringify({
        orderedQuantity: 8,
        receivedQuantity: 8,
        qualityStatus: 'good',
        packagingCondition: 'intact',
        warehouseLocation: 'Kệ B1-C2',
        inspectionDate: new Date().toISOString().split('T')[0],
        deliveryNotes: 'Hàng hóa đạt chất lượng tốt, đóng gói cẩn thận',
        quantityVariance: 0,
        isShortage: false,
        shortageQuantity: 0,
        receivedBy: user.fullName,
        receivedAt: new Date().toISOString()
      })
    });

    console.log(`✅ Tạo đơn hàng thành công: ${poNumber2}`);
    console.log('📦 Đơn hàng có hình ảnh nhận hàng');
    
    console.log('\n📋 Danh sách đơn hàng để test:');
    console.log(`1. ${poNumber} - Bị từ chối (có hình ảnh từ chối)`);
    console.log(`2. ${poNumber2} - Hoàn thành (có hình ảnh nhận hàng)`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createOrderWithImages();