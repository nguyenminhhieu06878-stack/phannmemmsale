const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  deliveryStaffId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  proofOfDelivery: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL or path to delivery proof image'
  },
  deliveryImages: {
    type: DataTypes.TEXT, // Store delivery image URLs as JSON array
    defaultValue: null
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'deliveries',
  timestamps: true
});

module.exports = Delivery;
