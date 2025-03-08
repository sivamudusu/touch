const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const fs = require('fs').promises;
const path = require('path');
const Comment = require('./comment.model');
const User = require('./user.model');
const Community = require('./community.model');
const Like = require('./like.model');

const Post = sequelize.define('Post', {
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: Sequelize.STRING,
  },
  fileType: {
    type: Sequelize.STRING,
    allowNull: true
  },
  communityId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Communities',
      key: 'id',
    },
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  }
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { User, Community, Comment, Like } = models;
  
  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
  });

  Post.belongsTo(Community, {
    foreignKey: 'communityId'
  });

  Post.hasMany(Comment, { 
    foreignKey: 'postId', 
    onDelete: 'CASCADE' 
  });

  Post.hasMany(Like, { 
    foreignKey: 'postId', 
    onDelete: 'CASCADE' 
  });

  // File deletion hooks
  Post.beforeDestroy(async (post, options) => {
    try {
      if (post.fileUrl) {
        const filename = path.basename(post.fileUrl);
        await fs.unlink(path.join(__dirname, '../assets/userFiles', filename));
      }
    } catch (error) {
      throw new Error('Error deleting file: ' + error.message);
    }
  });
};

module.exports = {
  Post,
  setupAssociations
};
