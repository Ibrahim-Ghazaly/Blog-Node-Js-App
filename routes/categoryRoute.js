const router = require('express').Router()
const {createCategory, getAllcategories, deleteCategory} = require('../controllers/categoryController')
const {verifyAdminToken} = require('../middlewares/verifyToken')
const isObjectId = require('../middlewares/validObjectId');


router.route("/").post(verifyAdminToken,createCategory).get(getAllcategories);
router.route("/:id").delete(isObjectId,verifyAdminToken,deleteCategory);

module.exports = router