const { 
  User, Customer, Product, Quotation, QuotationItem, 
  Order, OrderItem, Invoice, InvoiceItem, Payment, 
  Delivery, Notification 
} = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const seedData = async () => {
  try {
    await connectDB();
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
    const products = await Product.bulkCreate([
      {
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
      },
      {
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
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${products.length} products`);
    // 2. Create Customers
    console.log('👥 Creating customers...');
    const customers = await Customer.bulkCreate([
      {
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
      },
      {
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
      },
      {
        customerCode: 'CUS003',
        companyName: 'Công ty TNHH DEF Digital',
        taxCode: '0111222333',
        address: {
          street: '789 Võ Văn Ngân',
          district: 'Thủ Đức',
          city: 'TP.HCM',
          country: 'Việt Nam'
        },
        phone: '0923456789',
        email: 'hello@def-digital.com',
        customerType: 'new',
        assignedSalesId: salesManager.id,
        creditLimit: 30000000
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${customers.length} customers`);
    // 3. Create Quotations
    console.log('📋 Creating quotations...');
    const quotations = await Quotation.bulkCreate([
      {
        quotationNumber: 'QT2026001',
        customerId: customers[0].id,
        salesPersonId: salesStaff.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: 30000000,
        discount: 5,
        discountAmount: 1500000,
        tax: 10,
        taxAmount: 2850000,
        totalAmount: 31350000,
        status: 'approved',
        notes: 'Báo giá laptop cho văn phòng'
      },
      {
        quotationNumber: 'QT2026002',
        customerId: customers[1].id,
        salesPersonId: salesStaff.id,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal: 18000000,
        discount: 3,
        discountAmount: 540000,
        tax: 10,
        taxAmount: 1746000,
        totalAmount: 19206000,
        status: 'pending',
        notes: 'Báo giá laptop HP Pavilion'
      }
    ], { ignoreDuplicates: true });

    // Create Quotation Items
    await QuotationItem.bulkCreate([
      {
        quotationId: quotations[0].id,
        productId: products[0].id,
        productName: products[0].name,
        productSku: products[0].productCode,
        quantity: 2,
        unitPrice: 15000000,
        discount: 0,
        subtotal: 30000000,
        total: 30000000
      },
      {
        quotationId: quotations[1].id,
        productId: products[1].id,
        productName: products[1].name,
        productSku: products[1].productCode,
        quantity: 1,
        unitPrice: 18000000,
        discount: 0,
        subtotal: 18000000,
        total: 18000000
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${quotations.length} quotations with items`);
    // 4. Create Orders
    console.log('🛒 Creating orders...');
    const orders = await Order.bulkCreate([
      {
        orderNumber: 'ORD2026001',
        quotationId: quotations[0].id,
        customerId: customers[0].id,
        salesPersonId: salesStaff.id,
        approvedById: salesManager.id,
        subtotal: 30000000,
        discount: 5,
        discountAmount: 1500000,
        tax: 10,
        taxAmount: 2850000,
        totalAmount: 31350000,
        status: 'confirmed',
        paymentTerms: '30 ngày',
        deliveryAddress: {
          street: '123 Nguyễn Văn Linh',
          district: 'Quận 7',
          city: 'TP.HCM',
          country: 'Việt Nam'
        },
        notes: 'Đơn hàng laptop cho văn phòng - ưu tiên giao hàng'
      },
      {
        orderNumber: 'ORD2026002',
        customerId: customers[1].id,
        salesPersonId: salesStaff.id,
        subtotal: 36000000,
        discount: 2,
        discountAmount: 720000,
        tax: 10,
        taxAmount: 3528000,
        totalAmount: 38808000,
        status: 'pending',
        paymentTerms: '15 ngày',
        deliveryAddress: {
          street: '456 Lê Văn Việt',
          district: 'Quận 9',
          city: 'TP.HCM',
          country: 'Việt Nam'
        }
      }
    ], { ignoreDuplicates: true });

    // Create Order Items
    await OrderItem.bulkCreate([
      {
        orderId: orders[0].id,
        productId: products[0].id,
        productName: products[0].name,
        productSku: products[0].productCode,
        quantity: 2,
        unitPrice: 15000000,
        discount: 0,
        subtotal: 30000000,
        total: 30000000
      },
      {
        orderId: orders[1].id,
        productId: products[1].id,
        productName: products[1].name,
        productSku: products[1].productCode,
        quantity: 2,
        unitPrice: 18000000,
        discount: 0,
        subtotal: 36000000,
        total: 36000000
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${orders.length} orders with items`);
    // 5. Create Invoices
    console.log('🧾 Creating invoices...');
    const invoices = await Invoice.bulkCreate([
      {
        invoiceNumber: 'INV2026001',
        orderId: orders[0].id,
        customerId: customers[0].id,
        subtotal: 30000000,
        discount: 5,
        discountAmount: 1500000,
        tax: 10,
        taxAmount: 2850000,
        totalAmount: 31350000,
        paidAmount: 31350000,
        remainingAmount: 0,
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(),
        notes: 'Hóa đơn đã thanh toán đầy đủ'
      },
      {
        invoiceNumber: 'INV2026002',
        orderId: orders[1].id,
        customerId: customers[1].id,
        subtotal: 36000000,
        discount: 2,
        discountAmount: 720000,
        tax: 10,
        taxAmount: 3528000,
        totalAmount: 38808000,
        paidAmount: 20000000,
        remainingAmount: 18808000,
        status: 'partial',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: 'Đã thanh toán một phần, còn nợ 18,808,000 VNĐ'
      }
    ], { ignoreDuplicates: true });

    // Create Invoice Items
    await InvoiceItem.bulkCreate([
      {
        invoiceId: invoices[0].id,
        productId: products[0].id,
        productName: products[0].name,
        productSku: products[0].productCode,
        quantity: 2,
        unitPrice: 15000000,
        discount: 0,
        subtotal: 30000000,
        total: 30000000
      },
      {
        invoiceId: invoices[1].id,
        productId: products[1].id,
        productName: products[1].name,
        productSku: products[1].productCode,
        quantity: 2,
        unitPrice: 18000000,
        discount: 0,
        subtotal: 36000000,
        total: 36000000
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${invoices.length} invoices with items`);
    // 6. Create Payments
    console.log('💰 Creating payments...');
    const payments = await Payment.bulkCreate([
      {
        invoiceId: invoices[0].id,
        paymentNumber: 'PAY2026001',
        amount: 31350000,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        referenceNumber: 'TXN123456789',
        notes: 'Thanh toán chuyển khoản đầy đủ',
        createdBy: accountant?.id
      },
      {
        invoiceId: invoices[1].id,
        paymentNumber: 'PAY2026002',
        amount: 20000000,
        paymentMethod: 'cash',
        paymentDate: new Date(),
        referenceNumber: 'CASH001',
        notes: 'Thanh toán tiền mặt một phần',
        createdBy: accountant?.id
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${payments.length} payments`);

    // 7. Create Deliveries
    console.log('🚚 Creating deliveries...');
    const deliveries = await Delivery.bulkCreate([
      {
        orderId: orders[0].id,
        deliveryDate: new Date(),
        deliveryAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        deliveryStaffId: delivery?.id,
        status: 'delivered',
        trackingNumber: 'DEL2026001',
        notes: 'Giao hàng thành công, khách hàng hài lòng',
        deliveredAt: new Date()
      },
      {
        orderId: orders[1].id,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        deliveryAddress: '456 Lê Văn Việt, Quận 9, TP.HCM',
        deliveryStaffId: delivery?.id,
        status: 'pending',
        trackingNumber: 'DEL2026002',
        notes: 'Đã lên lịch giao hàng'
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${deliveries.length} deliveries`);
    // 8. Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = await Notification.bulkCreate([
      {
        userId: salesStaff.id,
        type: 'order_approved',
        title: 'Đơn hàng được phê duyệt',
        message: `Đơn hàng ${orders[0].orderNumber} đã được phê duyệt bởi ${salesManager.fullName}`,
        link: `/orders/${orders[0].id}`,
        isRead: false
      },
      {
        userId: salesManager.id,
        type: 'quotation_pending',
        title: 'Báo giá chờ phê duyệt',
        message: `Báo giá ${quotations[1].quotationNumber} cần được phê duyệt`,
        link: `/quotations/${quotations[1].id}`,
        isRead: false
      },
      {
        userId: accountant?.id,
        type: 'payment_received',
        title: 'Nhận thanh toán',
        message: `Đã nhận thanh toán ${payments[0].amount.toLocaleString()} VNĐ cho hóa đơn ${invoices[0].invoiceNumber}`,
        link: `/invoices/${invoices[0].id}`,
        isRead: true,
        readAt: new Date()
      },
      {
        userId: delivery?.id,
        type: 'delivery_assigned',
        title: 'Phân công giao hàng',
        message: `Bạn được phân công giao đơn hàng ${orders[1].orderNumber}`,
        link: `/deliveries/${deliveries[1].id}`,
        isRead: false
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ Created ${notifications.length} notifications`);

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
    console.log(`- Products: ${products.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Quotations: ${quotations.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log(`- Invoices: ${invoices.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Deliveries: ${deliveries.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();