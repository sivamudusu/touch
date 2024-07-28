
const Sequelize = require('sequelize');
const sequelize = require('../utils/database');


const Config = sequelize.define('Config', {
    usePerspectiveAPI: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    categoryFilteringServiceProvider: {
      type: Sequelize.ENUM('TextRazor', 'InterfaceAPI', 'ClassifierAPI', 'disabled'),
      allowNull: false,
      defaultValue: 'disabled'
    },
    categoryFilteringRequestTimeout: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30000,
      validate: {
        min: 5000,
        max: 500000
      }
    }
  }, {
    validate: {
      // Custom validation logic if needed
    },
    timestamps: true
  });
  
  module.exports = Config;