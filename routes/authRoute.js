const router = require('express').Router();
const {registerUser,login, verifyUserAccount} = require('../controllers/authController');

router.post('/register',registerUser);
router.post('/login',login)
// router.get('/:userId/verify/:token',verifyUserAccount)





module.exports = router