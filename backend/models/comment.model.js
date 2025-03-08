const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Comment = sequelize.define('Comment', {
  content: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  postId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id',
    },
  },
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { User, Post } = models;
  
  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
  });
  
  Comment.belongsTo(Post, {
    foreignKey: 'postId'
  });
};

module.exports = {
  Comment,
  setupAssociations
};