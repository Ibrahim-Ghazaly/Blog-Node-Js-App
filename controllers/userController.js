const asyncHandler = require('express-async-handler');
const {User, validateUpdateUser} = require('../models/userModel');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs =require('fs')
const{cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImages} = require('../utlis/cloudinary')
const {Comment} = require('../models/commentModel')
const {Post} = require('../models/postModel')


/*---------------------------
 * @desc  Get All Users
 * @router api/users
 * @method GET
 * @access Private{Admin}
---------------------------- */

module.exports.getAllUsers = asyncHandler(async(req,res)=>{

  const users = await User.find().select('-password');
  res.status(200).json(users);

})

/*---------------------------
 * @desc  Get user
 * @router api/users/:userId
 * @method GET
 * @access Public
---------------------------- */

module.exports.getUser = asyncHandler(async(req,res,next)=>{

  const id = req.params.id

  const user = await User.findById(id).select('-password').populate('posts');

  if(!user){
    return res.status(404,{message:'user not found'})
  }

 res.status(200).json(user);

})



/*---------------------------
 * @desc  update user
 * @router api/users/:id
 * @method PUT
 * @access private(only user)
---------------------------- */

module.exports.updateUser = asyncHandler(async(req,res,next)=>{

  const {error} = validateUpdateUser(req.body);

  if(error){
   return res.status(400).json({message:error.details[0].message})
  }

 if(req.body.password){
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password,salt)
 }


  const id = req.params.id

  const user = await User.findByIdAndUpdate(id,{$set:{
     userName:req.body.userName,
     password:req.body.password,
     bio:req.body.bio
  }},{new:true}).select('-password')

  if(!user){
    return res.status(404,{message:'user not found'})
  }

 res.status(200).json(user);

})


/*---------------------------
 * @desc  upload user photo
 * @router api/users/upload_user_photo
 * @method Post
 * @access private(user)
---------------------------- */

module.exports.uploadProfilePhoto = asyncHandler(async(req,res,next)=>{

 console.log(req.file)
 //validation
 if(!req.file){
  return res.status(400).json({message:'No file provided'})
 }

 //2-Get the path to the image
 const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
 //3-Upload to cloudinary
 const result = await cloudinaryUploadImage(imagePath)
 console.log(result)
 //4-Get the user from the DB
 const user = await User.findById(req.user.id)
 //5-Delete the old profile photo if Exist
 if(user.profilePhoto.publicId !== null){
  await cloudinaryRemoveImage(user.profilePhoto.publicId)
 }
 //6-change profile photo  field in Db

 user.profilePhoto ={
  url:result.secure_url,
  publicId:result.public_id
 }
await user.save()
 //7- send response to client
 res.status(200).json({
  message:'profile photo uploaded successfuly',
  profilePhoto:{
    url:result.secure_url,
    publicId:result.public_id
   }
});


//8-Remove image from the server

  fs.unlinkSync(imagePath)
})


/*---------------------------
 * @desc  delete user profile Account
 * @router api/users/:id
 * @method DELETE
 * @access private(only admin or userhim)
---------------------------- */

module.exports.deleteUserPRofile = asyncHandler(async(req,res)=>{

  //1 - Get the user from DB 
  let user = await User.findById(req.params.id)
  if(!user){
    return res.status(404).json({message:"user not found"})
  }
  //@TODO 2 - Get all posts from DB
  const posts = await Post.find({user:user._id})
  //@TODO3 - Get the public ids from the posts
   const publicIds = posts?.map(post => post.image.publicId)
  //@TODO4 - Delete all posts imges fro cloudinary tht belongs to this user
  if(publicIds?.length > 0){
    await cloudinaryRemoveMultipleImages(publicIds) 
  }
  //5 -  Delete the profile picture from cloudinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId)
  //@TODO6 - Delete user posts & comments
  await Post.deleteMany({user:user._id});
  await Comment.deleteMany({user:user._id});

  // 7 - Delete the user himself
   await User.findByIdAndDelete(req.params.id)
  // 8 - send a response to client
 return res.status(200).json({message:"your profile has been deleted"})

})