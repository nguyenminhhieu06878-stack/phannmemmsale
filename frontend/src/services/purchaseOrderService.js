import api from './api';

export const purchaseOrderService = {
  // Get all purchase orders
  getAllPurchaseOrders: (params = {}) => {
    return api.get('/purchase-orders', { params });
  },

  // Get purchase order by ID
  getPurchaseOrderById: (id) => {
    return api.get(`/purchase-orders/${id}`);
  },

  // Create purchase order from stock request
  createPurchaseOrder: (purchaseOrderData) => {
    return api.post('/purchase-orders', purchaseOrderData);
  },

  // Send purchase order to supplier
  sendPurchaseOrder: (id) => {
    return api.put(`/purchase-orders/${id}/send`);
  },

  // Supplier confirms purchase order
  confirmPurchaseOrder: (id, confirmationData) => {
    return api.put(`/purchase-orders/${id}/confirm`, confirmationData);
  },

  // Supplier marks as shipped
  markAsShipped: (id, shippingData) => {
    return api.put(`/purchase-orders/${id}/ship`, shippingData);
  },

  // Supplier marks as shipped with images
  markAsShippedWithImages: (id, formData) => {
    return api.put(`/purchase-orders/${id}/ship`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Warehouse staff confirms receipt
  confirmReceipt: (id, receiptData) => {
    return api.put(`/purchase-orders/${id}/receive`, receiptData);
  },

  // Warehouse staff confirms receipt with images
  confirmReceiptWithImages: (id, formData) => {
    return api.put(`/purchase-orders/${id}/receive`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Warehouse staff rejects delivery due to quality issues
  rejectDelivery: (id, rejectionData) => {
    return api.put(`/purchase-orders/${id}/reject`, rejectionData);
  },

  // Warehouse staff rejects delivery with images
  rejectDeliveryWithImages: (id, formData) => {
    return api.put(`/purchase-orders/${id}/reject`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get supplement orders (for suppliers)
  getSupplementOrders: (params = {}) => {
    return api.get('/purchase-orders/supplements', { params });
  },

  // Handle supplement order (supplier actions)
  handleSupplementOrder: (id, actionData) => {
    return api.put(`/purchase-orders/${id}/supplement`, actionData);
  },

  // Confirm replacement for rejected order
  confirmReplacement: (id, confirmationData) => {
    return api.put(`/purchase-orders/${id}/confirm-replacement`, confirmationData);
  },

  // Ship replacement for rejected order
  shipReplacement: (id, shippingData) => {
    return api.put(`/purchase-orders/${id}/ship-replacement`, shippingData);
  }
};