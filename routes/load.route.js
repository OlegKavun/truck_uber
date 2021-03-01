const {Router} = require('express');
const router = Router();
const loadController = require('../controllers/loadConnector');


router.get('/', loadController.loads_get);

router.post('/', loadController.loads_post);

router.get('/active', loadController.loads_active_get);

router.patch('/active/state', loadController.loads_active_state_patch);

router.get('/:loadId', loadController.loads_id_get);

router.put('/:loadId', loadController.loads_id_put);

router.delete('/:loadId', loadController.loads_id_delete);

router.post('/:loadId/post', loadController.loads_id_post);

router.get('/:loadId/shipping_info', loadController.loads_id_info_get);


module.exports = router;
