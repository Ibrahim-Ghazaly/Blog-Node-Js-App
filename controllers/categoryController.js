const asyncHandler = require('express-async-handler');
const {Category, validateCreateCategory} = require('../models/categoryModel');


/*
 * @desc  create category
 * @router api/categories
 * @method POST
 * @access private(only Admin)
*/

module.exports.createCategory = asyncHandler(async(req,res)=>{
  
      //validation
      const {error} = validateCreateCategory(req.body)

      if(error){
       return res.status(400).json({message:error.details[0].message})
      }
  
     
    const category =  await Category.create({
        title:req.body.title,
        user:req.user.id
    })

    res.status(201).json({message:"category created successfully",data:category})
})

/*
 * @desc  Get All category
 * @router api/categories
 * @method GET
 * @access public
*/

module.exports.getAllcategories = asyncHandler(async(req,res)=>{
   
    const categories = await Category.find();

    res.status(200).json(categories)
})

/*
 * @desc  Delete category
 * @router api/categories/:id
 * @method DELET
 * @access private(only admin)
*/

module.exports.deleteCategory = asyncHandler(async(req,res)=>{
   
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(404).json("category not found")
    }
  await Category.findByIdAndDelete(req.params.id)

   return res.status(200).json({message:"category deleted successfully",categorId:category._id})
})