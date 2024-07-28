const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Preference = sequelize.define('Preference', {
  user: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  enableContextBasedAuth: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Preference;
