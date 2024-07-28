const { Sequelize } = require('sequelize');
const User = require('../models/user.model');
const AdminToken = require('../models/token.admin.model');
const Comment = require('../models/comment.model');
const Admin = require('../models/admin.model');
const Community = require('../models/community.model');
const Config = require('../models/config.model');
const Customer = require('../../../../nodejs/express-drills/11.login/models/customer');
const Context = require('../models/context.model');
const Email = require('../models/email.model');
const Log = require('../models/log.model');
const PendingPost = require('../models/pendingPost.model');
const Post = require('../models/post.model');
const Preference = require('../models/preference.model');
const Relationship = require('../models/relationship.model');
const Report = require('../models/report.model');
const Rule = require('../models/rule.model');
const SuspiciousLogin = require('../models/suspiciousLogin.model');
const Token = require('../models/token.model');

class Database {
  constructor(database, username, password) {
    this.database = database;
    this.username = username;
    this.password = password
    this.sequelize = new Sequelize({
        dialect: 'postgres',
        username: username,
        password: password,
        database: database,
        host: 'localhost',
        port: 5432 
    });
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log(`Connected to database: ${this.database}`);
    } catch (error) {
      throw error;
    }
  }
  async createTables() {
    try {
      await this.connect();
      // Sync all models with the database
    await Admin.sync({ alter: true });
    await User.sync({ alter: true });
    await Post.sync({ alter: true });
    await Preference.sync({ alter: true });
    await Relationship.sync({ alter: true });
    await Community.sync({ alter: true });
    await Report.sync({ alter: true });
    await Rule.sync({ alter: true });
    await SuspiciousLogin.sync({ alter: true });
    await Token.sync({ alter: true });
    await AdminToken.sync({alter : true});
    await Comment.sync({ alter: true });
    await Config.sync({ alter: true });
    await Context.sync({ alter: true });
    await Email.sync({ alter: true });
    await Log.sync({ alter: true });
    await PendingPost.sync({ alter: true });
      
     
      // Sync other models
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async disconnect() {
    try {
      await this.sequelize.close();
      console.log(`Disconnected from database: ${this.database}`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Database;
