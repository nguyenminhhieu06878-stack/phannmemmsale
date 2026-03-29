const { sequelize } = require('../src/config/database');
const { Supplier } = require('../src/models');

const demoSuppliers = [
  {
    supplierCode: 'SUP0001',
    companyName: 'Công ty TNHH Công nghệ ABC',
    contactPerson: 'Nguyễn Văn A',
    email: 'contact@abc-tech.com',
    phone: '+84901234567',
    address: {
      street: '123 Đường Lê Lợi',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam'
    },
    taxCode: '0123456789',
    bankInfo: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'Công ty TNHH Công nghệ ABC'
    },
    supplierType: 'distributor',
    paymentTerms: '30 ngày',
    deliveryTerms: 'FOB',
    rating: 4.5,
    notes: 'Nhà cung cấp uy tín, giao hàng đúng hẹn',
    isActive: true
  },
  {
    supplierCode: 'SUP0002',
    companyName: 'Công ty Cổ phần Điện tử XYZ',
    contactPerson: 'Trần Thị B',
    email: 'sales@xyz-electronics.com',
    phone: '+84987654321',
    address: {
      street: '456 Đường Nguyễn Huệ',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam'
    },
    taxCode: '0987654321',
    bankInfo: {
      bankName: 'Techcombank',
      accountNumber: '0987654321',
      accountName: 'Công ty Cổ phần Điện tử XYZ'
    },
    supplierType: 'manufacturer',
    paymentTerms: '15 ngày',
    deliveryTerms: 'CIF',
    rating: 4.8,
    notes: 'Chuyên cung cấp linh kiện điện tử chất lượng cao',
    isActive: true
  },
  {
    supplierCode: 'SUP0003',
    companyName: 'Công ty TNHH Phần cứng DEF',
    contactPerson: 'Lê Văn C',
    email: 'info@def-hardware.com',
    phone: '+84912345678',
    address: {
      street: '789 Đường Võ Văn Tần',
      district: 'Quận 10',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam'
    },
    taxCode: '0112233445',
    bankInfo: {
      bankName: 'BIDV',
      accountNumber: '1122334455',
      accountName: 'Công ty TNHH Phần cứng DEF'
    },
    supplierType: 'wholesaler',
    paymentTerms: '45 ngày',
    deliveryTerms: 'EXW',
    rating: 4.2,
    notes: 'Chuyên cung cấp phần cứng máy tính với giá cạnh tranh',
    isActive: true
  }
];

async function createDemoSuppliers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🔄 Creating demo suppliers...');
    
    for (const supplierData of demoSuppliers) {
      try {
        const existingSupplier = await Supplier.findOne({
          where: { supplierCode: supplierData.supplierCode }
        });

        if (existingSupplier) {
          console.log(`⚠️  Supplier ${supplierData.supplierCode} already exists, skipping...`);
          continue;
        }

        const supplier = await Supplier.create(supplierData);
        console.log(`✅ Created supplier: ${supplier.companyName} (${supplier.supplierCode})`);
      } catch (error) {
        console.error(`❌ Error creating supplier ${supplierData.supplierCode}:`, error.message);
      }
    }

    console.log('🎉 Demo suppliers created successfully!');
    
    // Display summary
    const totalSuppliers = await Supplier.count();
    console.log(`📊 Total suppliers in database: ${totalSuppliers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createDemoSuppliers();
}

module.exports = { createDemoSuppliers };