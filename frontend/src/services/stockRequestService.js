import api from './api';

const stockRequestService = {
  getAllStockRequests: (params) => api.get('/stock-requests', { params }),
  createStockRequest: (data) => api.post('/stock-requests', data),
  getStockRequestById: (id) => api.get(`/stock-requests/${id}`),
  updateStockRequestStatus: (id, data) => api.put(`/stock-requests/${id}/status`, data),
  deleteStockRequest: (id) => api.delete(`/stock-requests/${id}`)
};

export { stockRequestService };