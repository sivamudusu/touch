const express = require('express');
const cookie = require('cookie-parser');
const app = express();
require('dotenv').config();
const cors = require('cors')
const Database = require('./config/database');
const adminRoutes = require('./routes/admin.route');
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const communityRoutes = require("./routes/community.route");
const search = require("./controllers/search.controller");
const {addCustomer} = require('./utils/crud');







app.use(cors())
app.use(express.json());
app.use(cookie());
app.use(express.urlencoded({extended : true}))




const pgUser = process.env.PG_USER;
const pgPwd = process.env.PG_PWD;
const pgDatabase = process.env.PG_DB


const db = new Database(pgDatabase,pgUser,pgPwd);

app.get("/search", search);
// addCustomer();
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/communities", communityRoutes);
app.use("/admin", adminRoutes);




app.listen(3000,()=>{
    console.log("app is up on http://localhost:3000");
})