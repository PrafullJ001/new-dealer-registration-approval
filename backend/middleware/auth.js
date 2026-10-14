const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // load the user on every request so a deactivated account stops working at once
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Your session is no longer valid' });
    }

    // a password change ends every login that was issued before it
    if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ error: 'Your password was changed. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role ${req.user.role} is not allowed to do this` });
    }
    next();
  };
}

module.exports = { authenticate, authorize };