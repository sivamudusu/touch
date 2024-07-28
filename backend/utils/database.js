const Sequelize = require('sequelize');
const path = require('path');
require('dotenv').config();





const dbType = "postgres";
const databasePath = path.resolve(__dirname, 'database.sqlite');


let sequelize = null;
if (dbType === 'sqlite') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: databasePath
    });
} else { 
    const pgUser = process.env.PG_USER;
    const pgPwd = process.env.PG_PWD;
    const pgDatabase = 'touch'; 
    if (!pgUser || !pgPwd) {
        console.error('Environment variables PG_USER and PG_PWD must be set for PostgreSQL.');
        process.exit(1);
    }
    sequelize = new Sequelize({
        dialect: 'postgres',
        username: pgUser,
        password: pgPwd,
        database: pgDatabase,
        host: 'localhost',
        port: 5432 
    });
}

module.exports = sequelize;