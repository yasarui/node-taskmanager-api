require('dotenv').config();
const express = require("express");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const router = express.Router();
const User = require('../models/user');
const Task = require('../models/task');
const authenticate = require('../middlewares/auth');

//Init upload
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        const fileName = file.originalname.toLocaleLowerCase();
        if(!fileName.match(/\.(png|jpg|jepg)$/)){
            return cb(new Error("only images are allowed"))
        }else{
            cb(null,true)
        }
    }
}).single('avator');


router.get("/api/users/me",authenticate,async (req,res)=>{
    res.send(await req.user);
});

// router.get("/api/users/:id",authenticate,async (req,res)=>{
//     const id = req.params.id;
//     try{
//         const response = await User.findById(id);
//         if(!response) return res.status(404).json({response:"User not found"});
//         res.status(200).json({response});
//     }catch(error){
//         res.status(400).json({error});        
//     }
// });

router.post("/api/users",async (req,res)=>{
    try{
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({user,token});
    }catch(error){
        res.status(400).json({error});
    }
});

router.post("/api/users/login",async (req,res)=>{
    try{
       const {email,password} = req.body
       const user = await User.findByCredentials(email,password);
       const token = await user.generateAuthToken();
       res.status(200).json({user,token});
    }catch(error){
        res.status(401).json({"error":"Invalid Login"});
    }
});

router.post("/api/users/logout",authenticate,async (req,res) => {
     try{
        req.user.tokens = req.user.tokens.filter((item) => item.token !== req.token);
        await req.user.save();
        res.status(200).send();
     }catch(error){
         res.status(500).send({error:error});
     }
});

router.post("/api/users/logoutall", authenticate,async (req,res) =>{
     try{
         req.user.tokens = [];
         await req.user.save();
         res.status(200).send();
     }catch(error){
         res.status(500).json({error});
     }
});

router.patch("/api/users/me",authenticate,async (req,res)=>{

    const allowedUpdates = ["name","email","password"];
    const requestUpdates = Object.keys(req.body);
    const isUpdateFine = requestUpdates.every(item => allowedUpdates.includes(item));
    if(!isUpdateFine) return res.status(400).json({response:"Invalid Update"});
    try{
        requestUpdates.forEach((item)=>{
            req.user[item] = req.body[item];
        })
        await req.user.save();
        res.status(200).json({response:req.user});
    }catch(error){
        res.status(400).json({error});
    }
});

router.delete("/api/users/me",authenticate,async (req,res)=>{
    try{
        await req.user.remove();
        res.status(204).send();
    }catch(error){
        res.status(400).json({error});
    }
});

router.post("/api/users/me/avatar",authenticate,upload,async (req,res)=>{
    try{
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        //const buffer = req.file.buffer;
        req.user.avator = buffer;
        resp = await req.user.save();
        res.send();
    }catch(error){
        res.status(400).json({error});
    }
},(error,req,res,next) =>{
    res.send({error:error.message});
});

router.get("/api/users/:id/avatar",async (req,res)=>{
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        if(!user || !user.avator){
            throw new Error("Some thing went wrong");
        }
        res.set('Content-type','image/png');
        res.send(user.avator);
    }catch(e){
        console.log("Error happened ",e);
        res.status(400).send(e.message);
    }
});

router.delete("/api/users/me/avatar",authenticate,async (req,res)=>{
    req.user.avator = undefined;
    await req.user.save();
    res.sendStatus(204);
});

module.exports = router;