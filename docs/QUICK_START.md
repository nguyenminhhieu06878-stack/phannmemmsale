# Quick Start Guide

Hướng dẫn nhanh để chạy dự án trên local và deploy lên production.

## 🚀 Chạy trên Local

### Yêu cầu
- Node.js 18+ 
- MongoDB (local hoặc Atlas)
- Git

### Bước 1: Clone và cài đặt

```bash
# Clone repository
git clone https://github.com/username/erp-sales.git
cd erp-sales

# Cài đặt dependencies cho Backend
cd backend
npm install

# Cài đặt dependencies cho Frontend
cd ../frontend
npm install
```

### Bước 2: Cấu hình môi trường

#### Backend
```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

File `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp_sales
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

#### Frontend
```bash
cd frontend
cp .env.example .env
```

File `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Bước 3: Chạy MongoDB

#### Option 1: MongoDB Local
```bash
# macOS (với Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Chạy MongoDB từ Services hoặc command line
```

#### Option 2: MongoDB Atlas (Cloud)
1. Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
2. Tạo free cluster
3. Lấy connection string
4. Cập nhật MONGODB_URI trong .env

### Bước 4: Chạy ứng dụng

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server chạy tại http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App chạy tại http://localhost:3000
```

### Bước 5: Tạo Admin user đầu tiên

```bash
# Sử dụng API hoặc MongoDB shell
# POST http://localhost:5000/api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "fullName": "System Admin",
    "role": "admin"
  }'
```

### Bước 6: Đăng nhập

1. Mở http://localhost:3000
2. Đăng nhập với:
   - Username: `admin`
   - Password: `admin123`

---

## 🌐 Deploy lên Production

### Chuẩn bị

1. **Push code lên GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Tạo tài khoản**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Railway: https://railway.app
- Vercel: https://vercel.com

### Deploy Database (MongoDB Atlas)

1. Tạo free cluster trên MongoDB Atlas
2. Tạo database user
3. Whitelist IP: 0.0.0.0/0 (allow all)
4. Lấy connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/erp_sales
```

### Deploy Backend (Railway)

1. Đăng nhập Railway
2. New Project → Deploy from GitHub
3. Chọn repository
4. Thêm Environment Variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=random_secret_key
CORS_ORIGIN=https://your-app.vercel.app
```
5. Deploy tự động
6. Lấy URL: `https://your-app.up.railway.app`

### Deploy Frontend (Vercel)

1. Đăng nhập Vercel
2. Import repository từ GitHub
3. Cấu hình:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
```
VITE_API_URL=https://your-backend.up.railway.app/api
```
5. Deploy
6. Lấy URL: `https://your-app.vercel.app`

### Cập nhật CORS

Quay lại Railway, cập nhật biến:
```
CORS_ORIGIN=https://your-app.vercel.app
```

### Test Production

1. Mở `https://your-app.vercel.app`
2. Tạo admin user (nếu chưa có)
3. Đăng nhập và test

---

## 📝 Checklist

### Development
- [ ] Node.js 18+ đã cài
- [ ] MongoDB đang chạy
- [ ] Backend dependencies đã cài
- [ ] Frontend dependencies đã cài
- [ ] File .env đã cấu hình
- [ ] Backend chạy được (port 5000)
- [ ] Frontend chạy được (port 3000)
- [ ] Tạo được admin user
- [ ] Đăng nhập thành công

### Production
- [ ] Code đã push lên GitHub
- [ ] MongoDB Atlas cluster đã tạo
- [ ] Railway backend đã deploy
- [ ] Vercel frontend đã deploy
- [ ] Environment variables đã cấu hình
- [ ] CORS đã cập nhật
- [ ] Admin user đã tạo
- [ ] Test production thành công

---

## 🔧 Troubleshooting

### Backend không chạy
```bash
# Check MongoDB connection
# Check port 5000 có bị chiếm không
# Check logs: npm run dev
```

### Frontend không gọi được API
```bash
# Check VITE_API_URL trong .env
# Check backend đang chạy
# Check CORS settings
# Mở DevTools → Network tab
```

### MongoDB connection error
```bash
# Local: Check MongoDB service đang chạy
# Atlas: Check connection string, IP whitelist, user credentials
```

### Deploy failed
```bash
# Railway: Check logs trong dashboard
# Vercel: Check build logs
# Verify environment variables
```

---

## 📚 Tài liệu chi tiết

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Hướng dẫn deploy chi tiết
- [Tech Stack](./TECH_STACK.md) - Chi tiết công nghệ
- [API Documentation](./API_DOCUMENTATION.md) - API endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Cấu trúc database

---

## 🆘 Cần trợ giúp?

- Đọc [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) để biết chi tiết
- Check logs trong Railway/Vercel dashboard
- Xem MongoDB Atlas logs
- Review environment variables

---

## 🎯 Next Steps

Sau khi chạy thành công:

1. Tạo thêm users với các roles khác nhau
2. Thêm customers, products
3. Tạo quotations và orders
4. Test workflow hoàn chỉnh
5. Customize UI theo nhu cầu
6. Thêm features mới

Good luck! 🚀
