const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Preference = sequelize.define('Preference', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users', 
      key: 'id'
    }
  },
  enableContextBasedAuth: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { User } = models;
  
  Preference.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'  // Delete preference when user is deleted
  });
};

module.exports = {
  Preference,
  setupAssociations
};
