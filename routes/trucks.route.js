const {Router} = require('express');
const router = Router();
const trucksController = require('../controllers/trucksController');


router.get('/', trucksController.trucks_get);

router.post('/', trucksController.trucks_post);

router.get('/:truckId', trucksController.trucks_get_id);

router.put('/:truckId', trucksController.trucks_put_id);

router.delete('/:truckId', trucksController.trucks_delete_id);

router.post('/:truckId/assign', trucksController.trucks_post_assign_id);

module.exports = router;
