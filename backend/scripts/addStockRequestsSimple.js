const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const addStockRequests = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Get users and products first
    db.all(`
      SELECT id, username, role FROM users 
      WHERE username IN ('warehouse', 'admin') AND isActive = 1
    `, (err, users) => {
      if (err) {
        console.error('❌ Error fetching users:', err);
        reject(err);
        return;
      }

      const warehouse = users.find(u => u.username === 'warehouse');
      const admin = users.find(u => u.username === 'admin');

      if (!warehouse || !admin) {
        console.log('❌ Required users not found');
        reject(new Error('Required users not found'));
        return;
      }

      // Get products
      db.all(`SELECT id, productCode, name, stock FROM products LIMIT 5`, (err, products) => {
        if (err) {
          console.error('❌ Error fetching products:', err);
          reject(err);
          return;
        }

        if (products.length === 0) {
          console.log('❌ No products found');
          reject(new Error('No products found'));
          return;
        }

        console.log('📦 Creating stock requests...');

        const stockRequests = [
          {
            id: uuidv4(),
            requestNumber: 'SR2026001',
            productId: products[0].id,
            currentStock: products[0].stock,
            requestedQuantity: 20,
            priority: 'high',
            reason: 'Stock level is below minimum threshold. Need to replenish for upcoming orders.',
            status: 'pending',
            requestedById: warehouse.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            requestNumber: 'SR2026002',
            productId: products[1] ? products[1].id : products[0].id,
            currentStock: products[1] ? products[1].stock : products[0].stock,
            requestedQuantity: 15,
            priority: 'medium',
            reason: 'Preparing for seasonal demand increase.',
            status: 'approved',
            requestedById: warehouse.id,
            approvedById: admin.id,
            approvalNotes: 'Approved for seasonal preparation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        if (products.length > 2) {
          stockRequests.push({
            id: uuidv4(),
            requestNumber: 'SR2026003',
            productId: products[2].id,
            currentStock: products[2].stock,
            requestedQuantity: 10,
            priority: 'urgent',
            reason: 'Critical stock shortage. Customer orders pending.',
            status: 'pending',
            requestedById: warehouse.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        let completed = 0;
        const total = stockRequests.length;

        stockRequests.forEach((request) => {
          const sql = `
            INSERT OR IGNORE INTO stock_requests 
            (id, requestNumber, productId, currentStock, requestedQuantity, priority, reason, status, requestedById, approvedById, approvalNotes, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(sql, [
            request.id,
            request.requestNumber,
            request.productId,
            request.currentStock,
            request.requestedQuantity,
            request.priority,
            request.reason,
            request.status,
            request.requestedById,
            request.approvedById || null,
            request.approvalNotes || null,
            request.createdAt,
            request.updatedAt
          ], function(err) {
            if (err) {
              console.error(`❌ Error creating ${request.requestNumber}:`, err);
            } else if (this.changes > 0) {
              console.log(`✅ Created: ${request.requestNumber}`);
            } else {
              console.log(`⚠️  Stock request ${request.requestNumber} already exists, skipping...`);
            }

            completed++;
            if (completed === total) {
              // Get total count
              db.get('SELECT COUNT(*) as count FROM stock_requests', (err, row) => {
                if (!err) {
                  console.log(`📊 Total stock requests in database: ${row.count}`);
                }
                
                console.log('🎉 Stock requests created successfully!');
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

addStockRequests()
  .then(() => {
    console.log('✅ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });