const { Order, Invoice, Customer, Product, User, Quotation } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await Order.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalRevenue = await Order.sum('totalAmount', { where });
    const totalOrders = await Order.count({ where });
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paidInvoices = await Invoice.sum('paidAmount', {
      where: { ...where, status: 'paid' }
    });

    const pendingInvoices = await Invoice.sum('remainingAmount', {
      where: { ...where, status: { [Op.in]: ['sent', 'partial', 'overdue'] } }
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        totalOrders: totalOrders || 0,
        avgOrderValue: avgOrderValue || 0,
        paidAmount: paidInvoices || 0,
        pendingAmount: pendingInvoices || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const topCustomers = await sequelize.query(`
      SELECT 
        c.id,
        c.companyName,
        c.email,
        c.customerType,
        c.phone,
        COALESCE(COUNT(o.id), 0) as orderCount,
        COALESCE(SUM(o.totalAmount), 0) as totalSpent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customerId
      GROUP BY c.id, c.companyName, c.email, c.customerType, c.phone
      ORDER BY totalSpent DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ success: true, data: topCustomers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Product report
exports.getProductReport = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: sequelize.col('minStock')
        }
      },
      order: [['stock', 'ASC']],
      limit: 20
    });

    const totalProducts = await Product.count();
    const outOfStock = await Product.count({
      where: { stock: 0 }
    });

    res.json({
      success: true,
      data: {
        lowStockProducts,
        totalProducts,
        outOfStock
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sales performance report
exports.getSalesPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const salesPerformance = await User.findAll({
      where: { role: 'sales' },
      attributes: [
        'id',
        'username',
        'fullName',
        [sequelize.fn('COUNT', sequelize.col('orders.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('orders.totalAmount')), 'totalRevenue']
      ],
      include: [{
        model: Order,
        as: 'orders',
        attributes: [],
        where
      }],
      group: ['User.id'],
      order: [[sequelize.fn('SUM', sequelize.col('orders.totalAmount')), 'DESC']]
    });

    res.json({ success: true, data: salesPerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('totalAmount');

    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const pendingQuotations = await Quotation.count({ where: { status: 'pending' } });
    
    const overdueInvoices = await Invoice.count({
      where: {
        status: 'overdue'
      }
    });

    const lowStockProducts = await Product.count({
      where: {
        stock: {
          [Op.lte]: sequelize.col('minStock')
        }
      }
    });

    // Get payment summary from invoices
    const paidAmount = await Invoice.sum('paidAmount') || 0;
    const pendingAmount = await Invoice.sum('remainingAmount') || 0;
    const invoiceRevenue = await Invoice.sum('totalAmount') || 0;

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue || 0,
        pendingOrders,
        pendingQuotations,
        overdueInvoices,
        lowStockProducts,
        // Payment info from invoices
        paidAmount,
        pendingAmount,
        invoiceRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
