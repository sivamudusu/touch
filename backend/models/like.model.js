const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Like = sequelize.define('Like', {
  // Define the attributes of the Like model
  postId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts', // Name of the referenced model
      key: 'id', // Primary key of the referenced model
    },
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Name of the referenced model
      key: 'id', // Primary key of the referenced model
    },
  },
}, {
  // Define additional options for the model
  timestamps: true, // Automatically include createdAt and updatedAt timestamps
});

module.exports = Like;
