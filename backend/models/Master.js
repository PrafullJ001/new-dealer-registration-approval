const mongoose = require('mongoose');
const { MASTER_TYPES } = require('../config/constants');

const masterSchema = new mongoose.Schema(
  {
    type: { type: String, enum: MASTER_TYPES, required: true },
    value: { type: String, required: [true, 'Value is required'], trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// "goa" and "Goa" count as the same value
masterSchema.index(
  { type: 1, value: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Master', masterSchema);