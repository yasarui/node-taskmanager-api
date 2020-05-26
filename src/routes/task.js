const express = require("express");
const router = express.Router();
const Task = require('../models/task');
const authenticate = require("../middlewares/auth");

router.get("/api/tasks",authenticate,async (req,res)=>{
    let options = {};
    options.owner = req.user._id;
    if(req.query.completed){
        options.completed = req.query.completed === 'true'
    }
    try{
        const response = await Task.find(options)
                                   .sort({createdAt:-1})
                                   .limit(parseInt(req.query.limit))
                                   .skip(parseInt(req.query.skip));
        //await req.user.populate('tasks').execPopulate();
        res.status(200).json({response});
    }catch(error){
        res.status(400).json({error})
    }
});

router.get("/api/tasks/:id",authenticate,async (req,res)=>{
   try{
       const _id = req.params.id;
       const response = await Task.findOne({_id,"owner":req.user._id}).populate('owner');
       if(!response) return res.status(404).json({"response":"Resource not found"});
       res.status(200).json({response});
   }catch(error){
       res.status(400).json({error});
   }
});

router.post("/api/tasks",authenticate,async (req,res)=>{
    try{
        const task = new Task({...req.body,owner:req.user._id});
        const response = await task.save();
        res.status(201).json({response});
    }catch(error){
        res.status(400).json({error});        
    }
});

router.patch("/api/tasks/:id",authenticate,async (req,res)=>{
    try{
        const allowedUpdates = ["description","completed"];
        const requestUpdates = Object.keys(req.body);
        const isUpdateOk = requestUpdates.every(item => allowedUpdates.includes(item));
        if(!isUpdateOk) return res.status(400).json({"response":"Invalid update"})
        const _id = req.params.id;
        const response = await Task.findOneAndUpdate({_id,"owner":req.user._id},req.body,{new: true});
        if(!response){
            return res.status(404).send({"response":"Resource not found"});
        }
        res.status(200).json({response});
    }catch(error){
        res.status(400).json({error});        
    }
});

router.delete("/api/tasks/:id",authenticate,async (req,res)=>{
    try{
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({_id,"owner":req.user._id});
        if(!task){
            return res.status(404).send({"response":"Resource not found"});
        }
        res.status(204).json();   
    }catch(error){
        res.status(400).json({error});
    }
});

module.exports = router;