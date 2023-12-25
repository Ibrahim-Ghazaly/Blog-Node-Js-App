const router = require('express').Router()
const { createComment,getAllComments, deleteComment, updateComment} = require('../controllers/commentController')
const { verifyToken, verifyAdminToken } = require('../middlewares/verifyToken')
const isObjectId = require('../middlewares/validObjectId');

router.route("/").post(verifyToken,createComment).get(verifyAdminToken,getAllComments)

router.route("/:id").delete(isObjectId,verifyToken,deleteComment);
router.route("/:id").put(isObjectId,verifyToken,updateComment);


module.exports = router