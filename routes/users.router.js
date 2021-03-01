const {Router} = require('express');
const router = Router();
const usersController = require('../controllers/usersController');


router.get('/me', usersController.me_get);

router.delete('/me', usersController.me_delete);

router.patch('/me/password', usersController.me_password);

module.exports = router;
