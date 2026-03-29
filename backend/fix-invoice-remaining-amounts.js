const { Invoice } = require('./src/models');

async function fixInvoiceRemainingAmounts() {
  try {
    console.log('🔧 Fixing invoice remaining amounts...');
    
    // Get all invoices
    const invoices = await Invoice.findAll();
    console.log(`📊 Found ${invoices.length} invoices to check`);
    
    let fixedCount = 0;
    
    for (const invoice of invoices) {
      const expectedRemaining = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
      const currentRemaining = parseFloat(invoice.remainingAmount);
      
      if (Math.abs(expectedRemaining - currentRemaining) > 0.01) { // Allow for small floating point differences
        console.log(`🔍 Fixing invoice ${invoice.invoiceNumber}:`);
        console.log(`  - Total: ${invoice.totalAmount}`);
        console.log(`  - Paid: ${invoice.paidAmount}`);
        console.log(`  - Current remaining: ${currentRemaining}`);
        console.log(`  - Expected remaining: ${expectedRemaining}`);
        
        await invoice.update({
          remainingAmount: Math.max(0, expectedRemaining)
        });
        
        fixedCount++;
        console.log(`  ✅ Fixed!`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} invoices`);
    console.log('✅ All invoice remaining amounts are now correct');
    
  } catch (error) {
    console.error('❌ Error fixing invoices:', error);
  }
}

fixInvoiceRemainingAmounts();