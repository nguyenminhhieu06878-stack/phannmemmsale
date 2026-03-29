import api from './api';

export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  approve: (id) => api.post(`/orders/${id}/approve`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  completeWithImages: (id, formData) => api.patch(`/orders/${id}/complete`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
};
