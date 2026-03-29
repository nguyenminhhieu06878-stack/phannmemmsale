const { sequelize } = require('../src/config/database');
const { Order, OrderItem, Customer, User, Product } = require('../src/models');

async function createOrderTest() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connected');

    // Tìm dữ liệu cần thiết
    const customer = await Customer.findOne();
    const salesPerson = await User.findOne({ where: { role: 'sales_staff' } });
    const product = await Product.findOne();

    if (!customer || !salesPerson || !product) {
      console.log('❌ Thiếu dữ liệu cần thiết');
      console.log('Customer:', !!customer);
      console.log('Sales person:', !!salesPerson);
      console.log('Product:', !!product);
      return;
    }

    // Tạo đơn hàng đang xử lý
    const orderNumber = `ORD${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      customerId: customer.id,
      salesPersonId: salesPerson.id,
      subtotal: 1000000,
      discountAmount: 0,
      taxAmount: 100000,
      totalAmount: 1100000,
      paymentMethod: 'cod_cash',
      status: 'processing', // Trạng thái đang xử lý để có thể hoàn thành
      notes: 'Đơn hàng test cho tính năng upload hình ảnh chuẩn bị hàng'
    });

    // Tạo order items
    await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      productSku: product.productCode,
      quantity: 2,
      unitPrice: 500000,
      discount: 0,
      subtotal: 1000000,
      discountAmount: 0,
      total: 1000000
    });

    console.log(`✅ Tạo đơn hàng thành công: ${orderNumber}`);
    console.log('📋 Trạng thái: processing (đang xử lý)');
    console.log('🏭 Nhân viên kho có thể click "Hoàn thành" và upload hình ảnh');
    
    console.log('\n📝 Hướng dẫn test:');
    console.log('1. Đăng nhập bằng tài khoản warehouse staff (warehouse/123456)');
    console.log('2. Vào trang Quản lý đơn hàng');
    console.log(`3. Tìm đơn hàng ${orderNumber}`);
    console.log('4. Click nút "Hoàn thành"');
    console.log('5. Upload hình ảnh hàng hóa đã chuẩn bị');
    console.log('6. Nhập ghi chú chuẩn bị hàng');
    console.log('7. Xác nhận hoàn thành');
    console.log('8. Xem chi tiết đơn hàng để thấy hình ảnh đã upload');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createOrderTest();