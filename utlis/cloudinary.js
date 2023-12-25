const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_CLOUD_APIKEY,
    api_secret:process.env.CLOUDINARY_CLOUD_SECRETKEY
})

//Cloudinary upload image

const cloudinaryUploadImage = async(fileToUpload)=>{
    try{
     const data = await cloudinary.uploader.upload(fileToUpload,{recource_type:'auto'});
     return data
    }catch(error){
     return error
    }
}


//Cloudinary remve image

const cloudinaryRemoveImage = async(imagePublicId)=>{
    try{
     const result = await cloudinary.uploader.destroy(imagePublicId);
     return result
    }catch(error){
     return error
    }
}

//Cloudinary remve Multiple images

const cloudinaryRemoveMultipleImages = async(PublicIds)=>{
    try{
     const result = await cloudinary.v2.api.delete_resources(PublicIds);
     return result
    }catch(error){
     return error
    }
}


module.exports ={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImages
}