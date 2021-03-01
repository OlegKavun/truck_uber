const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authController');


router.post('/register', authController.auth_register_post);

router.post('/login', authController.auth_login_post);

router.post('/forgot_password', authController.auth_forgotPassword_post);

module.exports = router;
