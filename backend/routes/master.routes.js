const router = require('express').Router();
const ctrl = require('../controllers/master.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', authorize(ROLES.ADMIN), ctrl.create);
router.patch('/:id', authorize(ROLES.ADMIN), ctrl.setActive);

module.exports = router;