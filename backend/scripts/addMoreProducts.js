const { Product } = require('../src/models');
require('dotenv').config();

const addMoreProducts = async () => {
  try {
    console.log('📦 Adding more products...\n');

    const moreProducts = [
      {
        productCode: 'MON001',
        name: 'Màn hình Dell 24 inch',
        description: 'Màn hình Full HD, IPS, viền mỏng',
        category: 'Monitor',
        unit: 'chiếc',
        price: 4500000,
        cost: 3500000,
        stock: 25,
        minStock: 5,
        specifications: {
          size: '24 inch',
          resolution: '1920x1080',
          panel: 'IPS',
          refresh_rate: '75Hz'
        }
      },
      {
        productCode: 'KEY001',
        name: 'Bàn phím cơ Logitech MX',
        description: 'Bàn phím cơ không dây, đèn nền RGB',
        category: 'Keyboard',
        unit: 'chiếc',
        price: 2500000,
        cost: 2000000,
        stock: 15,
        minStock: 3,
        specifications: {
          type: 'Mechanical',
          connection: 'Wireless',
          backlight: 'RGB',
          switch: 'Cherry MX'
        }
      },
      {
        productCode: 'MOU001',
        name: 'Chuột gaming Razer DeathAdder',
        description: 'Chuột gaming có dây, DPI cao',
        category: 'Mouse',
        unit: 'chiếc',
        price: 1200000,
        cost: 900000,
        stock: 40,
        minStock: 8,
        specifications: {
          type: 'Gaming',
          dpi: '20000',
          connection: 'Wired',
          buttons: '7'
        }
      },
      {
        productCode: 'HDD001',
        name: 'Ổ cứng WD Blue 1TB',
        description: 'Ổ cứng HDD 3.5 inch, 7200 RPM',
        category: 'Storage',
        unit: 'chiếc',
        price: 1800000,
        cost: 1400000,
        stock: 20,
        minStock: 5,
        specifications: {
          capacity: '1TB',
          type: 'HDD',
          rpm: '7200',
          interface: 'SATA III'
        }
      },
      {
        productCode: 'SSD001',
        name: 'SSD Samsung 970 EVO 500GB',
        description: 'SSD NVMe M.2, tốc độ cao',
        category: 'Storage',
        unit: 'chiếc',
        price: 2200000,
        cost: 1800000,
        stock: 18,
        minStock: 4,
        specifications: {
          capacity: '500GB',
          type: 'SSD NVMe',
          interface: 'M.2',
          read_speed: '3500 MB/s'
        }
      },
      {
        productCode: 'RAM001',
        name: 'RAM Corsair 16GB DDR4',
        description: 'RAM DDR4 3200MHz, 2x8GB kit',
        category: 'Memory',
        unit: 'bộ',
        price: 3200000,
        cost: 2600000,
        stock: 12,
        minStock: 3,
        specifications: {
          capacity: '16GB',
          type: 'DDR4',
          speed: '3200MHz',
          kit: '2x8GB'
        }
      }
    ];

    for (const productData of moreProducts) {
      const [product, created] = await Product.findOrCreate({
        where: { productCode: productData.productCode },
        defaults: productData
      });
      
      if (created) {
        console.log(`✅ Created: ${productData.name}`);
      } else {
        console.log(`⚠️  Already exists: ${productData.name}`);
      }
    }

    console.log(`\n🎉 Added ${moreProducts.length} more products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding products:', error);
    process.exit(1);
  }
};

addMoreProducts();