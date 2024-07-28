
const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Log = sequelize.define('Log', {
    email: {
      type: Sequelize.STRING
    },
    context: {
      type: Sequelize.STRING // Assuming context is encrypted and stored as a string
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    level: {
      type: Sequelize.STRING,
      allowNull: false
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
  
  module.exports = Log;