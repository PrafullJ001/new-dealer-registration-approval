const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.post('/:id/invite', ctrl.resendInvite);
router.patch('/:id', ctrl.setActive);

module.exports = router;