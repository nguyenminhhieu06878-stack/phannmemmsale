const { sequelize, User, Supplier } = require('../src/models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

async function createSupplierUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get existing suppliers
    const suppliers = await Supplier.findAll();
    console.log(`📋 Found ${suppliers.length} suppliers`);

    // Create supplier users
    const supplierUsers = [
      {
        username: 'abcsupplier',
        email: 'contact@abc-tech.com',
        password: await bcrypt.hash('123456', 10),
        fullName: 'Nguyễn Văn A - ABC Tech',
        role: 'supplier',
        phone: '0901234567',
        department: 'Công ty TNHH Công nghệ ABC',
        isActive: true
      },
      {
        username: 'xyzsupplier',
        email: 'sales@xyz-electronics.com',
        password: await bcrypt.hash('123456', 10),
        fullName: 'Trần Thị B - XYZ Electronics',
        role: 'supplier',
        phone: '0902345678',
        department: 'Công ty Cổ phần Điện tử XYZ',
        isActive: true
      },
      {
        username: 'defsupplier',
        email: 'info@def-hardware.com',
        password: await bcrypt.hash('123456', 10),
        fullName: 'Lê Văn C - DEF Hardware',
        role: 'supplier',
        phone: '0903456789',
        department: 'Công ty TNHH Phần cứng DEF',
        isActive: true
      }
    ];

    console.log('👥 Creating supplier users...');
    
    for (const userData of supplierUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Created supplier user: ${user.username} (${user.fullName})`);
    }

    console.log('\n🎉 Supplier users created successfully!');
    console.log('\n📋 Supplier Login Credentials:');
    console.log('1. Username: abcsupplier | Password: 123456 | Company: ABC Tech');
    console.log('2. Username: xyzsupplier | Password: 123456 | Company: XYZ Electronics');
    console.log('3. Username: defsupplier | Password: 123456 | Company: DEF Hardware');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSupplierUsers();
}

module.exports = { createSupplierUsers };