const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const {Post,validateCreatePost, validateUpdatePost} = require('../models/postModel');
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require('../utlis/cloudinary');
const { uploadProfilePhoto } = require('./userController');
const {Comment} = require('../models/commentModel')

/*
 * @desc  create post
 * @router api/posts
 * @method POST
 * @access private(only logged in user)
*/

module.exports.createPost = asyncHandler(async(req,res)=>{
    // 1 - validate image
    if(!req.file){
       return res.status(400).json({message:"no image provided"})
    }
    // 2 - validate data
    const {error} = validateCreatePost(req.body);
    if(error){
       return res.status(400).json({message:error.details[0].message})
    }
    // 3 - upload photo
    const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath)   
     // 4 - create new post and save it in DB
     const post =await Post.create({
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        user:req.user.id,
        image:{
            url:result.secure_url,
            publicId:result.public_id
        }
     })
    // 5 - send response to the client
    res.status(201).json({data:post,message:'post created successfuly'})
    // 6 - Remove image from server

    await fs.unlinkSync(imagePath);

})

/*
 * @desc  Get All posts
 * @router api/posts
 * @method GET
 * @access public
*/

module.exports.getAllPosts = asyncHandler(async(req,res)=>{
     
    const POST_PER_PAGE = 3
    const{pageNumber,category} = req.query;
    let posts;
     
    if(pageNumber){
      posts = await Post.find().skip((pageNumber - 1) * POST_PER_PAGE).limit(POST_PER_PAGE).sort({createdAt:-1}).populate("user",["-password"]);
      
    }else if(category){
      posts = await Post.find({category}).sort({createdAt:-1}).populate("user",["-password"]);

    }else{
      posts = await Post.find().sort({createdAt:-1}).populate("user",["-password"]);

    }

    res.status(200).json({count:posts.length,data:posts});
})


/*
 * @desc  Get  post
 * @router api/post/:id
 * @method GET
 * @access public
*/

module.exports.getPost = asyncHandler(async(req,res)=>{
     
  const post = await Post.findById(req.params.id).populate("user",["-password"]).populate("comments");

  if(!post){
    res.status(404).json({message:"psot not found "})
  }

  res.status(200).json(post);
})



/*
 * @desc  DELETE  post
 * @router api/post/:id
 * @method DELETE
 * @access private only(admin or who owner the post)
*/

module.exports.deletePost = asyncHandler(async(req,res)=>{
     
  const post = await Post.findById(req.params.id)

  if(!post){
    res.status(404).json({message:"psot not found "})
  }

  if(req.user.isAdmin || req.user.id == post.user.toString()){

     await Post.findByIdAndDelete(req.params.id)
     await cloudinaryRemoveImage(post.image.publicId)

     // TODO :Delete all comments that belong to this post
    await Comment.deleteMany({postId:post._id})
      
  return  res.status(200).json({message:"post deleted successfully",postId:post._id});

  }else{
   
   return res.status(403).json({message:"access denied , forbidden"})

  }

})


/** 
 * @desc  Update   post
 * @router api/post/:id
 * @method PUT
 * @access private only(  owner the post)
**/

module.exports.updatePost = asyncHandler(async(req,res)=>{
     

 // 1 - validation
 const {error} = validateUpdatePost(req.body);
 if(error){
    return res.status(400).json({message:error.details[0].message})
 }

 //2 - Get the post from db and check if post Exist

 const post =  await Post.findById(req.params.id);
 
   if(!post){
     return res.status(404).json({message:"post not found"})
   }

   //3 - check if the post belong to logged in user
   if(req.user.id !== post.user.toString()){
    return res.status(403).json({message:"access denied , you are not allowed"})
   }

   //4 - update post

   const updatedPost = await Post.findByIdAndUpdate(req.params.id,{
     
    $set:{
      title:req.body.title,
      description:req.body.description,
      category:req.body.category
    }

   },{new:true})

   // 5 - send response to client

  return res.status(200).json(updatedPost)
})

/** 
 * @desc  Update image post
 * @router api/post/update-image/:id
 * @method PUT
 * @access private only(  owner the post)
**/

module.exports.updatePostImgae = asyncHandler(async(req,res)=>{
     

     // 1 - validate image
     if(!req.file){
      return res.status(400).json({message:"no image provided"})
   }

   //2 - Get the post from db and check if post Exist

 const post =  await Post.findById(req.params.id);
 
 if(!post){
   return res.status(404).json({message:"post not found"})
 }

 //3 - check if the post belong to logged in user
 if(req.user.id !== post.user.toString()){
  return res.status(403).json({message:"access denied , you are not allowed"})
 }
 //4 - delte the old image from cloudinary
    await cloudinaryRemoveImage(post.image.publicId)

    // 5 - upload new photo
    const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath)   

         // 4 - update image in DB
         const updatedPost =await Post.findByIdAndUpdate(req.params.id,{
          $set:{
            image:{
              url:result.secure_url,
              publicId:result.public_id
          }
        }
       
       },{new:true})

       //7 - send response to client

       res.status(200).json(updatedPost)

       //8 - remove image from server

        fs.unlinkSync(imagePath)
 })

 /**--------------------------------
 * @desc  Update likes
 * @router api/posts/like/:id
 * @method PUT
 * @access private only(logged in user)
  ----------------------------------**/


  module.exports.toggleLikes = asyncHandler(async(req,res)=>{

      const loggedInUser = req.user.id;
      const postId = req.params.id;

  //1- Get the post from db and check if post Exist

    let post =  await Post.findById(req.params.id);
    
    if(!post){
      return res.status(404).json({message:"post not found"})
    }

    //2- check if post aleardy liked by loggenuser

    const isPostAlreadyLiked = post.likes.find(user => user.toString() === loggedInUser);

    if(isPostAlreadyLiked){
    post =  await Post.findByIdAndUpdate(postId,{
        $pull:{
          likes:loggedInUser
        }
      },{new:true})
    }else{
    post =  await Post.findByIdAndUpdate(postId,{
        $push:{
          likes:loggedInUser
        }
      },{new:true})
    }

     res.status(200).json(post)

  })