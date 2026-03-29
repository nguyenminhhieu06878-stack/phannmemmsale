import api from './api';

export const quotationService = {
  getAll: (params) => api.get('/quotations', { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`),
  updateStatus: (id, status) => api.patch(`/quotations/${id}/status`, { status }),
  convertToOrder: (id) => api.post(`/quotations/${id}/convert-to-order`)
};
