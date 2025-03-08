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

const setupAssociations = (models) => {
  const { User } = models;
  
  Relationship.belongsTo(User, {
    foreignKey: 'followerId',
    as: 'follower'
  });

  Relationship.belongsTo(User, {
    foreignKey: 'followingId', 
    as: 'following'
  });
};

module.exports = {
  Relationship,
  setupAssociations
};
