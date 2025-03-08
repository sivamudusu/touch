const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const Post = require('./post.model');
const Community = require('./community.model');
const getCurrentContextData = require('../utils/contextData');


const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  avatar: {
    type: Sequelize.STRING
  },
  location: {
    type: Sequelize.STRING,
    defaultValue: ""
  },
  bio: {
    type: Sequelize.STRING,
    defaultValue: ""
  },
  interests: {
    type: Sequelize.STRING,
    defaultValue: ""
  },
  role: {
    type: Sequelize.ENUM('general', 'moderator', 'admin'),
    defaultValue: 'general'
  },
  isEmailVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { Post, Community, Preference, Context } = models;
  
  // Self-referential associations for following
  User.belongsToMany(User, { 
    as: 'Followers', 
    through: 'UserFollowers', 
    foreignKey: 'followerId' 
  });
  
  User.belongsToMany(User, { 
    as: 'Following', 
    through: 'UserFollowing', 
    foreignKey: 'followingId' 
  });

  // Post associations
  User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts'
  });

  // Community associations
  User.belongsToMany(Community, { 
    as: "membersOf", 
    through: "CommunityMembers", 
    foreignKey: "userId",
    otherKey: "communityId"
  });
  

  // Preference associations
  User.hasOne(Preference, {
    foreignKey: 'userId',
    as: 'preferences'
  });

  // Context associations
  User.hasMany(Context, {
    foreignKey: 'userId',
    as: 'contexts'
  });

  // Set up the afterCreate hook to create both preference and context
  User.addHook('afterCreate', async (user, options) => {
    try {
      // Create preference
      await Preference.create({ 
        userId: user.id,
        enableContextBasedAuth: true
      });

      // Create initial context from signup request
      if (options.req) { // Pass req in options when creating user
        const contextData = getCurrentContextData(options.req);
        await Context.create({
          userId: user.id,
          email: user.email,
          ...contextData,
          isTrusted: true // First signup context is trusted
        });
      }
    } catch (error) {
      console.error('Error in afterCreate hook:', error);
    }
  });
};

module.exports = {
  User,
  setupAssociations
};
