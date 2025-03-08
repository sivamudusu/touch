const Sequelize = require('sequelize');
const { User, Post, Community, Comment, Like, Report } = require('../models');
const AdminToken = require('../models/token.admin.model');
const Admin = require('../models/admin.model');
const Config = require('../models/config.model');
const Context = require('../models/context.model');
const Email = require('../models/email.model');
const Log = require('../models/log.model');
const PendingPost = require('../models/pendingPost.model');
const Preference = require('../models/preference.model');
const Relationship = require('../models/relationship.model');
const Rule = require('../models/rule.model');
const SuspiciousLogin = require('../models/suspiciousLogin.model');
const Token = require('../models/token.model');

class Database {
  constructor(database, username, password) {
    this.database = database;
    this.username = username;
    this.password = password;
    this.sequelize = new Sequelize(database, username, password, {
      host: 'localhost',
      dialect: 'postgres',
      logging: false // Set to true if you want to see SQL queries
    });
  }

  getSequelize() {
    return this.sequelize;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  async createTables() {
    try {
      // Sync all models at once
      await this.sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
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
