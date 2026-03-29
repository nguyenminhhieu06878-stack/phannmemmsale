# Chi tiết Stack công nghệ

## Frontend - React + Vite

### Cấu trúc thư mục Frontend
```
frontend/
├── public/
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable components
│   │   ├── common/      # Button, Input, Modal...
│   │   ├── layout/      # Header, Sidebar, Footer
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   │   ├── Dashboard/
│   │   ├── Customers/
│   │   ├── Orders/
│   │   ├── Products/
│   │   └── Reports/
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API calls
│   ├── store/           # Redux/Zustand store
│   ├── utils/           # Helper functions
│   ├── routes/          # Route configuration
│   ├── App.jsx
│   └── main.jsx
├── .env
├── vite.config.js
└── package.json
```

### Packages Frontend chính
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "antd": "^5.12.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-hook-form": "^7.49.0",
    "yup": "^1.3.0",
    "dayjs": "^1.11.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## Backend - Node.js + Express + MongoDB

### Cấu trúc thư mục Backend
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   └── jwt.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Invoice.js
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── orderController.js
│   │   └── reportController.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── orders.js
│   │   └── index.js
│   ├── middlewares/     # Custom middlewares
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── services/        # Business logic
│   │   ├── orderService.js
│   │   ├── emailService.js
│   │   └── reportService.js
│   ├── utils/           # Helper functions
│   │   ├── logger.js
│   │   └── helpers.js
│   └── app.js
├── .env
├── .env.example
├── server.js
└── package.json
```

### Packages Backend chính
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.0",
    "joi": "^17.11.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0"
  }
}
```

### Environment Variables (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/erp_sales
# Hoặc MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_sales

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
```

---

## Database - MongoDB

### Đặc điểm MongoDB cho dự án này
- **NoSQL Document Database**: Linh hoạt với schema
- **Scalability**: Dễ dàng scale horizontal
- **JSON-like Documents**: Phù hợp với JavaScript stack
- **Mongoose ODM**: Schema validation và relationships

### Tại sao chọn MongoDB?
✅ Linh hoạt với cấu trúc dữ liệu thay đổi
✅ Performance tốt với read-heavy operations
✅ Dễ dàng lưu trữ nested documents
✅ Tích hợp tốt với Node.js ecosystem
✅ Hỗ trợ aggregation pipeline mạnh mẽ

### Lưu ý khi dùng MongoDB
⚠️ Cần thiết kế schema cẩn thận để tránh data duplication
⚠️ Không có ACID transactions mạnh như SQL (nhưng MongoDB 4.0+ đã hỗ trợ)
⚠️ Cần index đúng cách để tối ưu query performance

---

## API Design

### RESTful API Structure
```
GET    /api/customers           # Lấy danh sách khách hàng
POST   /api/customers           # Tạo khách hàng mới
GET    /api/customers/:id       # Lấy chi tiết khách hàng
PUT    /api/customers/:id       # Cập nhật khách hàng
DELETE /api/customers/:id       # Xóa khách hàng

GET    /api/orders              # Lấy danh sách đơn hàng
POST   /api/orders              # Tạo đơn hàng mới
GET    /api/orders/:id          # Lấy chi tiết đơn hàng
PUT    /api/orders/:id          # Cập nhật đơn hàng
PATCH  /api/orders/:id/status   # Cập nhật trạng thái

GET    /api/reports/sales       # Báo cáo doanh số
GET    /api/reports/revenue     # Báo cáo doanh thu
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## Authentication Flow

1. User login → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token
4. Client stores token (localStorage/sessionStorage)
5. Client sends token in Authorization header
6. Server validates token with middleware
7. Grant access based on role

```javascript
// Authorization Header
Authorization: Bearer <jwt_token>
```

---

## Development Workflow

### 1. Setup môi trường
```bash
# Install Node.js 18+
# Install MongoDB
# Clone repository
```

### 2. Backend Development
```bash
cd backend
npm install
npm run dev  # Chạy với nodemon
```

### 3. Frontend Development
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

### 4. Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Deployment

### Backend (Node.js)
- **Hosting**: Heroku, Railway, Render, DigitalOcean
- **Process Manager**: PM2
- **Environment**: Production .env

### Frontend (React)
- **Build**: `npm run build`
- **Hosting**: Vercel, Netlify, Cloudflare Pages
- **Static Files**: Serve from CDN

### Database (MongoDB)
- **Cloud**: MongoDB Atlas (recommended)
- **Self-hosted**: MongoDB Community Edition
- **Backup**: Automated daily backups
