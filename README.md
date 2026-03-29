# Hệ thống ERP - Quản lý Sales cho Nhà máy Sản xuất Điện tử

## Giới thiệu
Hệ thống ERP tập trung vào quản lý công đoạn Sales (bán hàng) cho nhà máy sản xuất sản phẩm điện tử, giúp tự động hóa quy trình bán hàng từ báo giá đến giao hàng.

## Tính năng chính

### ✅ Đã hoàn thành
- 🔐 Xác thực & phân quyền người dùng (JWT)
- 👥 Quản lý khách hàng (CRUD)
- 📦 Quản lý sản phẩm & tồn kho
- 💰 Quản lý báo giá
- 📋 Quản lý đơn hàng
- 🚚 Quản lý giao hàng
- 🧾 Quản lý hóa đơn & thanh toán
- 📊 Dashboard & báo cáo thống kê
- 🗄️ Database SQLite (dễ setup, không cần cài đặt)

## Công nghệ sử dụng

### Frontend
- React 18 + Vite
- Redux Toolkit (State Management)
- Ant Design (UI Components)
- Axios (HTTP Client)
- React Router v6

### Backend
- Node.js 18+ + Express.js
- SQLite (Database)
- Sequelize ORM
- JWT Authentication
- bcryptjs (Password Hashing)

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Git

### 1. Clone repository
```bash
git clone <repository-url>
cd erp-sales-system
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

File `.env` đã được cấu hình sẵn cho SQLite. Database sẽ tự động được tạo khi chạy server.

```bash
# Chạy backend
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

Database SQLite sẽ được tạo tại: `backend/database.sqlite`

### 3. Tạo tài khoản admin đầu tiên
Mở terminal mới và chạy:
```bash
cd backend
npm run create-admin
```

Thông tin đăng nhập mặc định:
- **Username**: admin
- **Password**: 123456
- **Email**: admin@company.com

### 4. Cài đặt Frontend
Mở terminal mới:
```bash
cd frontend
npm install
```

Cập nhật file `frontend/.env` nếu cần:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Chạy frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

### 5. Truy cập ứng dụng
1. Mở trình duyệt: http://localhost:3000
2. Đăng nhập với tài khoản admin đã tạo
3. Bắt đầu sử dụng!

## Cấu trúc dự án

```
erp-sales-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình database, JWT
│   │   ├── controllers/     # Business logic
│   │   ├── middlewares/     # Auth, error handling
│   │   ├── models/          # Sequelize models
│   │   └── routes/          # API routes
│   ├── scripts/             # Utility scripts
│   ├── database.sqlite      # SQLite database (auto-generated)
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store & slices
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── .env                 # Environment variables
│
└── docs/                    # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `GET /api/customers/:id` - Chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `PATCH /api/products/:id/stock` - Cập nhật tồn kho

### Orders, Quotations, Invoices, Deliveries
Tương tự như trên với các endpoints CRUD đầy đủ.

### Reports
- `GET /api/reports/dashboard` - Thống kê dashboard
- `GET /api/reports/sales` - Báo cáo doanh số
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/customers` - Báo cáo khách hàng
- `GET /api/reports/products` - Báo cáo sản phẩm

## Phân quyền người dùng

- **Admin**: Toàn quyền
- **Sales Manager**: Quản lý sales, duyệt đơn hàng
- **Sales Staff**: Tạo báo giá, đơn hàng
- **Accountant**: Quản lý hóa đơn, thanh toán
- **Warehouse Staff**: Quản lý kho, sản phẩm
- **Delivery Staff**: Cập nhật trạng thái giao hàng
- **Director**: Xem báo cáo, duyệt đơn hàng

## Scripts hữu ích

### Backend
```bash
npm run dev          # Chạy development server
npm start            # Chạy production server
npm run create-admin # Tạo tài khoản admin
```

### Frontend
```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
```

## Troubleshooting

### Backend không kết nối được database
- Kiểm tra quyền ghi file trong thư mục `backend/`
- Xóa file `database.sqlite` và chạy lại server để tạo mới

### Frontend không gọi được API
- Kiểm tra `VITE_API_URL` trong `frontend/.env`
- Đảm bảo backend đang chạy ở port 5000

### Lỗi CORS
- Kiểm tra `CORS_ORIGIN` trong `backend/.env`
- Đảm bảo frontend URL khớp với CORS_ORIGIN

## Tài liệu chi tiết

- [Quick Start Guide](./docs/QUICK_START.md)
- [Yêu cầu chức năng](./docs/REQUIREMENTS.md)
- [Thiết kế hệ thống](./docs/SYSTEM_DESIGN.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

## Roadmap

### Phase 1 ✅ (Hoàn thành)
- Setup project structure
- Authentication & Authorization
- Basic CRUD operations
- Database models & relationships

### Phase 2 ✅ (Hoàn thành)
- Customer management
- Product management
- Quotation management
- Order management

### Phase 3 ✅ (Hoàn thành)
- Delivery management
- Invoice & Payment
- Dashboard & Reports
- Full API implementation

### Phase 4 🚧 (Đang phát triển)
- Advanced UI/UX
- Real-time notifications
- Export to Excel/PDF
- Email integration
- Advanced analytics

## Đóng góp
Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## License
MIT License

## Liên hệ
- Email: support@example.com
- Website: https://example.com
