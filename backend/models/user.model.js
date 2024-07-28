const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const Post = require('./post.model');
const Community = require('./community.model');


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

User.belongsToMany(User, { as: 'Followers', through: 'UserFollowers', foreignKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: 'UserFollowing', foreignKey: 'followingId' });
User.belongsToMany(Post, { through: 'SavedPosts', foreignKey: 'userId' });
// User model
User.belongsToMany(Community, { as: "membersOf", through: "CommunityMembers", foreignKey: "userId" });
Community.belongsToMany(User, { as: "members", through: "CommunityMembers", foreignKey: "communityId" });
Post.belongsTo(User ,{foreignKey : "userId"})

User.belongsToMany(Community, { as: "bannedMembersOf", through: "BannedCommunityMembers", foreignKey: "userId" });
Community.belongsToMany(User, { as: "bannedMembers", through: "BannedCommunityMembers", foreignKey: "communityId" });

module.exports = User;
