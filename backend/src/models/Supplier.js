const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  supplierCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      isUppercase: true,
      len: [3, 20]
    }
  },
  companyName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  contactPerson: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[0-9+\-\s()]+$/
    }
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  taxCode: {
    type: DataTypes.STRING(20),
    validate: {
      len: [10, 20]
    }
  },
  bankInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  supplierType: {
    type: DataTypes.ENUM('manufacturer', 'distributor', 'wholesaler', 'retailer'),
    defaultValue: 'distributor'
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
    defaultValue: '30 days'
  },
  deliveryTerms: {
    type: DataTypes.STRING(100),
    defaultValue: 'FOB'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 5.0,
    validate: {
      min: 1.0,
      max: 5.0
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'suppliers',
  indexes: [
    {
      unique: true,
      fields: ['supplierCode']
    },
    {
      fields: ['companyName']
    },
    {
      fields: ['supplierType']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Supplier;