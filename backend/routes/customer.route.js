const router = require('express').Router();
const path = require('path')
const {addUser,loginUser,getUser,greet} = require('../controllers/customer.controller');
const passport = require('passport');
require('../config/passport')(passport);
const jwt = require('jsonwebtoken');

const decodeToken = require('../middlewear/decodeToken');
const requireAuth = passport.authenticate('jwt',{session : false},null);

const pages = path.join(__dirname,"../pages");

router.post("/signup",addUser);

router.get("/signup",(req,res)=>{
    res.sendFile(path.join(pages,"signup.html"))
})

router.get("/hello",greet);

router.get("/customer/:userId",getUser);

router.post("/login",loginUser);


router.get("/login",(req,res)=>{
    res.sendFile(path.join(pages,"login.html"));
})

router.get("/home",(req,res)=>{
    const cookie = req.cookies.expressCookie;
    console.log(req.cookies);
    res.send(`cookies value is ${cookie}`)
    
    // res.sendFile(path.join(pages,"home.html"));
})

module.exports = router