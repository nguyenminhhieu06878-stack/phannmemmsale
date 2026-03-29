import api from './api';

export const supplierService = {
  // Get all suppliers
  getAllSuppliers: (params = {}) => {
    return api.get('/suppliers', { params });
  },

  // Get supplier by ID
  getSupplierById: (id) => {
    return api.get(`/suppliers/${id}`);
  },

  // Create new supplier
  createSupplier: (supplierData) => {
    return api.post('/suppliers', supplierData);
  },

  // Update supplier
  updateSupplier: (id, supplierData) => {
    return api.put(`/suppliers/${id}`, supplierData);
  },

  // Delete supplier
  deleteSupplier: (id) => {
    return api.delete(`/suppliers/${id}`);
  }
};