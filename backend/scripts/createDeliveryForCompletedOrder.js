const { sequelize } = require('../src/config/database');
const { Order, Delivery, Customer } = require('../src/models');

async function createDeliveryForCompletedOrder() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connected');

    // Tìm đơn hàng đã hoàn thành
    const order = await Order.findOne({
      where: { 
        orderNumber: 'ORD1774691487070',
        status: 'completed'
      },
      include: [
        { model: Customer, as: 'customer' }
      ]
    });

    if (!order) {
      console.log('❌ Không tìm thấy đơn hàng hoàn thành');
      return;
    }

    console.log(`📋 Found completed order: ${order.orderNumber}`);
    console.log(`📸 Preparation images: ${order.preparationImages ? 'Có' : 'Không'}`);

    // Kiểm tra xem đã có delivery chưa
    const existingDelivery = await Delivery.findOne({
      where: { orderId: order.id }
    });

    if (existingDelivery) {
      console.log('✅ Delivery đã tồn tại:', existingDelivery.id);
      return;
    }

    // Tạo delivery record
    const delivery = await Delivery.create({
      orderId: order.id,
      deliveryDate: new Date(),
      deliveryAddress: typeof order.customer.address === 'string' 
        ? order.customer.address 
        : 'Địa chỉ khách hàng',
      status: 'pending',
      notes: `Đơn hàng ${order.orderNumber} đã được chuẩn bị xong, sẵn sàng giao hàng`,
      trackingNumber: `DEL${Date.now()}`
    });

    console.log(`✅ Tạo delivery thành công: ${delivery.id}`);
    console.log('📦 Trạng thái: pending (chờ giao)');
    console.log('🚚 Bên giao hàng có thể xem hình ảnh chuẩn bị từ nhân viên kho');
    
    console.log('\n📝 Hướng dẫn test:');
    console.log('1. Vào trang "Giao hàng" (Deliveries)');
    console.log(`2. Tìm đơn giao hàng cho order ${order.orderNumber}`);
    console.log('3. Click "Chi tiết" để xem hình ảnh chuẩn bị từ nhân viên kho');
    console.log('4. Bên giao hàng sẽ thấy hàng đã được chuẩn bị đầy đủ');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createDeliveryForCompletedOrder();