const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Email = sequelize.define('Email', {
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    verificationCode: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    messageId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    for: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
  
  module.exports = Email;