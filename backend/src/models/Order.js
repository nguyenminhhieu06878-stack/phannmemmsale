const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  quotationId: {
    type: DataTypes.UUID,
    references: {
      model: 'quotations',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  salesPersonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  paymentTerms: {
    type: DataTypes.STRING(100)
  },
  paymentMethod: {
    type: DataTypes.ENUM('prepayment', 'cod_cash', 'cod_transfer', 'credit_terms'),
    defaultValue: 'credit_terms',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  approvedById: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  preparationImages: {
    type: DataTypes.TEXT, // Store preparation image URLs as JSON array
    defaultValue: null
  },
  statusHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'orders',
  indexes: [
    {
      unique: true,
      fields: ['orderNumber']
    },
    {
      fields: ['customerId']
    },
    {
      fields: ['salesPersonId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Order;