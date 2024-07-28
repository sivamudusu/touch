const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const fs = require('fs').promises;
const path = require('path');



const PendingPost = sequelize.define('PendingPost', {
  content: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  fileType: {
    type: Sequelize.STRING,
    allowNull: true
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending']]
    }
  },
  confirmationToken: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeDestroy: async (pendingPost, options) => {
      try {
        if (pendingPost.fileUrl) {
          const filename = path.basename(pendingPost.fileUrl);
          await fs.unlink(path.join(__dirname, '../assets/userFiles', filename));
        }
      } catch (error) {
        throw new Error('Error deleting file: ' + error.message);
      }
    }
  }
});

module.exports = PendingPost;
