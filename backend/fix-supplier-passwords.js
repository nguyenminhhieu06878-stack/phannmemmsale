const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { connectDB } = require('./src/config/database');

async function fixSupplierPasswords() {
  try {
    await connectDB();
    console.log('🔄 Fixing supplier passwords...');
    
    const correctPassword = '123456';
    
    // Find all supplier users
    const suppliers = await User.findAll({ 
      where: { role: 'supplier' } 
    });
    
    console.log(`Found ${suppliers.length} supplier users`);
    
    for (const supplier of suppliers) {
      console.log(`\n🔄 Updating password for: ${supplier.username}`);
      
      // Update the password - this will trigger the beforeSave hook to hash it
      await supplier.update({ password: correctPassword });
      
      // Test the password immediately
      const updatedUser = await User.findByPk(supplier.id);
      const isMatch = await updatedUser.comparePassword(correctPassword);
      
      console.log(`✅ Password updated for ${supplier.username}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('\n🎉 All supplier passwords have been fixed!');
    console.log('You can now login with:');
    console.log('- Username: abcsupplier, Password: 123456');
    console.log('- Username: xyzsupplier, Password: 123456');
    console.log('- Username: defsupplier, Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSupplierPasswords();