const router = require('express').Router()
const { createPost, getAllPosts, getPost, deletePost, updatePost, updatePostImgae, toggleLikes } = require('../controllers/postController')
const photoUpload = require('../middlewares/photoUpload')
const { verifyToken } = require('../middlewares/verifyToken')
const isObjectId = require('../middlewares/validObjectId');


router.route('/').post(verifyToken,photoUpload.single('image'),createPost).get(getAllPosts);
router.route('/:id').get(isObjectId,getPost).delete(isObjectId,verifyToken,deletePost).put(isObjectId,verifyToken,updatePost)

router.route('/update-image/:id').put(isObjectId,verifyToken,photoUpload.single('image'),updatePostImgae)

router.route('/like/:id').put(isObjectId,verifyToken,toggleLikes);
module.exports = router