const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerCode: {
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
  taxCode: {
    type: DataTypes.STRING(20),
    validate: {
      len: [10, 20]
    }
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[0-9+\-\s()]+$/
    }
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: true
    }
  },
  customerType: {
    type: DataTypes.ENUM('vip', 'regular', 'new'),
    defaultValue: 'new'
  },
  assignedSalesId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  contacts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'customers',
  indexes: [
    {
      unique: true,
      fields: ['customerCode']
    },
    {
      fields: ['companyName']
    },
    {
      fields: ['assignedSalesId']
    },
    {
      fields: ['customerType']
    }
  ]
});

module.exports = Customer;