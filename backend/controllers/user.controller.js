const User = require('../models/User');
const { ROLES } = require('../config/constants');
const { httpError, asyncHandler } = require('../utils/http');
const { issueLink } = require('../utils/links');

exports.list = asyncHandler(async (req, res) => {
  res.json(await User.find().sort({ createdAt: 1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body || {};
  if (!Object.values(ROLES).includes(role)) throw httpError(400, 'Choose a role');

  // schema validation covers name and email, a duplicate email gives a 409
  const user = await User.create({ name, email, role });

  let emailed = true;
  try {
    await issueLink(user, 'invite');
  } catch (err) {
    console.error('Invite email failed:', err.message);
    emailed = false; // the admin can use "Resend invite"
  }
  res.status(201).json({ user, emailed });
});

exports.resendInvite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  if (user.passwordHash) throw httpError(409, 'This user has already set a password');

  await issueLink(user, 'invite');
  res.json(user);
});

exports.setActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body || {};
  if (typeof isActive !== 'boolean') throw httpError(400, 'isActive must be true or false');

  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');

  // an admin can only reach this route while active, so blocking self-deactivation
  // also guarantees the last active admin is never switched off
  if (!isActive && String(user._id) === String(req.user._id)) {
    throw httpError(409, 'You cannot deactivate your own account');
  }

  user.isActive = isActive;
  await user.save();
  res.json(user);
});