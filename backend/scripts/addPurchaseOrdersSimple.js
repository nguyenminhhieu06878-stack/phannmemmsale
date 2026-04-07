const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const addPurchaseOrders = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Get required data
    db.all(`
      SELECT 
        sr.id as stockRequestId,
        sr.requestNumber,
        sr.productId,
        sr.requestedQuantity,
        p.name as productName,
        p.cost as productCost,
        u.id as userId
      FROM stock_requests sr
      JOIN products p ON sr.productId = p.id
      JOIN users u ON u.username = 'admin'
      WHERE sr.status = 'approved'
      LIMIT 2
    `, (err, stockRequests) => {
      if (err) {
        console.error('❌ Error fetching stock requests:', err);
        reject(err);
        return;
      }

      // Get suppliers
      db.all(`SELECT id, companyName FROM suppliers LIMIT 3`, (err, suppliers) => {
        if (err) {
          console.error('❌ Error fetching suppliers:', err);
          reject(err);
          return;
        }

        if (stockRequests.length === 0 || suppliers.length === 0) {
          console.log('❌ No approved stock requests or suppliers found');
          reject(new Error('No approved stock requests or suppliers found'));
          return;
        }

        console.log('📦 Creating purchase orders...');

        const purchaseOrders = [];
        
        stockRequests.forEach((sr, index) => {
          const supplier = suppliers[index % suppliers.length];
          const unitPrice = sr.productCost * 1.1; // Add 10% margin
          const totalAmount = unitPrice * sr.requestedQuantity;
          
          purchaseOrders.push({
            id: uuidv4(),
            poNumber: `PO2026${String(index + 1).padStart(3, '0')}`,
            stockRequestId: sr.stockRequestId,
            supplierId: supplier.id,
            createdById: sr.userId,
            productId: sr.productId,
            quantity: sr.requestedQuantity,
            unitPrice: unitPrice,
            totalAmount: totalAmount,
            currency: 'VND',
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            deliveryAddress: JSON.stringify({
              street: '123 Warehouse Street',
              district: 'District 1',
              city: 'Ho Chi Minh City',
              country: 'Vietnam'
            }),
            paymentTerms: '30 days',
            status: 'draft',
            notes: `Purchase order for ${sr.productName} - ${sr.requestNumber}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });

        let completed = 0;
        const total = purchaseOrders.length;

        purchaseOrders.forEach((po) => {
          const sql = `
            INSERT OR IGNORE INTO purchase_orders 
            (id, poNumber, stockRequestId, supplierId, createdById, productId, quantity, unitPrice, totalAmount, currency, deliveryDate, deliveryAddress, paymentTerms, status, notes, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(sql, [
            po.id,
            po.poNumber,
            po.stockRequestId,
            po.supplierId,
            po.createdById,
            po.productId,
            po.quantity,
            po.unitPrice,
            po.totalAmount,
            po.currency,
            po.deliveryDate,
            po.deliveryAddress,
            po.paymentTerms,
            po.status,
            po.notes,
            po.createdAt,
            po.updatedAt
          ], function(err) {
            if (err) {
              console.error(`❌ Error creating ${po.poNumber}:`, err);
            } else if (this.changes > 0) {
              console.log(`✅ Created: ${po.poNumber}`);
            } else {
              console.log(`⚠️  Purchase order ${po.poNumber} already exists, skipping...`);
            }

            completed++;
            if (completed === total) {
              // Get total count
              db.get('SELECT COUNT(*) as count FROM purchase_orders', (err, row) => {
                if (!err) {
                  console.log(`📊 Total purchase orders in database: ${row.count}`);
                }
                
                console.log('🎉 Purchase orders created successfully!');
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err);
                    reject(err);
                  } else {
                    console.log('🔌 Database connection closed');
                    resolve();
                  }
                });
              });
            }
          });
        });
      });
    });
  });
};

addPurchaseOrders()
  .then(() => {
    console.log('✅ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });