const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Report = sequelize.define('Report', {
  reportReason: {
    type: Sequelize.STRING,
    allowNull: false
  },
  reportDate: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
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
  }
}, {
  timestamps: true
});

const setupAssociations = (models) => {
  const { User, Post, Community } = models;
  
  Report.belongsTo(Post, {
    foreignKey: 'postId'
  });
  
  Report.belongsTo(Community, {
    foreignKey: 'communityId'
  });
  
  Report.belongsToMany(User, {
    through: 'ReportedBy',
    foreignKey: 'reportId'
  });
};

module.exports = {
  Report,
  setupAssociations
};
