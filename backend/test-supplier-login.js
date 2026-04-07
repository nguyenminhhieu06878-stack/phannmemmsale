const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { connectDB } = require('./src/config/database');

async function testSupplierLogin() {
  try {
    await connectDB();
    console.log('🔄 Testing supplier login...');
    
    const testPassword = '123456';
    const username = 'abcsupplier';
    
    // Find the user
    const user = await User.findOne({ 
      where: { username: username, isActive: true } 
    });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:', user.username);
    console.log('User role:', user.role);
    console.log('User active:', user.isActive);
    
    // Test password comparison
    console.log('🔄 Testing password...');
    console.log('Stored password hash:', user.password);
    
    // Test with bcrypt directly
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match (bcrypt):', isMatch);
    
    // Test with user's comparePassword method
    const isMatchMethod = await user.comparePassword(testPassword);
    console.log('Password match (method):', isMatchMethod);
    
    if (isMatch && isMatchMethod) {
      console.log('🎉 Login test successful!');
    } else {
      console.log('❌ Login test failed!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testSupplierLogin();