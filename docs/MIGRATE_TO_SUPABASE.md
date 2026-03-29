# Hướng dẫn chuyển từ SQLite sang Supabase PostgreSQL

## Tại sao chuyển sang Supabase?

- **SQLite**: Tốt cho development, đơn giản, không cần setup
- **Supabase PostgreSQL**: Tốt cho production, hỗ trợ nhiều tính năng nâng cao, scalable, có backup tự động

## Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập
3. Tạo project mới
4. Chọn region gần nhất (Singapore cho VN)
5. Đợi project được khởi tạo (~2 phút)

## Bước 2: Lấy thông tin kết nối

Trong Supabase Dashboard:
1. Vào **Settings** → **Database**
2. Tìm phần **Connection string**
3. Chọn tab **URI** hoặc **Connection parameters**

Bạn sẽ có thông tin như:
```
Host: db.xxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

Hoặc Connection URI:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

## Bước 3: Cài đặt PostgreSQL driver

```bash
cd backend
npm install pg pg-hstore
npm uninstall sqlite3  # Optional: xóa sqlite3 nếu không dùng nữa
```

## Bước 4: Cập nhật file cấu hình

### Cách 1: Sử dụng Connection URI (Đơn giản)

**backend/.env**
```env
NODE_ENV=development
PORT=5000

# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**backend/src/config/database.js**
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Supabase PostgreSQL connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

### Cách 2: Sử dụng Connection Parameters (Chi tiết hơn)

**backend/.env**
```env
NODE_ENV=development
PORT=5000

# Supabase PostgreSQL
DB_HOST=db.xxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**backend/src/config/database.js**
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Supabase PostgreSQL connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

## Bước 5: Migrate dữ liệu (Nếu có)

### Option A: Bắt đầu từ đầu (Khuyến nghị cho development)

1. Xóa database SQLite cũ (hoặc backup)
2. Chạy server để tạo tables mới trên Supabase
3. Tạo lại admin user

```bash
cd backend
npm run dev  # Tạo tables
npm run create-admin  # Tạo admin
```

### Option B: Export/Import dữ liệu (Nếu có data quan trọng)

**Export từ SQLite:**
```bash
# Cài đặt sqlite3 CLI nếu chưa có
# macOS: brew install sqlite3
# Ubuntu: sudo apt-get install sqlite3

# Export data
sqlite3 backend/database.sqlite .dump > data_backup.sql
```

**Import vào PostgreSQL:**
```bash
# Cần chỉnh sửa file SQL vì syntax khác nhau
# Hoặc viết script Node.js để migrate data
```

**Script migrate đơn giản (tạo file backend/scripts/migrateData.js):**
```javascript
const sqlite3 = require('sqlite3').verbose();
const { sequelize, User, Customer, Product } = require('../src/models');

async function migrate() {
  // Kết nối SQLite
  const db = new sqlite3.Database('./database.sqlite');
  
  // Migrate Users
  db.all('SELECT * FROM User', async (err, rows) => {
    if (err) throw err;
    
    for (const row of rows) {
      await User.create(row);
    }
    console.log('✅ Migrated users');
  });
  
  // Tương tự cho các bảng khác...
  
  db.close();
}

migrate().catch(console.error);
```

## Bước 6: Test kết nối

```bash
cd backend
npm run dev
```

Kiểm tra log:
- ✅ Supabase PostgreSQL connected successfully
- ✅ Database models synchronized

## Bước 7: Tạo admin user mới

```bash
npm run create-admin
```

## Bước 8: Test ứng dụng

1. Chạy frontend: `cd frontend && npm run dev`
2. Đăng nhập với admin account
3. Test các chức năng CRUD
4. Kiểm tra data trong Supabase Dashboard

## So sánh SQLite vs PostgreSQL

| Tính năng | SQLite | PostgreSQL (Supabase) |
|-----------|--------|----------------------|
| Setup | Cực đơn giản | Cần đăng ký account |
| Performance | Tốt cho < 100 users | Tốt cho hàng nghìn users |
| Concurrent writes | Hạn chế | Rất tốt |
| Backup | Manual | Tự động hàng ngày |
| Scalability | Hạn chế | Rất tốt |
| Cost | Free | Free tier 500MB |
| Production ready | Không khuyến nghị | Có |

## Troubleshooting

### Lỗi SSL connection
Thêm vào dialectOptions:
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### Lỗi timeout
Tăng timeout trong pool config:
```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 60000,  // Tăng lên 60s
  idle: 10000
}
```

### Lỗi "too many connections"
Giảm max connections:
```javascript
pool: {
  max: 3,  // Giảm xuống
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### Không kết nối được
1. Kiểm tra password có đúng không
2. Kiểm tra IP có bị block không (Supabase cho phép all IPs mặc định)
3. Kiểm tra project có đang pause không (free tier pause sau 7 ngày không dùng)

## Rollback về SQLite

Nếu gặp vấn đề, bạn có thể rollback:

1. Restore file `backend/src/config/database.js` cũ
2. Restore file `backend/.env` cũ
3. Cài lại sqlite3: `npm install sqlite3`
4. Restart server

## Best Practices

1. **Development**: Dùng SQLite cho đơn giản
2. **Staging/Production**: Dùng Supabase PostgreSQL
3. **Backup**: Export data định kỳ
4. **Environment**: Dùng .env khác nhau cho dev/prod
5. **Migration**: Test kỹ trước khi migrate production data

## Kết luận

- SQLite: Hoàn hảo cho development và testing
- Supabase: Cần thiết cho production và khi scale
- Migration: Đơn giản, chỉ cần đổi config và driver

Chúc bạn migrate thành công! 🚀
