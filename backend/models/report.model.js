const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const Post = require('./post.model');
const Community = require('./community.model');
const User = require('./user.model');

const Report = sequelize.define('Report', {
  postId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  communityId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Communities',
      key: 'id'
    }
  },
  reportReason: {
    type: Sequelize.STRING,
    allowNull: false
  },
  reportDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

Report.belongsTo(Post, { foreignKey: 'postId' });
Report.belongsTo(Community, { foreignKey: 'communityId' });
Report.belongsToMany(User, { through: 'ReportedUsers', foreignKey: 'reportId' });

module.exports = Report;
