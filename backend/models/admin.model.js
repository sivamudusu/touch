const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const bcrypt = require('bcrypt');

const Admin = sequelize.define('Admin', {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
        isAlphanumeric: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6],
          msg: "Password must be at least 6 characters long!"
        }
      }
    }
  }, {
    timestamps: true,
    hooks: {
      async beforeCreate(admin) {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      async beforeUpdate(admin) {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  });
  
  module.exports = Admin;
