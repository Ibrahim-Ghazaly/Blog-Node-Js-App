const mongoose =require('mongoose');


module.exports = async()=>{
    try{
     
        await mongoose.connect(process.env.MONGO_URI)

        console.log('connected to mongodb ')

    }catch(error){
      
        console.log('Connection Failed To MongoDb',error)
    }
}