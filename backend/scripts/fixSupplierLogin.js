const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function fixSupplierLogin() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find supplier user
    const user = await User.findOne({ where: { username: 'abcsupplier' } });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.username, user.fullName);
    console.log('🔐 Password hash:', user.password.substring(0, 20) + '...');

    // Test password comparison
    const isValid = await bcrypt.compare('123456', user.password);
    console.log('🔑 Password valid:', isValid);

    if (!isValid) {
      console.log('🔧 Updating password...');
      const newHash = await bcrypt.hash('123456', 10);
      await user.update({ password: newHash });
      console.log('✅ Password updated');
    }

    // Test login again
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ where: { username: 'abcsupplier' } });
    const loginValid = await testUser.comparePassword('123456');
    console.log('🔑 Login test result:', loginValid);

    if (loginValid) {
      console.log('✅ Supplier login should work now!');
      console.log('📋 Login credentials:');
      console.log('Username: abcsupplier');
      console.log('Password: 123456');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  fixSupplierLogin();
}

module.exports = { fixSupplierLogin };