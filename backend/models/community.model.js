const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user.model');
const Rule = require('./rule.model');
const Post = require('./post.model');
const { FOREIGNKEYS } = require('sequelize/lib/query-types');


const Community = sequelize.define('Community', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    banner: {
      type: Sequelize.STRING
    },

  }, {
    timestamps: true
  });
  
  // Define associations

Community.hasmany
  // Community model

  
  module.exports = Community;