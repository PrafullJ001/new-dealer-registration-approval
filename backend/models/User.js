const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Enter a valid email address'],
    },
    role: { type: String, enum: Object.values(ROLES), required: true },
    passwordHash: String, // empty until the invite link is used
    passwordChangedAt: Date, // logins issued before this moment stop working
    isActive: { type: Boolean, default: true },

    // one link at a time, a new invite or reset replaces the old one
    tokenHash: String,
    tokenType: { type: String, enum: ['invite', 'reset'] },
    tokenExpires: Date,
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.checkPassword = async function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

// never send hashes to the client
userSchema.set('toJSON', {
  transform(doc, ret) {
    // "invited" only makes sense when the whole user was loaded (email is present)
    if (ret.email) ret.invited = !doc.passwordHash;
    delete ret.passwordHash;
    delete ret.passwordChangedAt;
    delete ret.tokenHash;
    delete ret.tokenType;
    delete ret.tokenExpires;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);