const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  poNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  stockRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stock_requests',
      key: 'id'
    }
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true, // Allow null for draft orders
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true, // Allow null for draft orders
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'VND'
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true // Allow null for draft orders
  },
  deliveryAddress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
    defaultValue: '30 days'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'rejected', 'partial_received'),
    defaultValue: 'draft'
  },
  supplierConfirmedAt: {
    type: DataTypes.DATE
  },
  shippedAt: {
    type: DataTypes.DATE
  },
  deliveredAt: {
    type: DataTypes.DATE
  },
  receivedById: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receivedAt: {
    type: DataTypes.DATE
  },
  receivedQuantity: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  rejectedById: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rejectedAt: {
    type: DataTypes.DATE
  },
  parentOrderId: {
    type: DataTypes.UUID,
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  receiptImages: {
    type: DataTypes.TEXT, // Store image URLs as JSON array
    defaultValue: null
  },
  rejectionImages: {
    type: DataTypes.TEXT, // Store rejection image URLs as JSON array
    defaultValue: null
  },
  shippingImages: {
    type: DataTypes.TEXT, // Store shipping image URLs as JSON array
    defaultValue: null
  },
  notes: {
    type: DataTypes.TEXT
  },
  supplierNotes: {
    type: DataTypes.TEXT
  },
  trackingNumber: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'purchase_orders',
  indexes: [
    {
      unique: true,
      fields: ['poNumber']
    },
    {
      fields: ['stockRequestId']
    },
    {
      fields: ['supplierId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['deliveryDate']
    }
  ]
});

// Hooks for automatic calculation
PurchaseOrder.addHook('beforeSave', (purchaseOrder) => {
  if (purchaseOrder.quantity && purchaseOrder.unitPrice) {
    purchaseOrder.totalAmount = purchaseOrder.quantity * purchaseOrder.unitPrice;
  }
});

module.exports = PurchaseOrder;