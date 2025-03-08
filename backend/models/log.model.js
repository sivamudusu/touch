const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Log = sequelize.define('Log', {
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  context:{
    type: Sequelize.STRING,
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
    defaultValue: Sequelize.NOW
  }
});

const setupAssociations = (models) => {
  const { User } = models;
  
  Log.belongsTo(User, {
    foreignKey: 'email',
    targetKey: 'email'  // Specifying that this links to User's email field
  });
};

module.exports = {
  Log,
  setupAssociations
};