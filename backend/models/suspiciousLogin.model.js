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
    allowNull: false,
    defaultValue: 0
  },
  isTrusted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isBlocked: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = SuspiciousLogin;
