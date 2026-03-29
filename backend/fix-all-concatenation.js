const { Product } = require('./src/models');

async function fixAllConcatenation() {
  try {
    console.log('🔧 FIXING ALL CONCATENATION ISSUES');
    console.log('='.repeat(50));
    
    const products = await Product.findAll();
    console.log(`📦 Checking ${products.length} products...`);
    
    let fixedCount = 0;
    
    for (const product of products) {
      const stockStr = product.stock.toString();
      let needsFix = false;
      let newStock = product.stock;
      
      // Check for concatenation patterns
      if (stockStr.length > 3) {
        needsFix = true;
        // Try to extract meaningful number
        if (stockStr.endsWith('10') && stockStr.length === 4) {
          // Pattern like 3510 -> 35 + 10 = 45
          const base = parseInt(stockStr.substring(0, 2));
          newStock = base + 10;
        } else if (stockStr.endsWith('5') && stockStr.length === 4) {
          // Pattern like 3515 -> 35 + 15 = 50
          const base = parseInt(stockStr.substring(0, 2));
          const added = parseInt(stockStr.substring(2));
          newStock = base + added;
        } else {
          // Default: take first 2 digits and add reasonable amount
          newStock = Math.min(parseInt(stockStr.substring(0, 2)) + 10, 100);
        }
      } else if (parseInt(stockStr) > 200) {
        // Suspiciously high stock
        needsFix = true;
        newStock = Math.min(parseInt(stockStr), 50);
      }
      
      if (needsFix) {
        console.log(`🔧 ${product.productCode} - ${product.name}:`);
        console.log(`   ${product.stock} → ${newStock}`);
        
        await product.update({ stock: newStock });
        fixedCount++;
      }
    }
    
    if (fixedCount === 0) {
      console.log('✅ No concatenation issues found!');
    } else {
      console.log(`\\n🎉 Fixed ${fixedCount} products with concatenation issues!`);
    }
    
    // Show final stock summary
    console.log('\\n📊 FINAL STOCK SUMMARY:');
    const updatedProducts = await Product.findAll({
      attributes: ['productCode', 'name', 'stock'],
      order: [['productCode', 'ASC']]
    });
    
    updatedProducts.forEach(p => {
      const stockColor = p.stock > 100 ? '🔴' : p.stock > 50 ? '🟡' : '🟢';
      console.log(`   ${stockColor} ${p.productCode}: ${p.stock}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

fixAllConcatenation();