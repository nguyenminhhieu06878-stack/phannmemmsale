const { User } = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(1);
    }
    
    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@company.com',
      password: '123456',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '+84901234567',
      department: 'IT'
    });
    
    console.log('✅ Admin user created successfully:');
    console.log('Username: admin');
    console.log('Password: 123456');
    console.log('Email: admin@company.com');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();