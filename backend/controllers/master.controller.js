const Master = require('../models/Master');
const { ROLES, MASTER_TYPES } = require('../config/constants');
const { httpError, asyncHandler } = require('../utils/http');

// everyone can read the lists for dropdowns, but only admins see disabled values
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = String(req.query.type);
  if (req.user.role !== ROLES.ADMIN) filter.isActive = true;

  res.json(await Master.find(filter).sort({ type: 1, value: 1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const { type, value } = req.body || {};
  if (!MASTER_TYPES.includes(type)) throw httpError(400, 'Invalid master type');

  const master = await Master.create({ type, value });
  res.status(201).json(master);
});

exports.setActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body || {};
  if (typeof isActive !== 'boolean') throw httpError(400, 'isActive must be true or false');

  const master = await Master.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!master) throw httpError(404, 'Master not found');
  res.json(master);
});