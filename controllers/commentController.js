const asyncHandler = require('express-async-handler');
const {Comment,validateCreateComment,validateUpdateComment} = require('../models/commentModel');
const { User } = require('../models/userModel');


/**
 * @desc Create New Comment
 * @route /api/comment
 * @method Post
 * @access private (only logged in user)
 **/

module.exports.createComment = asyncHandler(async(req,res)=>{
   
   // validation
  const {error} = validateCreateComment(req.body)

  if(error){
   return res.status(400).json({message:error.details[0].message})
  }
  
  const profile = await User.findById(req.user.id);

  const comment = await Comment.create({
    postId:req.body.postId,
    text:req.body.text,
    user:req.user.id,
    userName:profile.userName
  })

    res.status(201).json(comment)
})


/**
 * @desc get all comments
 * @route /api/comment
 * @method GET
 * @access private (only admin)
 **/

module.exports.getAllComments = asyncHandler(async(req,res)=>{
   
    const comments = await Comment.find().populate("user",["-password"])
     res.status(200).json(comments)
 })

 /**
 * @desc Delete comment controller
 * @route /api/comment/:id
 * @method GET
 * @access private (only admin or the owner of comment)
 **/

module.exports.deleteComment = asyncHandler(async(req,res)=>{
   
    const comment = await Comment.findById(req.params.id)

     if(!comment){
        res.status(404).json("comment not found")
     }

     if(req.user.id || req.user.isAdmin  === comment.user.toString()){

        await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"comment deleted successsfully"})
     }else{
        res.status(403).json({message:"Frobbiden,You are not allowed to delete this comment"})
       
     }

    
 }) 


 
 /**
 * @desc Update comment controller
 * @route /api/comment/:id
 * @method PUT
 * @access private (the owner of comment)
 **/

module.exports.updateComment = asyncHandler(async(req,res)=>{

    //validation
    const {error} = validateUpdateComment(req.body)

    if(error){
     return res.status(400).json({message:error.details[0].message})
    }

   
    const comment = await Comment.findById(req.params.id)

     if(!comment){
        res.status(404).json("comment not found")
     }

     if(req.user.id  !== comment.user.toString()){

      return  res.status(403).json({message:"Frobbiden,You are not allowed to delete this comment"})

     }
        const updatedComment =   await Comment.findByIdAndUpdate(req.params.id,{
            $set:{
            text:req.body.text
            }
          },{new:true})

        return res.status(200).json(updatedComment)
 }) 