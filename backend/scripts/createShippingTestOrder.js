const { sequelize } = require('../src/config/database');
const { PurchaseOrder, Product, Supplier, User, StockRequest } = require('../src/models');

async function createShippingTestOrder() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connected');

    // Tìm dữ liệu cần thiết
    const product = await Product.findOne();
    const supplier = await Supplier.findOne();
    const user = await User.findOne({ where: { role: 'director' } });
    const stockRequest = await StockRequest.findOne();

    if (!product || !supplier || !user || !stockRequest) {
      console.log('❌ Thiếu dữ liệu cần thiết');
      return;
    }

    // Tạo đơn hàng đã xác nhận để có thể giao hàng
    const poNumber = `PO${Date.now()}`;
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      stockRequestId: stockRequest.id,
      supplierId: supplier.id,
      createdById: user.id,
      productId: product.id,
      quantity: 10,
      unitPrice: 250000,
      totalAmount: 2500000,
      deliveryDate: new Date(),
      status: 'confirmed', // Trạng thái đã xác nhận để có thể giao hàng
      supplierConfirmedAt: new Date()
    });

    console.log(`✅ Tạo đơn hàng thành công: ${poNumber}`);
    console.log('📋 Trạng thái: confirmed (sẵn sàng để giao hàng)');
    console.log('🚚 Nhà cung cấp có thể click "Giao hàng" và upload hình ảnh');
    
    console.log('\n📝 Hướng dẫn test:');
    console.log('1. Đăng nhập bằng tài khoản supplier (abcsupplier/123456)');
    console.log('2. Vào trang Đơn đặt hàng');
    console.log(`3. Tìm đơn hàng ${poNumber}`);
    console.log('4. Click nút "Giao hàng"');
    console.log('5. Upload hình ảnh hàng hóa đã chuẩn bị');
    console.log('6. Nhập mã vận đơn và ghi chú');
    console.log('7. Xác nhận giao hàng');
    console.log('8. Xem chi tiết đơn hàng để thấy hình ảnh đã upload');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createShippingTestOrder();