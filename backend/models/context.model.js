const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Context = sequelize.define('Context', {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    browser: {
      type: Sequelize.STRING,
      allowNull: false
    },
    platform: {
      type: Sequelize.STRING,
      allowNull: false
    },
    os: {
      type: Sequelize.STRING,
      allowNull: false
    },
    device: {
      type: Sequelize.STRING,
      allowNull: false
    },
    deviceType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isTrusted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    timestamps: true
  });
  
const setupAssociations = (models) => {
  const { User } = models;
  
  Context.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
};

module.exports = {
  Context,
  setupAssociations
};