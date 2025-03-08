const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const SuspiciousLogin = sequelize.define('SuspiciousLogin', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false
  },
  city: {
    type: Sequelize.STRING,
    allowNull: false
  },
  browser: {
    type: Sequelize.STRING,
    allowNull: false
  },
  platform: {
    type: Sequelize.STRING,
    allowNull: false
  },
  os: {
    type: Sequelize.STRING,
    allowNull: false
  },
  device: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deviceType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  unverifiedAttempts: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  isBlocked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isTrusted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { User } = models;
  
  SuspiciousLogin.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
};

module.exports = {
  SuspiciousLogin,
  setupAssociations
};
