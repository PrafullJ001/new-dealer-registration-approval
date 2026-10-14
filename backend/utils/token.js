const crypto = require('crypto');

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

// only the hash goes into the database, the plain token goes in the email
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { makeToken, hashToken };