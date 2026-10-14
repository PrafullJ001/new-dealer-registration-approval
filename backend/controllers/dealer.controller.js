const Dealer = require('../models/Dealer');
const Master = require('../models/Master');
const { ROLES, STATUS, MIN_REJECT_LENGTH } = require('../config/constants');
const { httpError, asyncHandler } = require('../utils/http');

const FIELDS = ['name', 'gstin', 'type', 'contactPerson', 'mobile', 'email', 'state', 'city'];

// a creator only ever works with their own registrations
const scopeFor = (user) => (user.role === ROLES.CREATOR ? { createdBy: user._id } : {});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// name and role of the people on a dealer, so the screens can show who did what
function withNames(query) {
  return query.populate('createdBy', 'name role').populate('reviewedBy', 'name role');
}

exports.list = asyncHandler(async (req, res) => {
  const filter = scopeFor(req.user);

  if (Object.values(STATUS).includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ name: rx }, { gstin: rx }, { code: rx }, { state: rx }];
  }

  res.json(await withNames(Dealer.find(filter).sort({ createdAt: -1 })));
});

exports.getOne = asyncHandler(async (req, res) => {
  const dealer = await withNames(Dealer.findById(req.params.id));
  if (!dealer) throw httpError(404, 'Dealer not found');

  if (req.user.role === ROLES.CREATOR && String(dealer.createdBy._id) !== String(req.user._id)) {
    throw httpError(403, 'This is not your registration');
  }
  res.json(dealer);
});

exports.create = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // only the listed fields are taken, so status, createdBy and code can't be sent from outside
  const data = {};
  FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = typeof body[f] === 'string' ? body[f].trim() : body[f];
  });

  // type and state must come from the active masters
  const [typeOk, stateOk] = await Promise.all([
    Master.exists({ type: 'DEALER_TYPE', value: data.type, isActive: true }),
    Master.exists({ type: 'STATE', value: data.state, isActive: true }),
  ]);
  if (data.type && !typeOk) throw httpError(400, 'Choose a valid dealer type');
  if (data.state && !stateOk) throw httpError(400, 'Choose a valid state');

  const dealer = await Dealer.create({ ...data, createdBy: req.user._id });
  res.status(201).json(dealer);
});

async function decide(req, res, status, reason) {
  const dealer = await Dealer.findById(req.params.id);
  if (!dealer) throw httpError(404, 'Dealer not found');

  // the status check is part of the update, so two reviewers can't both succeed
  const update = { status, reviewedBy: req.user._id, reviewedAt: new Date() };
  if (reason) update.rejectionReason = reason;

  const updated = await withNames(
    Dealer.findOneAndUpdate({ _id: dealer._id, status: STATUS.PENDING }, update, { new: true })
  );
  if (!updated) {
    throw httpError(409, `This registration is already ${dealer.status.toLowerCase()}`);
  }
  res.json(updated);
}

exports.approve = asyncHandler((req, res) => decide(req, res, STATUS.APPROVED));

exports.reject = asyncHandler((req, res) => {
  const reason = String((req.body || {}).reason || '').trim();
  if (reason.length < MIN_REJECT_LENGTH) {
    throw httpError(400, `Rejection reason must be at least ${MIN_REJECT_LENGTH} characters`);
  }
  return decide(req, res, STATUS.REJECTED, reason);
});