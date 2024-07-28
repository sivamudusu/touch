require('dotenv').config;
const bcrypt = require('bcrypt');
const Customer = require('../models/customer');
const sequelize = require('../utils/database');
const jwt = require('jsonwebtoken');
const Token = require('../models/token.model');






const addUser = async(req,res,next)=>{
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    
    sequelize.sync()
    .then(()=>{
        console.log("connectes to db")
        return Customer.create({name : req.body.name,email : req.body.email, password : hashedPassword});
        
    })
    .then(result=>{
        console.log(result);
    })
    .catch((err)=>{
        console.log(err);
    })

    res.send("hello welcome")


}

const greet  = async(req,res)=>{
    try{
        return res.status(200).json({
            content : "hello world"
        })
    }catch(er){
        console.log(er);
    }
}

const getUser = async(req,res,next)=>{
    try{
        const id = req.params.userId;
        const user = await Customer.findOne({where : {id}});
        if(!user){
            return res.status(404).json({
                message : "there is no such user"
            });
        }
        return res.status(200).json({
            id : user.id,
            name : user.name
        });
    }catch(e){
        console.error(e);
        next(e);
    }
}

const loginUser = async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        await sequelize.sync();
        console.log("connected to db");
        const customer = await Customer.findOne({ where: { email } });
        if(!customer){
            return res.status(404).json({
                message: "Invalid credentials",
            });

            
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if(!isPasswordCorrect){
            return res.status(404).json({
                message: "Invalid credentials",
            });
        }
        res.cookie("expressCookie","someValue",{maxAge : 90000, httpOnly : true});

        const payload = {
            id: customer.id,
            email: customer.email,
          };
      
          const accessToken = jwt.sign(payload, process.env.SECRET, {
            expiresIn: "6h",
          });
      
          const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
            expiresIn: "7d",
          });
      
          const newRefreshToken = new Token({
            user_id: customer.id,
            refreshToken,
            accessToken,
          });
          await Token.create({
            user_id: customer.id,
            refreshToken,
            accessToken,
          });
      
        
          res.status(200).json({
            accessToken,
            refreshToken,
            accessTokenUpdatedAt: new Date().toLocaleString(),
            user: {
              id: customer.id,
              name: customer.name,
              email: customer.email,
            },
          });
    } catch (error) {
        console.error(error);
        next(error); // Pass the error to the error handling middleware
    }
}

module.exports = {addUser,loginUser,getUser,greet}