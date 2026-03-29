const { OrderItem } = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const fixOrderItems = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Fixing OrderItem calculations...\n');
    
    // Get all OrderItems with zero totals
    const brokenItems = await OrderItem.findAll({
      where: {
        total: 0
      }
    });
    
    console.log(`Found ${brokenItems.length} OrderItems with zero totals`);
    
    for (const item of brokenItems) {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = (subtotal * (item.discount || 0)) / 100;
      const total = subtotal - discountAmount;
      
      await item.update({
        subtotal,
        discountAmount,
        total
      });
      
      console.log(`✅ Fixed OrderItem ${item.id}:`);
      console.log(`   ${item.productName}`);
      console.log(`   Quantity: ${item.quantity} x ${item.unitPrice.toLocaleString()} VNĐ`);
      console.log(`   Discount: ${item.discount}%`);
      console.log(`   Subtotal: ${subtotal.toLocaleString()} VNĐ`);
      console.log(`   Discount Amount: ${discountAmount.toLocaleString()} VNĐ`);
      console.log(`   Total: ${total.toLocaleString()} VNĐ`);
      console.log('---');
    }
    
    console.log('\n🎉 All OrderItems fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing OrderItems:', error);
    process.exit(1);
  }
};

fixOrderItems();