const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError, asyncHandler } = require('../utils/http');
const { hashToken } = require('../utils/token');
const { issueLink } = require('../utils/links');

// one message for an unknown email, a wrong password and a wrong role
const BAD_LOGIN = 'Invalid email, password or role';
const BAD_LINK = 'This link is invalid or has expired';

const cleanEmail = (v) => String(v || '').trim().toLowerCase();
const strongEnough = (p) => p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p);

function findByLink(token) {
  return User.findOne({
    tokenHash: hashToken(String(token || '')),
    tokenExpires: { $gt: new Date() },
    isActive: true,
  });
}

exports.login = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const user = await User.findOne({ email: cleanEmail(body.email) });

  if (!user) throw httpError(401, BAD_LOGIN);
  if (!user.passwordHash) {
    throw httpError(403, 'Your account is not activated yet. Use the invitation link sent to your email.');
  }
  if (!(await user.checkPassword(String(body.password || '')))) throw httpError(401, BAD_LOGIN);

  // a wrong role gets the same answer as a wrong password, so the sign-in screen
  // cannot be used to confirm a password or to learn which role an account has
  const chosen = String(body.role || '').toUpperCase();
  if (chosen && chosen !== user.role) throw httpError(401, BAD_LOGIN);

  if (!user.isActive) throw httpError(403, 'This account has been deactivated. Contact an administrator.');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  res.json({ token, user });
});

exports.me = (req, res) => {
  res.json(req.user);
};

// same answer whether or not the email exists, even if sending the mail fails
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: cleanEmail((req.body || {}).email) });
  if (user && user.isActive) {
    try {
      await issueLink(user, user.passwordHash ? 'reset' : 'invite');
    } catch (err) {
      console.error('Reset email failed:', err.message);
    }
  }
  res.json({ message: 'If this email is registered, a link has been sent.' });
});

exports.checkLink = asyncHandler(async (req, res) => {
  const user = await findByLink(req.params.token);
  if (!user) throw httpError(400, BAD_LINK);
  res.json({ type: user.tokenType, name: user.name, email: user.email });
});

exports.setPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body || {};
  const user = await findByLink(token);
  if (!user) throw httpError(400, BAD_LINK);

  const plain = String(password || '');
  if (!strongEnough(plain)) {
    throw httpError(400, 'Password must be at least 8 characters with a letter and a number');
  }

  // a reset must really change the password
  if (await user.checkPassword(plain)) {
    throw httpError(400, 'Choose a password different from your previous one');
  }

  await user.setPassword(plain);
  user.passwordChangedAt = new Date();
  user.tokenHash = undefined;
  user.tokenType = undefined;
  user.tokenExpires = undefined;
  await user.save();

  res.json({ email: user.email });
});