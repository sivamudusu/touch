const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Rule = sequelize.define('Rule', {
  rule: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Rule;
