const mongoose = require('mongoose');
const joi = require('joi')

const postSchema = mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true,
        minlength:[2,"too short title"],
        maxlength:[200,"too long title"],
    },
    description:{
        type:String,
        trim:true,
        required:true,
        minlength:[10,"too short description"],
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:Object,
        default:{
            url:"",
            publicId:null
        }
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
},{ timestamps: true ,    // to enable virtual populate
toJSON: { virtuals: true },
toObject: { virtuals: true },})
                                        
//Populate comments that belongs to this user


postSchema.virtual('comments',{
    ref:'Comment',
    foreignField:'postId',
    localField:'_id'
  })


const Post = mongoose.model("Post",postSchema)


//Validate Create Post

function validateCreatePost(obj){
   const schema =joi.object({
    title:joi.string().min(2).max(200).trim().required(),
    description:joi.string().min(10).trim().required(),
    category:joi.string().trim().required(),
   })

   return schema.validate(obj)
}

function validateUpdatePost(obj){
   const schema =  joi.object({
     title:joi.string().min(2).max(200).trim(),
     description:joi.string().min(10).trim(),
     category:joi.string().trim(),
    })
 
    return schema.validate(obj)
 }

module.exports = {
    Post,
    validateCreatePost,
    validateUpdatePost

}