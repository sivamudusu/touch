const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Relationship = sequelize.define('Relationship', {
  followerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  followingId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Relationship;
