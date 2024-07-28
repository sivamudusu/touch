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
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: true
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


Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Post.belongsTo(Community, { foreignKey: 'communityId' });
Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });

Post.beforeDestroy(async (post, options) => {
  try {
    if (post.fileUrl) {
      const filename = path.basename(post.fileUrl);
      await fs.unlink(path.join(__dirname, '../assets/userFiles', filename));
    }

    await Comment.destroy({ where: { postId: post.id } });
    await Report.destroy({ where: { postId: post.id } });
    await User.update({ savedPosts: sequelize.fn('array_remove', sequelize.col('savedPosts'), post.id) }, { where: { savedPosts: post.id } });
  } catch (error) {
    throw new Error('Error deleting file: ' + error.message);
  }
});

module.exports = Post;
