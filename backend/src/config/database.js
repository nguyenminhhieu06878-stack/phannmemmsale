const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully');
    
    // Import models to ensure they are registered
    require('../models');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
