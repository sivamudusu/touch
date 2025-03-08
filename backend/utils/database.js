const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.PG_DB,
  process.env.PG_USER,
  process.env.PG_PWD,
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;