import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorText } from '../api';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/StatusBadge';
import Person from '../components/Person';
import { fmtDateTime } from '../utils';

export default function DealerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [dealer, setDealer] = useState(null);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/dealers/${id}`).then((r) => setDealer(r.data)).catch((e) => setError(errorText(e)));
  }, [id]);

  async function decide(action) {
    setFormError('');
    if (action === 'reject' && reason.trim().length < 10) {
      setFormError('Give a reason of at least 10 characters.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.patch(`/dealers/${id}/${action}`, action === 'reject' ? { reason } : undefined);
      setDealer(data);
      setRejecting(false);
      setReason('');
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const back = <Link to="/dealers" className="link">&larr; Back to list</Link>;

  if (error) return <>{back}<div className="error-box mt-4">{error}</div></>;
  if (!dealer) return <p className="text-muted">Loading...</p>;

  const details = [
    ['Dealer ID', <span className="font-mono">{dealer.code}</span>],
    ['GSTIN', <span className="font-mono">{dealer.gstin}</span>],
    ['Contact person', dealer.contactPerson],
    ['Mobile', `+91 ${dealer.mobile}`],
    ['Email', dealer.email],
    ['Location', `${dealer.city}, ${dealer.state}`],
    ['Dealer type', dealer.type],
  ];

  const history = [{ title: 'Registered', by: dealer.createdBy, at: dealer.createdAt }];
  if (dealer.reviewedAt) {
    history.push({
      title: dealer.status === 'APPROVED' ? 'Approved' : 'Rejected',
      by: dealer.reviewedBy,
      at: dealer.reviewedAt,
      note: dealer.rejectionReason,
    });
  }

  const canDecide = user.role !== 'CREATOR' && dealer.status === 'PENDING';

  return (
    <>
      {back}
      <div className="mt-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{dealer.name}</h1>
        <StatusBadge status={dealer.status} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Registration details</h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[160px_1fr]">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">History</h2>
        <ol className="ml-1.5 border-l-2 border-line">
          {history.map((h) => (
            <li key={h.title} className="relative pb-5 pl-5 last:pb-0">
              <span className="absolute top-1.5 -left-[7px] size-3 border-2 border-accent bg-white" />
              <p><b>{h.title}</b> by <Person user={h.by} /></p>
              <p className="text-sm text-muted">{fmtDateTime(h.at)}</p>
              {h.note && <p className="mt-1">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>

      {canDecide && (
        <div className="card">
          <h2 className="mb-1 font-semibold">Decision</h2>
          {formError && <div className="error-box" role="alert">{formError}</div>}

          {rejecting ? (
            <>
              <label className="label" htmlFor="reason">Reason for rejection</label>
              <input id="reason" className="input" placeholder="Explain what needs correction"
                value={reason} onChange={(e) => setReason(e.target.value)} />
              <p className="mt-1 mb-4 text-sm text-muted">
                Minimum 10 characters ({reason.trim().length} so far). The creator will see this reason.
              </p>
              <div className="flex gap-3">
                <button className="btn btn-reject" disabled={busy} onClick={() => decide('reject')}>
                  Confirm rejection
                </button>
                <button className="btn" onClick={() => { setRejecting(false); setFormError(''); }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-muted">Check the details above, then approve or reject this registration.</p>
              <div className="flex gap-3">
                <button className="btn btn-approve px-6" disabled={busy} onClick={() => decide('approve')}>Approve</button>
                <button className="btn btn-reject px-6" onClick={() => setRejecting(true)}>Reject</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}