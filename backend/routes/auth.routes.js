// const router = require('express').Router();
// const rateLimit = require('express-rate-limit');
// const ctrl = require('../controllers/auth.controller');
// const { authenticate } = require('../middleware/auth');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: () => process.env.NODE_ENV === 'test',
//   message: { error: 'Too many attempts. Please try again in a few minutes.' },
// });

// router.post('/login', limiter, ctrl.login);
// router.post('/forgot-password', limiter, ctrl.forgotPassword);
// router.get('/token/:token', ctrl.checkLink);
// router.post('/set-password', limiter, ctrl.setPassword);
// router.get('/me', authenticate, ctrl.me);

// module.exports = router;





const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/login', limiter, ctrl.login);
router.post('/forgot-password', limiter, ctrl.forgotPassword);
router.get('/token/:token', ctrl.checkLink);
router.post('/set-password', limiter, ctrl.setPassword);
router.get('/me', authenticate, ctrl.me);

module.exports = router;