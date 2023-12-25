const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const {User,validateRegisterUser,validateLogin} = require('../models/userModel');
const crypto = require("crypto");
const VerificationToken = require('../models/verificationTokenModel');
const sendEmail = require('../utlis/sendEmails')


/*---------------------------
 * @desc  Register New User
 * @router api/auth/register
 * @method POSt
 * @access Public
---------------------------- */

module.exports.registerUser =asyncHandler(async(req,res)=>{
  const {error} = validateRegisterUser(req.body);

  if(error){
    return res.status(400).json({message:error.details[0].message});
  }
   //is user already exist
   let user = await User.findOne({email:req.body.email});

   if(user){
    return res.status(400).json({message:'user already exist'});
   }
   //hash the password
   const salt = await bcrypt.genSalt(10);
   const hashPassword = await bcrypt.hash(req.body.password,salt)
   //create new user and save it to DB
   user = new User({
    userName:req.body.userName,
    email:req.body.email,
    password:hashPassword
   })

   await user.save()

   //TODO:-sending email verification to user
    
   //1-creating new verfication token and save it into DB
  //  const verficationToken = new VerificationToken({
  //   userId:user._id,
  //   token:crypto.randomBytes(32).toString('hex')
  //  })
  //   await verficationToken.save()
   //2-Making the link
    // const link = `http://localhost:3000/users/${user._id}/verify/${verficationToken.token}`
   //3-Putting the link into an htmltemplate
  // const htmlTemplate = `
  //   <div>
  //     <p>Click on the link below to verify your email</p>
  //     <a href=${link}>Verify</a>
  //   </div>
  // `
   //4-sending email to the user
//  await sendEmail(user.email,"Verify Your Email",htmlTemplate)
   
   // send response to client
   return res.status(201).json({message:'you sign up successfully please login'});

})


/*---------------------------
 * @desc  login  User
 * @router api/auth/login
 * @method POSt
 * @access Public
---------------------------- */

module.exports.login = asyncHandler(async(req,res)=>{
  //validation
  const {error} = validateLogin(req.body);

  if(error){
    return res.status(400).json({message:error.details[0].message});
  }
  //check if user Exist
  let user = await User.findOne({email:req.body.email});

  if(!user){
   return res.status(400).json({message:'invalid email or password'});
  }
  //check password
  let isPasswordMatch = await bcrypt.compare(req.body.password,user.password)

  // console.log(isPasswordMatch)

  if(!isPasswordMatch){
   return res.status(400).json({message:'password is incorrect please enter right password'});

  }

  //TODO  sending email (verify account is not verified) 
  // if(!user.isAccountVerified){

  //  const verficationToken= VerificationToken.findOne({
  //   userId:user._id
  //  })

  //   if(!verficationToken){
        
  //     const verficationToken = new VerificationToken({
  //       userId:user._d,
  //       token:crypto.randomBytes(32).toString("hex")
  //     })

  //     await verficationToken.save()
  //      //2-Making the link
  //   const link = `http://localhost:3000/users/${user._id}/verify/${verficationToken.token}`
  //   //3-Putting the link into an htmltemplate
  //  const htmlTemplate = `
  //    <div>
  //      <p>Click on the link below to verify your email</p>
  //      <a href=${link}>Verify</a>
  //    </div>
  //  `
  //   //4-sending email to the user
  // await sendEmail(user.email,"Verify Your Email",htmlTemplate)
  //   }
  
  //   return res.status(400).json({message:"we sent to you an email , please verify email address"})
  // }
  //generate token
 const token = user.generateAuthToken()

  //send response
  res.status(200).json({
    _id:user._id,
    isAdmin:user.isAdmin,
    profilePhoto:user.profilePhoto,
    token
  })
})


/** 
 * @desc Verify User Account
 * @route /api/auth/:userId/token/:token
 * @method GET
 *@access public 
 * **/

//  module.exports.verifyUserAccount =asyncHandler(async(req,res)=>{

//    const user = await User.findById(req.params.userId);

//    if(!user){
//      return res.status(400).json({message:"invalid link"})
//    }

//    const verificationToken = await VerificationToken.findOne({userId:user._id,token:req.params.token})

//    if(!verificationToken){
//      return res.status(400).json({message:"invalid link"})
      
//    }

//    user.isAccountVerified = true;
//     await user.save()
     
//     await verificationToken.remove()

//     return res.status(200).json({message:"Your account verified"})


//  }) 

 