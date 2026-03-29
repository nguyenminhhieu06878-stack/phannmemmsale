const { 
  User, Customer, Product, Quotation, QuotationItem, 
  Order, OrderItem, Invoice, InvoiceItem, Payment, 
  Delivery, Notification 
} = require('../src/models');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data process...\n');

    // Get existing users
    const admin = await User.findOne({ where: { username: 'admin' } });
    const salesManager = await User.findOne({ where: { username: 'salesmanager' } });
    const salesStaff = await User.findOne({ where: { username: 'salesstaff' } });
    const accountant = await User.findOne({ where: { username: 'accountant' } });
    const warehouse = await User.findOne({ where: { username: 'warehouse' } });
    const delivery = await User.findOne({ where: { username: 'delivery' } });

    if (!admin || !salesManager || !salesStaff) {
      console.log('❌ Please run createDemoUsers.js first!');
      process.exit(1);
    }

    // 1. Create Products
    console.log('📦 Creating products...');
    const products = [];
    
    const product1 = await Product.findOrCreate({
      where: { productCode: 'LAP001' },
      defaults: {
        productCode: 'LAP001',
        name: 'Laptop Dell Inspiron 15 3000',
        description: 'Laptop văn phòng cơ bản, phù hợp cho công việc hàng ngày',
        category: 'Laptop',
        unit: 'chiếc',
        price: 15000000,
        cost: 12000000,
        stock: 50,
        minStock: 10,
        specifications: {
          cpu: 'Intel Core i5-1135G7',
          ram: '8GB DDR4',
          storage: '256GB SSD',
          display: '15.6 inch HD'
        }
      }
    });
    products.push(product1[0]);

    const product2 = await Product.findOrCreate({
      where: { productCode: 'LAP002' },
      defaults: {
        productCode: 'LAP002', 
        name: 'Laptop HP Pavilion 14',
        description: 'Laptop mỏng nhẹ, thiết kế đẹp',
        category: 'Laptop',
        unit: 'chiếc',
        price: 18000000,
        cost: 15000000,
        stock: 30,
        minStock: 5
      }
    });
    products.push(product2[0]);

    console.log(`✅ Created ${products.length} products`);
    // 2. Create Customers
    console.log('👥 Creating customers...');
    const customers = [];
    
    const customer1 = await Customer.findOrCreate({
      where: { customerCode: 'CUS001' },
      defaults: {
        customerCode: 'CUS001',
        companyName: 'Công ty TNHH ABC Technology',
        taxCode: '0123456789',
        address: {
          street: '123 Nguyễn Văn Linh',
          district: 'Quận 7',
          city: 'TP.HCM',
          country: 'Việt Nam'
        },
        phone: '0901234567',
        email: 'contact@abc-tech.com',
        customerType: 'vip',
        assignedSalesId: salesStaff.id,
        creditLimit: 100000000,
        contacts: [
          {
            name: 'Nguyễn Văn A',
            position: 'Giám đốc',
            phone: '0901234567',
            email: 'director@abc-tech.com'
          }
        ]
      }
    });
    customers.push(customer1[0]);

    const customer2 = await Customer.findOrCreate({
      where: { customerCode: 'CUS002' },
      defaults: {
        customerCode: 'CUS002',
        companyName: 'Công ty CP XYZ Solutions',
        taxCode: '0987654321',
        address: {
          street: '456 Lê Văn Việt',
          district: 'Quận 9',
          city: 'TP.HCM',
          country: 'Việt Nam'
        },
        phone: '0912345678',
        email: 'info@xyz-solutions.com',
        customerType: 'regular',
        assignedSalesId: salesStaff.id,
        creditLimit: 50000000
      }
    });
    customers.push(customer2[0]);

    console.log(`✅ Created ${customers.length} customers`);
    // 3. Create Orders
    console.log('🛒 Creating orders...');
    const orders = [];
    
    const order1 = await Order.findOrCreate({
      where: { orderNumber: 'ORD2026001' },
      defaults: {
        orderNumber: 'ORD2026001',
        customerId: customers[0].id,
        salesPersonId: salesStaff.id,
        approvedById: salesManager.id,
        subtotal: 30000000,
        discountAmount: 1500000,
        taxAmount: 2850000,
        totalAmount: 31350000,
        status: 'confirmed',
        paymentTerms: '30 ngày',
        notes: 'Đơn hàng laptop cho văn phòng - ưu tiên giao hàng'
      }
    });
    orders.push(order1[0]);

    // Create Order Items for order1
    const orderItem1 = await OrderItem.create({
      orderId: orders[0].id,
      productId: products[0].id,
      productName: products[0].name,
      productSku: products[0].productCode,
      quantity: 2,
      unitPrice: 15000000,
      discount: 0
    });

    const order2 = await Order.findOrCreate({
      where: { orderNumber: 'ORD2026002' },
      defaults: {
        orderNumber: 'ORD2026002',
        customerId: customers[1].id,
        salesPersonId: salesStaff.id,
        subtotal: 36000000,
        discountAmount: 720000,
        taxAmount: 3528000,
        totalAmount: 38808000,
        status: 'pending',
        paymentTerms: '15 ngày'
      }
    });
    orders.push(order2[0]);

    // Create Order Items for order2
    const orderItem2 = await OrderItem.create({
      orderId: orders[1].id,
      productId: products[1].id,
      productName: products[1].name,
      productSku: products[1].productCode,
      quantity: 2,
      unitPrice: 18000000,
      discount: 0
    });

    console.log(`✅ Created ${orders.length} orders with items`);
    // 4. Create Invoices
    console.log('🧾 Creating invoices...');
    const invoices = [];
    
    const invoice1 = await Invoice.findOrCreate({
      where: { invoiceNumber: 'INV2026001' },
      defaults: {
        invoiceNumber: 'INV2026001',
        orderId: orders[0].id,
        customerId: customers[0].id,
        subtotal: 30000000,
        discountAmount: 1500000,
        taxAmount: 2850000,
        totalAmount: 31350000,
        paidAmount: 31350000,
        remainingAmount: 0,
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: 'Hóa đơn đã thanh toán đầy đủ'
      }
    });
    invoices.push(invoice1[0]);

    const invoice2 = await Invoice.findOrCreate({
      where: { invoiceNumber: 'INV2026002' },
      defaults: {
        invoiceNumber: 'INV2026002',
        orderId: orders[1].id,
        customerId: customers[1].id,
        subtotal: 36000000,
        discountAmount: 720000,
        taxAmount: 3528000,
        totalAmount: 38808000,
        paidAmount: 20000000,
        remainingAmount: 18808000,
        status: 'partial',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: 'Đã thanh toán một phần, còn nợ 18,808,000 VNĐ'
      }
    });
    invoices.push(invoice2[0]);

    console.log(`✅ Created ${invoices.length} invoices`);

    // 5. Create Payments
    console.log('💰 Creating payments...');
    
    await Payment.findOrCreate({
      where: { paymentNumber: 'PAY2026001' },
      defaults: {
        invoiceId: invoices[0].id,
        paymentNumber: 'PAY2026001',
        amount: 31350000,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        referenceNumber: 'TXN123456789',
        notes: 'Thanh toán chuyển khoản đầy đủ',
        createdBy: accountant?.id
      }
    });

    await Payment.findOrCreate({
      where: { paymentNumber: 'PAY2026002' },
      defaults: {
        invoiceId: invoices[1].id,
        paymentNumber: 'PAY2026002',
        amount: 20000000,
        paymentMethod: 'cash',
        paymentDate: new Date(),
        referenceNumber: 'CASH001',
        notes: 'Thanh toán tiền mặt một phần',
        createdBy: accountant?.id
      }
    });

    console.log('✅ Created 2 payments');
    // 6. Create Deliveries
    console.log('🚚 Creating deliveries...');
    
    await Delivery.findOrCreate({
      where: { trackingNumber: 'DEL2026001' },
      defaults: {
        orderId: orders[0].id,
        deliveryDate: new Date(),
        deliveryAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        deliveryStaffId: delivery?.id,
        status: 'delivered',
        trackingNumber: 'DEL2026001',
        notes: 'Giao hàng thành công, khách hàng hài lòng',
        deliveredAt: new Date()
      }
    });

    await Delivery.findOrCreate({
      where: { trackingNumber: 'DEL2026002' },
      defaults: {
        orderId: orders[1].id,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        deliveryAddress: '456 Lê Văn Việt, Quận 9, TP.HCM',
        deliveryStaffId: delivery?.id,
        status: 'pending',
        trackingNumber: 'DEL2026002',
        notes: 'Đã lên lịch giao hàng'
      }
    });

    console.log('✅ Created 2 deliveries');

    // 7. Create Notifications
    console.log('🔔 Creating notifications...');
    
    await Notification.findOrCreate({
      where: { 
        userId: salesStaff.id,
        type: 'order_approved',
        title: 'Đơn hàng được phê duyệt'
      },
      defaults: {
        userId: salesStaff.id,
        type: 'order_approved',
        title: 'Đơn hàng được phê duyệt',
        message: `Đơn hàng ${orders[0].orderNumber} đã được phê duyệt bởi ${salesManager.fullName}`,
        link: `/orders/${orders[0].id}`,
        isRead: false
      }
    });

    await Notification.findOrCreate({
      where: { 
        userId: accountant?.id,
        type: 'payment_received',
        title: 'Nhận thanh toán'
      },
      defaults: {
        userId: accountant?.id,
        type: 'payment_received',
        title: 'Nhận thanh toán',
        message: `Đã nhận thanh toán 31,350,000 VNĐ cho hóa đơn ${invoices[0].invoiceNumber}`,
        link: `/invoices/${invoices[0].id}`,
        isRead: true,
        readAt: new Date()
      }
    });

    console.log('✅ Created 2 notifications');

    // Update product stock after orders
    await Product.update(
      { stock: 48 }, // 50 - 2 = 48
      { where: { id: products[0].id } }
    );
    await Product.update(
      { stock: 28 }, // 30 - 2 = 28
      { where: { id: products[1].id } }
    );

    console.log('✅ Updated product stock');

    console.log('\n🎉 Seed data completed successfully!');
    console.log('='.repeat(50));
    console.log('📊 Summary:');
    console.log('- Products: 2');
    console.log('- Customers: 2');
    console.log('- Orders: 2');
    console.log('- Invoices: 2');
    console.log('- Payments: 2');
    console.log('- Deliveries: 2');
    console.log('- Notifications: 2');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();