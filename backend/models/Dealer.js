const mongoose = require('mongoose');
const { STATUS } = require('../config/constants');

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// small counter so every dealer gets DLR-0001, DLR-0002 ...
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const dealerSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: [true, 'Dealer name is required'], trim: true },
    gstin: {
      type: String,
      required: [true, 'GSTIN is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [GSTIN, 'Enter a valid 15-character GSTIN'],
    },
    type: { type: String, required: [true, 'Dealer type is required'] },
    contactPerson: { type: String, required: [true, 'Contact person is required'], trim: true },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Enter a valid email address'],
    },
    state: { type: String, required: [true, 'State is required'] },
    city: { type: String, required: [true, 'City or town is required'], trim: true },

    status: { type: String, enum: Object.values(STATUS), default: STATUS.PENDING },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

dealerSchema.index({ status: 1, createdAt: 1 });
dealerSchema.index({ createdBy: 1 });

dealerSchema.pre('validate', async function () {
  if (!this.isNew || this.code) return;
  const counter = await Counter.findByIdAndUpdate(
    'dealer',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.code = 'DLR-' + String(counter.seq).padStart(4, '0');
});

module.exports = mongoose.model('Dealer', dealerSchema);