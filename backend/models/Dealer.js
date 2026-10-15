const mongoose = require('mongoose');
const { STATUS } = require('../config/constants');

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

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

const codeOf = (n) => 'DLR-' + String(n).padStart(4, '0');

// every dealer gets DLR-0001, DLR-0002 ...
// the next number is the highest code that exists now + 1
dealerSchema.pre('validate', async function () {
  if (!this.isNew || this.code) return;
  const last = await this.constructor
    .findOne({ code: /^DLR-\d+$/ })
    .sort({ code: -1 })
    .select('code')
    .lean();
  const next = last ? parseInt(last.code.slice(4), 10) + 1 : 1;
  this.code = codeOf(next);
});

const Dealer = mongoose.model('Dealer', dealerSchema);

// runs once when the backend connects to the database:
// if the codes have gaps (for example after deleting dealers in Atlas),
// renumber them DLR-0001, DLR-0002 ... oldest dealer first
async function fixCodeGaps() {
  try {
    const dealers = await Dealer.find().sort({ createdAt: 1 }).select('_id code').lean();
    const inOrder = dealers.every((d, i) => d.code === codeOf(i + 1));
    if (inOrder) return;

    // temporary codes first, so two dealers never share a code at the same time
    await Dealer.bulkWrite(
      dealers.map((d) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { code: 'TMP-' + d._id } } } }))
    );
    await Dealer.bulkWrite(
      dealers.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { code: codeOf(i + 1) } } } }))
    );
    console.log('Dealer codes renumbered: DLR-0001 to ' + codeOf(dealers.length));
  } catch (err) {
    console.error('Could not renumber dealer codes:', err.message);
  }
}

if (mongoose.connection.readyState === 1) fixCodeGaps();
else mongoose.connection.once('open', fixCodeGaps);

module.exports = Dealer;