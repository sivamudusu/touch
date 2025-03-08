const { User, setupAssociations: setupUserAssociations } = require('./user.model');
const { Post, setupAssociations: setupPostAssociations } = require('./post.model');
const { Community, setupAssociations: setupCommunityAssociations } = require('./community.model');
const { Comment, setupAssociations: setupCommentAssociations } = require('./comment.model');
const { Like, setupAssociations: setupLikeAssociations } = require('./like.model');
const { Report, setupAssociations: setupReportAssociations } = require('./report.model');
const { Log, setupAssociations: setupLogAssociations } = require('./log.model');
const { Token, setupAssociations: setupTokenAssociations } = require('./token.model');
const { Preference, setupAssociations: setupPreferenceAssociations } = require('./preference.model');
const { Relationship, setupAssociations: setupRelationshipAssociations } = require('./relationship.model');
const { Admin, setupAssociations: setupAdminAssociations } = require('./admin.model');
const { Config, setupAssociations: setupConfigAssociations } = require('./config.model');
const { Context, setupAssociations: setupContextAssociation } = require("./context.model");
const { SuspiciousLogin, setupAssociations: setupSuspiciousLoginAssociations } = require('./suspiciousLogin.model');

// Import other models...

// Set up all associations
const setupAssociations = () => {
  const models = {
    User,
    Post,
    Community,
    Comment,
    Like,
    Report,
    Log,
    Token,
    Preference,
    Context,
    Relationship,
    Admin,
    Config,
    SuspiciousLogin
  };

  // Setup associations for each model
  setupUserAssociations(models);
  setupPreferenceAssociations(models);
  setupContextAssociation(models);
  setupPostAssociations(models);
  setupCommunityAssociations(models);
  setupCommentAssociations(models);
  setupLikeAssociations(models);
  setupReportAssociations(models);
  setupLogAssociations(models);
  setupTokenAssociations(models);
  setupRelationshipAssociations(models);
  setupAdminAssociations(models);
  setupConfigAssociations(models);
  setupSuspiciousLoginAssociations(models);
};

module.exports = {
  User,
  Post,
  Community,
  Comment,
  Like,
  Report,
  Log,
  Token,
  Preference,
  Context,
  Relationship,
  Admin,
  Config,
  SuspiciousLogin,
  setupAssociations
}; 