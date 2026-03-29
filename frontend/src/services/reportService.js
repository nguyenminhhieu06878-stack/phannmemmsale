import api from './api';

export const reportService = {
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getCustomerReport: (params) => api.get('/reports/customers', { params }),
  getProductReport: (params) => api.get('/reports/products', { params }),
  getSalesPerformance: (params) => api.get('/reports/sales-performance', { params }),
  getDashboardStats: () => api.get('/reports/dashboard')
};
