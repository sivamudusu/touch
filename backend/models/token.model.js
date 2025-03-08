const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Token = sequelize.define('Token', {
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false
  },
  refreshToken: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

const setupAssociations = (models) => {
  const { User } = models;
  
  Token.belongsTo(User, {
    foreignKey: 'userId'
  });
};

module.exports = {
  Token,
  setupAssociations
};
