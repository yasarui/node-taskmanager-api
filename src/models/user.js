require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require('./task');

const UserSchema = mongoose.Schema({
     name:{
        type: String,
        required: true,
        trim: true
     },
     email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
           if(!validator.isEmail(value)){
               throw new Error("Email is not Valid");
           }
        }
     },
     password:{
        type: String,
        required: true,
        minlength: 6,
        validate(value){
           if(value.toLowerCase().includes("password")){
               throw new Error(`Password does not include ${value}`);
           }
        }
     },
     age:{
       type: Number,
       default: 0,
       validate(value){
           if(value < 0){
               throw new Error("Age cannot be Lesser then zero")
           }
       }
     },
     tokens:[{
        token:{
           type: String,
           required: true 
        }
     }],
     avator: {
         type: Buffer
     }
},{timestamps:true});

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.pre('save',async function(next){
    const user = this;
    if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8)
    }
    next();
});

UserSchema.pre('remove', async (next)=>{
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
});

UserSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.AUTH_SECRET_TOKEN);
    user.tokens = user.tokens.concat({ token })
    await user.save();
    return token;
}

UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.tokens;
    delete userObject.password;
    delete userObject.avator;
    return userObject;
}

UserSchema.statics.findByCredentials = async function(email,password){
     const user = await User.findOne({email});
     if(!user){
         throw new Error("Invalid Login");
     }
     const isMatch = await bcrypt.compare(password,user.password);
     if (!isMatch) throw new Error("Invalid Login");
     return user;
}

const User = mongoose.model("User",UserSchema);

module.exports = User;