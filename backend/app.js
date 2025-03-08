const express = require('express');
const cookie = require('cookie-parser');
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const app = express();
require('dotenv').config();
const cors = require('cors')
const sequelize = require('./utils/database');
const adminRoutes = require('./routes/admin.route');
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const communityRoutes = require("./routes/community.route");
const search = require("./controllers/search.controller");
const {addCustomer} = require('./utils/crud');
const { setupAssociations } = require('./models');

// Middleware to parse user agent
app.use(useragent.express());

// Middleware to get client IP
app.use(requestIp.mw());

app.use(cors())
app.use(express.json());
app.use(cookie());
app.use(express.urlencoded({extended : true}))

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Setup model associations
    setupAssociations();
    
    // Force sync in development only!
    await sequelize.sync({ force: true });  // This will recreate all tables
    console.log('Tables created successfully');
    
    // Start server
    app.listen(3000, () => {
      console.log("app is up on http://localhost:3000");
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Routes
app.get("/search", search);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/communities", communityRoutes);
app.use("/admin", adminRoutes);

// Initialize the application
initializeApp();