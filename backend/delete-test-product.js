const { Product, QuotationItem, OrderItem, InvoiceItem, StockRequest, PurchaseOrder } = require('./src/models');

async function deleteTestProduct() {
  try {
    console.log('🔍 Searching for "Test Product for Stock Update"...\n');

    // Find the product
    const product = await Product.findOne({
      where: {
        name: 'Test Product for Stock Update'
      }
    });

    if (!product) {
      console.log('❌ Product "Test Product for Stock Update" not found');
      return;
    }

    console.log('✅ Found product:');
    console.log('- ID:', product.id);
    console.log('- Name:', product.name);
    console.log('- Product Code:', product.productCode);
    console.log('- Stock:', product.stock);

    // Check if product is being used in any records
    console.log('\n🔍 Checking for references...');
    
    const [quotationItems, orderItems, invoiceItems, stockRequests, purchaseOrders] = await Promise.all([
      QuotationItem.count({ where: { productId: product.id } }),
      OrderItem.count({ where: { productId: product.id } }),
      InvoiceItem.count({ where: { productId: product.id } }),
      StockRequest.count({ where: { productId: product.id } }),
      PurchaseOrder.count({ where: { productId: product.id } })
    ]);

    console.log('- Quotation Items:', quotationItems);
    console.log('- Order Items:', orderItems);
    console.log('- Invoice Items:', invoiceItems);
    console.log('- Stock Requests:', stockRequests);
    console.log('- Purchase Orders:', purchaseOrders);

    const totalReferences = quotationItems + orderItems + invoiceItems + stockRequests + purchaseOrders;
    
    if (totalReferences > 0) {
      console.log(`\n⚠️ Product is being used in ${totalReferences} records`);
      console.log('🗑️ Force deleting related records first...');
      
      // Delete related records
      await Promise.all([
        QuotationItem.destroy({ where: { productId: product.id } }),
        OrderItem.destroy({ where: { productId: product.id } }),
        InvoiceItem.destroy({ where: { productId: product.id } }),
        StockRequest.destroy({ where: { productId: product.id } }),
        PurchaseOrder.destroy({ where: { productId: product.id } })
      ]);
      
      console.log('✅ Related records deleted');
    }
    
    // Delete the product
    console.log('\n🗑️ Deleting product...');
    await product.destroy();
    
    console.log('✅ Product "Test Product for Stock Update" deleted successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

deleteTestProduct();