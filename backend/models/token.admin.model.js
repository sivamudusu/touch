const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const AdminToken = sequelize.define('AdminToken', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = AdminToken;
