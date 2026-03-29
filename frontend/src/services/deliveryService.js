import api from './api';

export const deliveryService = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  delete: (id) => api.delete(`/deliveries/${id}`),
  updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
  updateStatusWithImages: (id, formData) => api.patch(`/deliveries/${id}/status-with-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
};
