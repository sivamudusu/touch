const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

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

const setupAssociations = (models) => {
  const { User, Post } = models;
  
  Community.belongsToMany(User, { 
    as: "members", 
    through: "CommunityMembers", 
    foreignKey: "communityId",
    otherKey: "userId"
  });

  Community.belongsToMany(User, { 
    as: "bannedMembers", 
    through: "BannedCommunityMembers", 
    foreignKey: "communityId",
    otherKey: "userId"
  });

  Community.hasMany(Post, {
    foreignKey: 'communityId'
  });
};

module.exports = {
  Community,
  setupAssociations
};