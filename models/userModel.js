const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const passwordComplexity = require('joi-password-complexity')

const userSchema = mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true,
        minlength:[2,"Too short user Name"],
        maxlength:[100,"Too long user Name"],
    },
    email:{
        type:String,
        required:true,
        trim:true,
        minlength:[10,"Too short email"],
        maxlength:[100,"Too long email"],
        unique:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:[8,"Too short password"],
    },
    profilePhoto:{
        type:Object,
        default:{
            url:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            publicId:null,
        }
    },
    bio:String,
    isAdmin:{
        type:Boolean,
        default:false
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    }
},  { timestamps: true ,    // to enable virtual populate
toJSON: { virtuals: true },
toObject: { virtuals: true },});

//Populate posts that belongs to this user


userSchema.virtual('posts',{
    ref:'Post',
    foreignField:'user',
    localField:'_id'
  })
// Generate Auth Token

userSchema.methods.generateAuthToken = function(){
  
    return jwt.sign({id:this._id,isAdmin:this.isAdmin},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRE_TIME})
}

// user Model 

const User = mongoose.model('User',userSchema);

// validate Register User
function validateRegisterUser(obj){

     const schema = joi.object({
        userName:joi.string().trim().min(2).max(100).required(),
        email:joi.string().trim().min(10).max(100).required().email(),
        password:passwordComplexity().required(),
     })

     return schema.validate(obj)

}


// validate Login 
function validateLogin(obj){

    const schema = joi.object({
       email:joi.string().trim().min(10).max(100).required().email(),
       password:joi.string().trim().min(8).required(),
    })

    return schema.validate(obj)

}

// validate Update User 
function validateUpdateUser(obj){

    const schema = joi.object({
        userName:joi.string().trim().min(2).max(100),
       password:passwordComplexity(),
       bio:Joi.string()
    })

    return schema.validate(obj)

}

module.exports ={
    User,
    validateRegisterUser,
    validateLogin,
    validateUpdateUser
}