const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user.model');
const Post = require('./post.model');


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
    timestamps: true,
  });
  
  module.exports = Comment;