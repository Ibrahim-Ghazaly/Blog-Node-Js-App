const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');


 function verifyToken(req,res,next){
   
//verify token
 
const authToken = req.headers.Authorization || req.headers.authorization 

if(authToken){

    const token = authToken.split(" ")[1];
    try{
        
        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = decode;
        next()

     }catch(error){

       res.status(401).json({message:'invalid token , access denied'})
      
    }

        }else{

        return    res.status(401).json({message:'No token provided, access denied'})
        }
       
}


 function verifyAdminToken (req,res,next){
  verifyToken(req,res,()=>{
    if(req.user.isAdmin){
        next()
    }else{
      return  res.status(403).json({message:'Not allowed only admin'})

    }
 })
}

//verify Token only user himself

function verifyTokenAndOnlyUser (req,res,next){
  verifyToken(req,res,()=>{
    if(req.user.id === req.params.id){
        next()
    }else{
      return  res.status(403).json({message:'Not allowed only user him self'})

    }
 })
}


//verify Token and authorization

function verifyTokenAuthorization (req,res,next){
  verifyToken(req,res,()=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
        next()
    }else{
      return  res.status(403).json({message:'Not allowed only user him self or admin'})

    }
 })
}
module.exports ={
    verifyToken,
    verifyAdminToken,
    verifyTokenAndOnlyUser,
    verifyTokenAuthorization
}