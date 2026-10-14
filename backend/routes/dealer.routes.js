const router = require('express').Router();
const ctrl = require('../controllers/dealer.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const { ADMIN, APPROVER, CREATOR } = ROLES;

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', authorize(ADMIN, CREATOR), ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id/approve', authorize(ADMIN, APPROVER), ctrl.approve);
router.patch('/:id/reject', authorize(ADMIN, APPROVER), ctrl.reject);

module.exports = router;