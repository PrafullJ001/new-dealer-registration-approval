const { makeToken, hashToken } = require('./token');
const { sendInvite, sendReset } = require('./mailer');
const { INVITE_HOURS, RESET_HOURS } = require('../config/constants');

// creates a one-time link, stores only its hash, and emails the plain token
async function issueLink(user, type) {
  const token = makeToken();
  const hours = type === 'invite' ? INVITE_HOURS : RESET_HOURS;

  user.tokenHash = hashToken(token);
  user.tokenType = type;
  user.tokenExpires = new Date(Date.now() + hours * 60 * 60 * 1000);
  await user.save();

  const link = `${process.env.APP_URL}/set-password?token=${token}`;
  if (type === 'invite') await sendInvite(user, link);
  else await sendReset(user, link);
}

module.exports = { issueLink };