# Hướng dẫn Deploy

## Tổng quan

- **Frontend**: Deploy lên Vercel
- **Backend**: Deploy lên Railway
- **Database**: MongoDB Atlas (Cloud)

---

## 1. Chuẩn bị trước khi Deploy

### 1.1 Tạo tài khoản
- [ ] Tài khoản GitHub (để kết nối với Vercel và Railway)
- [ ] Tài khoản Vercel: https://vercel.com
- [ ] Tài khoản Railway: https://railway.app
- [ ] Tài khoản MongoDB Atlas: https://www.mongodb.com/cloud/atlas

### 1.2 Push code lên GitHub
```bash
# Khởi tạo Git repository
git init
git add .
git commit -m "Initial commit"

# Tạo repository trên GitHub và push
git remote add origin https://github.com/username/erp-sales.git
git branch -M main
git push -u origin main
```

---

## 2. Setup MongoDB Atlas

### Bước 1: Tạo Cluster
1. Đăng nhập vào MongoDB Atlas
2. Click "Build a Database"
3. Chọn "FREE" (M0 Sandbox)
4. Chọn region gần nhất (Singapore cho VN)
5. Đặt tên cluster: `erp-sales-cluster`
6. Click "Create"

### Bước 2: Tạo Database User
1. Vào "Database Access"
2. Click "Add New Database User"
3. Username: `erp_admin`
4. Password: Tạo password mạnh (lưu lại)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Bước 3: Whitelist IP
1. Vào "Network Access"
2. Click "Add IP Address"
3. Chọn "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Bước 4: Lấy Connection String
1. Vào "Database" → Click "Connect"
2. Chọn "Connect your application"
3. Copy connection string:
```
mongodb+srv://erp_admin:<password>@erp-sales-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Thay `<password>` bằng password thực tế
5. Thêm database name vào cuối: `/erp_sales`

**Connection String cuối cùng:**
```
mongodb+srv://erp_admin:your_password@erp-sales-cluster.xxxxx.mongodb.net/erp_sales?retryWrites=true&w=majority
```

---

## 3. Deploy Backend lên Railway

### Bước 1: Chuẩn bị Backend

#### Tạo file `backend/package.json` (nếu chưa có)
```json
{
  "name": "erp-sales-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Tạo file `backend/.env.example`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### Cập nhật `backend/server.js`
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/orders', require('./src/routes/orders'));
// ... other routes

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Bước 2: Deploy lên Railway

#### Option 1: Deploy từ GitHub (Recommended)

1. Đăng nhập Railway: https://railway.app
2. Click "New Project"
3. Chọn "Deploy from GitHub repo"
4. Authorize Railway với GitHub
5. Chọn repository `erp-sales`
6. Railway sẽ tự động detect và deploy

#### Option 2: Deploy bằng Railway CLI

```bash
# Cài đặt Railway CLI
npm install -g @railway/cli

# Login
railway login

# Khởi tạo project
cd backend
railway init

# Deploy
railway up
```

### Bước 3: Cấu hình Environment Variables

1. Vào Railway Dashboard → Project của bạn
2. Click vào service "backend"
3. Vào tab "Variables"
4. Thêm các biến môi trường:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://erp_admin:password@cluster.mongodb.net/erp_sales
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-app.vercel.app
```

5. Click "Add" cho mỗi biến

### Bước 4: Lấy Backend URL

1. Vào tab "Settings"
2. Scroll xuống "Domains"
3. Click "Generate Domain"
4. Copy URL (ví dụ: `https://erp-sales-backend.up.railway.app`)
5. Lưu lại URL này để cấu hình Frontend

### Bước 5: Test Backend

```bash
# Test health check
curl https://your-backend.up.railway.app/health

# Test API
curl https://your-backend.up.railway.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

---

## 4. Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị Frontend

#### Tạo file `frontend/.env.example`
```env
VITE_API_URL=http://localhost:5000/api
```

#### Tạo file `frontend/.env.production`
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

#### Cập nhật `frontend/src/services/api.js`
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Tạo file `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Bước 2: Deploy lên Vercel

#### Option 1: Deploy từ Vercel Dashboard (Recommended)

1. Đăng nhập Vercel: https://vercel.com
2. Click "Add New..." → "Project"
3. Import repository từ GitHub
4. Chọn repository `erp-sales`
5. Cấu hình project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Thêm Environment Variables:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
7. Click "Deploy"

#### Option 2: Deploy bằng Vercel CLI

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Deploy production
vercel --prod
```

### Bước 3: Cấu hình Custom Domain (Optional)

1. Vào Vercel Dashboard → Project
2. Vào tab "Settings" → "Domains"
3. Thêm domain của bạn
4. Cấu hình DNS theo hướng dẫn

### Bước 4: Test Frontend

1. Mở URL Vercel (ví dụ: `https://erp-sales.vercel.app`)
2. Test đăng nhập
3. Test các chức năng chính

---

## 5. Cập nhật CORS trên Backend

Sau khi có URL Vercel, cập nhật CORS_ORIGIN trên Railway:

1. Vào Railway Dashboard
2. Vào Variables
3. Cập nhật `CORS_ORIGIN`:
```
CORS_ORIGIN=https://erp-sales.vercel.app
```
4. Railway sẽ tự động redeploy

---

## 6. Setup CI/CD (Auto Deploy)

### GitHub Actions cho Frontend

Tạo file `.github/workflows/deploy-frontend.yml`:
```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy to Vercel
        run: |
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Auto Deploy Backend

Railway tự động deploy khi có push lên GitHub (nếu deploy từ GitHub).

---

## 7. Monitoring & Logs

### Railway Logs
1. Vào Railway Dashboard
2. Click vào service
3. Vào tab "Deployments"
4. Click vào deployment để xem logs

### Vercel Logs
1. Vào Vercel Dashboard
2. Click vào project
3. Vào tab "Deployments"
4. Click vào deployment để xem logs

---

## 8. Backup & Recovery

### MongoDB Atlas Backup
1. Vào MongoDB Atlas
2. Vào "Backup" tab
3. Enable "Cloud Backup"
4. Cấu hình backup schedule

### Code Backup
- Code được backup trên GitHub
- Vercel và Railway tự động lưu deployment history

---

## 9. Troubleshooting

### Backend không kết nối được MongoDB
```bash
# Check connection string
# Verify IP whitelist (0.0.0.0/0)
# Check database user credentials
```

### Frontend không gọi được API
```bash
# Check VITE_API_URL
# Check CORS settings
# Check network tab trong browser DevTools
```

### Railway deployment failed
```bash
# Check logs trong Railway Dashboard
# Verify package.json có "start" script
# Check Node version trong engines
```

### Vercel build failed
```bash
# Check build logs
# Verify vite.config.js
# Check dependencies trong package.json
```

---

## 10. Cost Estimate

### Free Tier Limits

**MongoDB Atlas (Free)**
- 512 MB storage
- Shared RAM
- Đủ cho development/testing

**Railway (Free Trial)**
- $5 credit/month
- ~500 hours runtime
- Sau đó: ~$5-20/month

**Vercel (Free)**
- 100 GB bandwidth/month
- Unlimited deployments
- Đủ cho small-medium projects

### Paid Plans (nếu cần scale)

**MongoDB Atlas**
- M10: $57/month (2GB RAM, 10GB storage)
- M20: $116/month (4GB RAM, 20GB storage)

**Railway**
- $5/month base + usage
- ~$10-50/month depending on traffic

**Vercel**
- Pro: $20/month/member
- Unlimited bandwidth
- Advanced features

---

## 11. Security Checklist

- [ ] Đổi JWT_SECRET thành giá trị random mạnh
- [ ] Đổi MongoDB password mạnh
- [ ] Enable HTTPS (Vercel và Railway tự động)
- [ ] Cấu hình CORS đúng domain
- [ ] Không commit .env files
- [ ] Enable rate limiting
- [ ] Setup monitoring và alerts
- [ ] Regular backup database
- [ ] Keep dependencies updated

---

## 12. Post-Deployment

### Tạo Admin User đầu tiên
```bash
# Connect to MongoDB Atlas
# Insert admin user manually hoặc tạo seed script

# Hoặc tạo API endpoint tạm để register admin (sau đó disable)
POST https://your-backend.up.railway.app/api/auth/register
{
  "username": "admin",
  "email": "admin@company.com",
  "password": "secure_password",
  "fullName": "System Admin",
  "role": "admin"
}
```

### Test Production
1. Login với admin account
2. Tạo test data
3. Test các chức năng chính
4. Test trên mobile
5. Check performance

---

## Quick Reference

### URLs
```
Frontend: https://erp-sales.vercel.app
Backend: https://erp-sales-backend.up.railway.app
MongoDB: mongodb+srv://...
```

### Commands
```bash
# Deploy frontend
cd frontend && vercel --prod

# View Railway logs
railway logs

# Connect to MongoDB
mongosh "mongodb+srv://cluster.mongodb.net/erp_sales" --username erp_admin
```
