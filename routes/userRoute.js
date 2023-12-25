const router = require('express').Router();
const {getAllUsers,getUser, updateUser, uploadProfilePhoto,deleteUserPRofile} = require('../controllers/userController');
const {verifyAdminToken, verifyTokenAndOnlyUser, verifyToken, verifyTokenAuthorization} = require('../middlewares/verifyToken')
const isObjectId = require('../middlewares/validObjectId');
const photoUpload = require('../middlewares/photoUpload');

router.route('/').get(verifyAdminToken,getAllUsers);
router.route('/:id').get(isObjectId,getUser).put(isObjectId,verifyTokenAndOnlyUser,updateUser).delete(isObjectId,verifyTokenAuthorization,deleteUserPRofile);

router.route('/uploadProfilePhoto').post(verifyToken,photoUpload.single('image'),uploadProfilePhoto)


module.exports = router