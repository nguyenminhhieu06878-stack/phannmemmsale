const { sequelize, User } = require('../src/models');

async function recreateSupplierUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Delete existing supplier users
    console.log('🗑️  Deleting existing supplier users...');
    await User.destroy({
      where: { role: 'supplier' }
    });

    // Create new supplier users (password will be auto-hashed by beforeSave hook)
    const supplierUsers = [
      {
        username: 'abcsupplier',
        email: 'contact@abc-tech.com',
        password: '123456', // Will be auto-hashed
        fullName: 'Nguyễn Văn A - ABC Tech',
        role: 'supplier',
        phone: '0901234567',
        department: 'Công ty TNHH Công nghệ ABC',
        isActive: true
      },
      {
        username: 'xyzsupplier',
        email: 'sales@xyz-electronics.com',
        password: '123456', // Will be auto-hashed
        fullName: 'Trần Thị B - XYZ Electronics',
        role: 'supplier',
        phone: '0902345678',
        department: 'Công ty Cổ phần Điện tử XYZ',
        isActive: true
      },
      {
        username: 'defsupplier',
        email: 'info@def-hardware.com',
        password: '123456', // Will be auto-hashed
        fullName: 'Lê Văn C - DEF Hardware',
        role: 'supplier',
        phone: '0903456789',
        department: 'Công ty TNHH Phần cứng DEF',
        isActive: true
      }
    ];

    console.log('👥 Creating new supplier users...');
    
    for (const userData of supplierUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created supplier user: ${user.username} (${user.fullName})`);
      
      // Test password immediately
      const testLogin = await user.comparePassword('123456');
      console.log(`🔑 Password test for ${user.username}: ${testLogin}`);
    }

    console.log('\n🎉 Supplier users recreated successfully!');
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
  recreateSupplierUsers();
}

module.exports = { recreateSupplierUsers };