import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorText } from '../api';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/StatusBadge';
import Person from '../components/Person';
import { daysSince, fmtDate, greeting, plural } from '../utils';

const OVERDUE_DAYS = 3;
const share = (n, total) => (total ? ((n / total) * 100).toFixed(1) : '0.0') + '% of all';

function Stat({ label, value, note, to, highlight }) {
  return (
    <Link
      to={to}
      className={`block border bg-white p-4 hover:border-accent ${
        highlight ? 'border-line border-t-4 border-t-accent' : 'border-line'
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="block text-3xl font-semibold">{value}</span>
      <span className="text-sm text-muted">{note}</span>
    </Link>
  );
}

function Stats({ counts, total }) {
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Pending review" value={counts.PENDING} note={share(counts.PENDING, total)} to="/dealers?status=PENDING" highlight />
      <Stat label="Approved" value={counts.APPROVED} note={share(counts.APPROVED, total)} to="/dealers?status=APPROVED" />
      <Stat label="Rejected" value={counts.REJECTED} note={share(counts.REJECTED, total)} to="/dealers?status=REJECTED" />
      <Stat label="All registrations" value={total} note="View all" to="/dealers" />
    </div>
  );
}

function ReviewList({ dealers, overdueDays }) {
  if (dealers.length === 0) return <p className="py-6 text-center text-muted">Nothing is waiting for review.</p>;
  return (
    <ul>
      {dealers.map((d) => {
        const waiting = daysSince(d.createdAt);
        return (
          <li key={d._id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0 flex-1">
              <Link to={`/dealers/${d._id}`} className="link">{d.name}</Link>
              <p className="text-sm text-muted">{d.state}, waiting {plural(waiting, 'day')}</p>
            </div>
            {waiting >= overdueDays && (
              <span className="border border-bad bg-bad-bg px-2 py-0.5 text-xs font-semibold text-bad">Overdue</span>
            )}
            <Link to={`/dealers/${d._id}`} className="btn btn-sm btn-primary">Review</Link>
          </li>
        );
      })}
    </ul>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data)).catch((e) => setError(errorText(e)));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <p className="text-muted">Loading...</p>;

  const { counts, total, overdue, overdueDays, pending, recent } = data;
  const line =
    `${plural(total, 'registration')}: ${counts.APPROVED} approved, ${counts.PENDING} pending, ${counts.REJECTED} rejected. ` +
    (overdue
      ? `${overdue} pending ${overdue === 1 ? 'has' : 'have'} waited ${overdueDays} days or more.`
      : 'Nothing is overdue.');

  return (
    <>
      <h1 className="text-2xl font-semibold">{greeting()}, {user.name.split(' ')[0]}</h1>
      <p className="mb-5 text-muted">{line}</p>
      <Stats counts={counts} total={total} />

      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <div className="card">
          <h2 className="font-semibold">Needs review</h2>
          <p className="mb-2 text-sm text-muted">Oldest first. Overdue means waiting {overdueDays} days or more.</p>
          <ReviewList dealers={pending} overdueDays={overdueDays} />
          {counts.PENDING > pending.length && (
            <Link to="/dealers?status=PENDING" className="link mt-3 inline-block">
              View all {counts.PENDING} pending
            </Link>
          )}
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Recent decisions</h2>
          {recent.length === 0 && <p className="py-6 text-center text-muted">No decisions yet.</p>}
          <ul>
            {recent.map((d) => (
              <li key={d._id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <Link to={`/dealers/${d._id}`} className="link">{d.name}</Link>
                  <p className="text-sm text-muted"><Person user={d.reviewedBy} />, {fmtDate(d.reviewedAt)}</p>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function WorkDashboard({ user }) {
  const [dealers, setDealers] = useState(null);
  const [error, setError] = useState('');
  const isCreator = user.role === 'CREATOR';

  useEffect(() => {
    api.get('/dealers').then((r) => setDealers(r.data)).catch((e) => setError(errorText(e)));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!dealers) return <p className="text-muted">Loading...</p>;

  const count = (s) => dealers.filter((d) => d.status === s).length;
  const counts = { PENDING: count('PENDING'), APPROVED: count('APPROVED'), REJECTED: count('REJECTED') };
  const pending = dealers
    .filter((d) => d.status === 'PENDING')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{greeting()}, {user.name.split(' ')[0]}</h1>
        {isCreator && <Link to="/dealers/new" className="btn btn-primary">Register a dealer</Link>}
      </div>
      <p className="mb-5 text-muted">
        {isCreator ? 'Your registrations and where they stand.' : 'Registrations waiting for your decision.'}
      </p>
      <Stats counts={counts} total={dealers.length} />

      <div className="card">
        <h2 className="mb-2 font-semibold">{isCreator ? 'My latest registrations' : 'Needs review'}</h2>
        {isCreator ? (
          <ul>
            {dealers.slice(0, 5).map((d) => (
              <li key={d._id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <Link to={`/dealers/${d._id}`} className="link">{d.name}</Link>
                  <p className="text-sm text-muted">{d.state}, {d.type}</p>
                </div>
                <StatusBadge status={d.status} />
                <Link to={`/dealers/${d._id}`} className="btn btn-sm">View</Link>
              </li>
            ))}
            {dealers.length === 0 && <p className="py-6 text-center text-muted">You have not registered any dealers yet.</p>}
          </ul>
        ) : (
          <ReviewList dealers={pending} overdueDays={OVERDUE_DAYS} />
        )}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === 'ADMIN' ? <AdminDashboard /> : <WorkDashboard user={user} />;
}