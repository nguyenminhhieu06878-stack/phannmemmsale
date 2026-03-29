const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { connectDB } = require('./src/config/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ERP Sales API Server is running!',
    version: '1.0.0',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/quotations', require('./src/routes/quotations'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/deliveries', require('./src/routes/deliveries'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/stock-requests', require('./src/routes/stockRequests'));
app.use('/api/suppliers', require('./src/routes/suppliers'));
app.use('/api/purchase-orders', require('./src/routes/purchaseOrders'));

// Error handling middleware
app.use(require('./src/middlewares/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: PostgreSQL`);
});

module.exports = app;