const { Invoice } = require('./src/models');

async function getPaymentSummary() {
  try {
    console.log('💰 Getting Payment Summary...');
    
    // Get all invoices with payment info
    const invoices = await Invoice.findAll({
      attributes: ['totalAmount', 'paidAmount', 'remainingAmount', 'status']
    });
    
    let totalRevenue = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    
    invoices.forEach(invoice => {
      const total = parseFloat(invoice.totalAmount) || 0;
      const paid = parseFloat(invoice.paidAmount) || 0;
      const remaining = parseFloat(invoice.remainingAmount) || 0;
      
      totalRevenue += total;
      paidAmount += paid;
      pendingAmount += remaining;
      
      console.log(`Invoice: Total ${total.toLocaleString()}, Paid ${paid.toLocaleString()}, Remaining ${remaining.toLocaleString()}, Status: ${invoice.status}`);
    });
    
    console.log('\n📊 Payment Summary:');
    console.log(`Total Revenue: ${totalRevenue.toLocaleString()} VND`);
    console.log(`Paid Amount: ${paidAmount.toLocaleString()} VND`);
    console.log(`Pending Amount: ${pendingAmount.toLocaleString()} VND`);
    
    // Verify calculation
    console.log(`\n✅ Verification: ${paidAmount.toLocaleString()} + ${pendingAmount.toLocaleString()} = ${(paidAmount + pendingAmount).toLocaleString()}`);
    console.log(`Should equal total: ${totalRevenue.toLocaleString()}`);
    
    return {
      totalRevenue,
      paidAmount,
      pendingAmount
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getPaymentSummary();