const { User } = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const demoUsers = [
  {
    username: 'admin',
    email: 'admin@company.com',
    password: '123456',
    fullName: 'System Administrator',
    role: 'admin',
    phone: '+84901234567',
    department: 'IT'
  },
  {
    username: 'salesmanager',
    email: 'sales.manager@company.com',
    password: '123456',
    fullName: 'Nguyễn Văn Manager',
    role: 'sales_manager',
    phone: '+84901234568',
    department: 'Sales'
  },
  {
    username: 'salesstaff',
    email: 'sales.staff@company.com',
    password: '123456',
    fullName: 'Trần Thị Sales',
    role: 'sales_staff',
    phone: '+84901234569',
    department: 'Sales'
  },
  {
    username: 'customerservice',
    email: 'cs@company.com',
    password: '123456',
    fullName: 'Lê Văn Service',
    role: 'customer_service',
    phone: '+84901234570',
    department: 'Customer Service'
  },
  {
    username: 'warehouse',
    email: 'warehouse@company.com',
    password: '123456',
    fullName: 'Phạm Thị Warehouse',
    role: 'warehouse_staff',
    phone: '+84901234571',
    department: 'Warehouse'
  },
  {
    username: 'accountant',
    email: 'accountant@company.com',
    password: '123456',
    fullName: 'Hoàng Văn Accountant',
    role: 'accountant',
    phone: '+84901234572',
    department: 'Finance'
  },
  {
    username: 'delivery',
    email: 'delivery@company.com',
    password: '123456',
    fullName: 'Vũ Thị Delivery',
    role: 'delivery_staff',
    phone: '+84901234573',
    department: 'Logistics'
  },
  {
    username: 'director',
    email: 'director@company.com',
    password: '123456',
    fullName: 'Đỗ Văn Director',
    role: 'director',
    phone: '+84901234574',
    department: 'Management'
  }
];

const createDemoUsers = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Creating demo users for all roles...\n');
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          where: { username: userData.username }
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.username} already exists - skipping`);
          continue;
        }
        
        // Create user
        await User.create(userData);
        console.log(`✅ Created ${userData.role}: ${userData.username} / 123456`);
        
      } catch (error) {
        console.log(`❌ Failed to create ${userData.username}:`, error.message);
      }
    }
    
    console.log('\n📋 Demo Users Summary:');
    console.log('='.repeat(50));
    console.log('| Role              | Username         | Password |');
    console.log('|-------------------|------------------|----------|');
    demoUsers.forEach(user => {
      console.log(`| ${user.role.padEnd(17)} | ${user.username.padEnd(16)} | 123456   |`);
    });
    console.log('='.repeat(50));
    console.log('\n🎉 All demo users created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
};

createDemoUsers();