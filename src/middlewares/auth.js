require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req,res,next) =>{
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];
   if(!token) return res.sendStatus(401);
   jwt.verify(token,process.env.AUTH_SECRET_TOKEN, async (err,authData)=>{
       if(err) return res.status(401).send("Please Authenticate");
       const user = await User.findOne({_id:authData._id,'tokens.token':token});
       if(!user) return res.status(401).send("Please Authenticate");
       req.user = user;
       req.token = token;
       next();
   });
}

module.exports = authenticate;