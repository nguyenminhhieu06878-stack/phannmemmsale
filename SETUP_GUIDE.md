# 🚀 Hướng dẫn Setup và Chạy Dự án

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Backend](#cài-đặt-backend)
3. [Cài đặt Frontend](#cài-đặt-frontend)
4. [Chạy dự án](#chạy-dự-án)
5. [Tạo tài khoản Admin](#tạo-tài-khoản-admin)
6. [Kiểm tra hoạt động](#kiểm-tra-hoạt-động)
7. [Troubleshooting](#troubleshooting)

## 🔧 Yêu cầu hệ thống

### Phần mềm cần cài đặt:
- **Node.js**: Version 18 trở lên
  - Download: https://nodejs.org/
  - Kiểm tra: `node --version`
  
- **npm**: Đi kèm với Node.js
  - Kiểm tra: `npm --version`

- **Git**: Để clone repository
  - Download: https://git-scm.com/
  - Kiểm tra: `git --version`

### Hệ điều hành:
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+)

## 📦 Cài đặt Backend

### Bước 1: Di chuyển vào thư mục backend
```bash
cd backend
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

Quá trình này sẽ cài đặt:
- express (Web framework)
- sequelize (ORM)
- sqlite3 (Database)
- jsonwebtoken (Authentication)
- bcryptjs (Password hashing)
- và các packages khác...

**Thời gian**: ~2-3 phút

### Bước 3: Kiểm tra file .env
File `.env` đã được cấu hình sẵn:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

**Lưu ý**: Trong production, hãy đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên phức tạp!

### Bước 4: Cấu trúc thư mục backend
```
backend/
├── src/
│   ├── config/          # Database & JWT config
│   ├── controllers/     # Business logic (8 controllers)
│   ├── middlewares/     # Auth, error handling
│   ├── models/          # Database models (7 models)
│   └── routes/          # API routes (9 routes)
├── scripts/
│   └── createAdmin.js   # Script tạo admin
├── .env                 # Environment variables
├── server.js            # Entry point
└── package.json
```

## 🎨 Cài đặt Frontend

### Bước 1: Mở terminal mới và di chuyển vào thư mục frontend
```bash
cd frontend
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

Quá trình này sẽ cài đặt:
- react & react-dom
- @reduxjs/toolkit (State management)
- antd (UI components)
- axios (HTTP client)
- react-router-dom (Routing)
- và các packages khác...

**Thời gian**: ~3-5 phút

### Bước 3: Kiểm tra file .env
File `frontend/.env` cần có:
```env
VITE_API_URL=http://localhost:5000/api
```

### Bước 4: Cấu trúc thư mục frontend
```
frontend/
├── src/
│   ├── components/      # React components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components (8 pages)
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── quotations/
│   │   ├── deliveries/
│   │   ├── invoices/
│   │   └── reports/
│   ├── services/        # API services (8 services)
│   ├── store/           # Redux store
│   │   └── slices/      # Redux slices (8 slices)
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

## 🚀 Chạy dự án

### Terminal 1: Chạy Backend
```bash
cd backend
npm run dev
```

**Kết quả mong đợi:**
```
🚀 Server running on port 5000
📝 Environment: development
🗄️ Database: SQLite
✅ SQLite database connected successfully
✅ Database models synchronized
```

Backend đang chạy tại: **http://localhost:5000**

### Terminal 2: Chạy Frontend
```bash
cd frontend
npm run dev
```

**Kết quả mong đợi:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Frontend đang chạy tại: **http://localhost:3000**

## 👤 Tạo tài khoản Admin

### Mở terminal thứ 3
```bash
cd backend
npm run create-admin
```

**Kết quả:**
```
✅ Admin user created successfully!

Login credentials:
Username: admin
Password: 123456
Email: admin@company.com
Role: admin
```

**Lưu ý**: Đây là tài khoản mặc định. Sau khi đăng nhập, hãy đổi mật khẩu ngay!

## ✅ Kiểm tra hoạt động

### 1. Kiểm tra Backend API
Mở trình duyệt hoặc Postman:
```
GET http://localhost:5000/
```

**Response:**
```json
{
  "success": true,
  "message": "ERP Sales API Server is running!",
  "version": "1.0.0",
  "database": "SQLite",
  "timestamp": "2024-03-26T..."
}
```

### 2. Kiểm tra Frontend
Mở trình duyệt: **http://localhost:3000**

Bạn sẽ thấy trang Login.

### 3. Đăng nhập
- Username: `admin`
- Password: `123456`

### 4. Kiểm tra các chức năng
Sau khi đăng nhập, bạn sẽ thấy:
- ✅ Dashboard với thống kê
- ✅ Menu sidebar với các module
- ✅ Có thể truy cập các trang:
  - Khách hàng
  - Sản phẩm
  - Báo giá
  - Đơn hàng
  - Giao hàng
  - Hóa đơn
  - Báo cáo

## 🐛 Troubleshooting

### Lỗi: Port 5000 đã được sử dụng
**Giải pháp 1**: Đổi port trong `backend/.env`
```env
PORT=5001
```

**Giải pháp 2**: Tìm và kill process đang dùng port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Lỗi: Port 3000 đã được sử dụng
Vite sẽ tự động chọn port khác (3001, 3002...). Hoặc:
```bash
# Chỉ định port khác
npm run dev -- --port 3001
```

### Lỗi: Cannot find module
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Database connection failed
- Kiểm tra quyền ghi file trong thư mục `backend/`
- Xóa file `backend/database.sqlite` và chạy lại server

### Lỗi: CORS
Kiểm tra `CORS_ORIGIN` trong `backend/.env` khớp với URL frontend:
```env
CORS_ORIGIN=http://localhost:3000
```

### Lỗi: 401 Unauthorized
- Token hết hạn: Đăng xuất và đăng nhập lại
- Xóa localStorage: F12 → Application → Local Storage → Clear

### Frontend không gọi được API
Kiểm tra `VITE_API_URL` trong `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**Lưu ý**: Sau khi sửa file .env, cần restart server!

## 📊 Kiểm tra Database

### Xem database SQLite
**Option 1**: Sử dụng DB Browser for SQLite
- Download: https://sqlitebrowser.org/
- Mở file: `backend/database.sqlite`

**Option 2**: Sử dụng VS Code extension
- Cài extension: "SQLite Viewer"
- Click vào file `database.sqlite`

### Các bảng trong database:
- User (Người dùng)
- Customer (Khách hàng)
- Product (Sản phẩm)
- Quotation (Báo giá)
- Order (Đơn hàng)
- Delivery (Giao hàng)
- Invoice (Hóa đơn)

## 🔄 Reset Database

Nếu muốn reset database về trạng thái ban đầu:

```bash
# Dừng backend server (Ctrl+C)

# Xóa database
cd backend
rm database.sqlite

# Chạy lại server (database sẽ được tạo mới)
npm run dev

# Tạo lại admin
npm run create-admin
```

## 📝 Tạo thêm user

### Cách 1: Qua API
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "sales01",
  "email": "sales01@company.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "role": "sales_staff",
  "phone": "0123456789"
}
```

### Cách 2: Qua giao diện (sau khi đăng nhập admin)
- Vào menu "Người dùng" (nếu có)
- Click "Thêm người dùng"
- Điền thông tin và lưu

## 🎯 Các bước tiếp theo

1. ✅ Đăng nhập với tài khoản admin
2. ✅ Đổi mật khẩu admin
3. ✅ Tạo thêm users với các roles khác nhau
4. ✅ Thêm dữ liệu mẫu:
   - Khách hàng
   - Sản phẩm
   - Báo giá
   - Đơn hàng
5. ✅ Test các chức năng CRUD
6. ✅ Kiểm tra phân quyền
7. ✅ Xem báo cáo và dashboard

## 📚 Tài liệu bổ sung

- [README.md](./README.md) - Tổng quan dự án
- [API Documentation](./docs/API_DOCUMENTATION.md) - Chi tiết API
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Cấu trúc database
- [Migrate to Supabase](./docs/MIGRATE_TO_SUPABASE.md) - Chuyển sang PostgreSQL

## 💡 Tips

1. **Development**: Luôn chạy backend trước, frontend sau
2. **Hot Reload**: Cả backend và frontend đều hỗ trợ hot reload
3. **Debugging**: Sử dụng console.log hoặc debugger
4. **API Testing**: Dùng Postman hoặc Thunder Client (VS Code)
5. **Database**: Backup file `database.sqlite` thường xuyên

## 🎉 Hoàn thành!

Nếu mọi thứ hoạt động tốt, bạn đã setup thành công!

Chúc bạn code vui vẻ! 🚀
