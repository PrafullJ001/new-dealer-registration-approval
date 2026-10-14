const Dealer = require('../models/Dealer');
const User = require('../models/User');
const { STATUS } = require('../config/constants');
const { asyncHandler } = require('../utils/http');

const OVERDUE_DAYS = 3;

exports.summary = asyncHandler(async (req, res) => {
  const overdueBefore = new Date(Date.now() - OVERDUE_DAYS * 24 * 60 * 60 * 1000);

  const [grouped, pending, recent, overdue] = await Promise.all([
    Dealer.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Dealer.find({ status: STATUS.PENDING }).sort({ createdAt: 1 }).limit(5).populate('createdBy', 'name role'),
    Dealer.find({ reviewedAt: { $exists: true } }).sort({ reviewedAt: -1 }).limit(4).populate('reviewedBy', 'name role'),
    Dealer.countDocuments({ status: STATUS.PENDING, createdAt: { $lte: overdueBefore } }),
  ]);

  const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  grouped.forEach((g) => {
    counts[g._id] = g.n;
  });
  const total = counts.PENDING + counts.APPROVED + counts.REJECTED;

  res.json({ counts, total, overdue, overdueDays: OVERDUE_DAYS, pending, recent });
});

// turns [{ _id: { key, status }, n }] into one row per state or dealer type
function toMatrix(rows) {
  const map = {};
  rows.forEach(({ _id, n }) => {
    const row = (map[_id.key] = map[_id.key] || {
      value: _id.key, PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0,
    });
    row[_id.status] += n;
    row.total += n;
  });
  return Object.values(map).sort((a, b) => a.value.localeCompare(b.value));
}

exports.reports = asyncHandler(async (req, res) => {
  const group = (field) =>
    Dealer.aggregate([{ $group: { _id: { key: '$' + field, status: '$status' }, n: { $sum: 1 } } }]);

  const [byState, byType, users, registered, decisions] = await Promise.all([
    group('state'),
    group('type'),
    User.find().sort({ createdAt: 1 }),
    Dealer.aggregate([{ $group: { _id: '$createdBy', n: { $sum: 1 } } }]),
    Dealer.aggregate([
      { $match: { reviewedBy: { $exists: true } } },
      { $group: { _id: { by: '$reviewedBy', status: '$status' }, n: { $sum: 1 } } },
    ]),
  ]);

  const team = users.map((u) => {
    const id = String(u._id);
    const decided = (status) =>
      decisions
        .filter((d) => String(d._id.by) === id && d._id.status === status)
        .reduce((sum, d) => sum + d.n, 0);
    const approved = decided(STATUS.APPROVED);
    const rejected = decided(STATUS.REJECTED);
    const mine = registered.find((r) => String(r._id) === id);

    return {
      id: u._id, name: u.name, role: u.role,
      registered: mine ? mine.n : 0, approved, rejected, decisions: approved + rejected,
    };
  });

  res.json({ byState: toMatrix(byState), byType: toMatrix(byType), team });
});