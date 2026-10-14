import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errorText } from '../api';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/StatusBadge';
import Person from '../components/Person';
import { fmtDateTime } from '../utils';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function Dealers() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  // small delay so the list is not requested on every key press
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/dealers', { params: { status: status || undefined, q: q || undefined } })
        .then((r) => {
          setRows(r.data);
          setError('');
        })
        .catch((e) => setError(errorText(e)));
    }, 250);
    return () => clearTimeout(timer);
  }, [status, q]);

  const isCreator = user.role === 'CREATOR';

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isCreator ? 'My registrations' : 'All registrations'}</h1>
        {user.role !== 'APPROVER' && <Link to="/dealers/new" className="btn btn-primary">Register a dealer</Link>}
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input className="input max-w-xs" placeholder="Search name, code, GSTIN or state"
            aria-label="Search dealers" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setParams(f.value ? { status: f.value } : {})}
                className={`-ml-px border px-4 py-1.5 first:ml-0 ${
                  status === f.value ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dealer</th><th>Location</th><th>GSTIN</th><th>Registered</th>
                {!isCreator && <th>Created by</th>}
                <th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((d) => (
                <tr key={d._id}>
                  <td>
                    <Link to={`/dealers/${d._id}`} className="link font-medium">{d.name}</Link>
                    <p className="text-sm text-muted"><span className="font-mono">{d.code}</span> · {d.type}</p>
                  </td>
                  <td>{d.state}<p className="text-sm text-muted">{d.city}</p></td>
                  <td className="font-mono text-sm">{d.gstin}</td>
                  <td className="whitespace-nowrap text-sm">{fmtDateTime(d.createdAt)}</td>
                  {!isCreator && <td><Person user={d.createdBy} /></td>}
                  <td><StatusBadge status={d.status} /></td>
                  <td className="text-right">
                    {!isCreator && d.status === 'PENDING'
                      ? <Link to={`/dealers/${d._id}`} className="btn btn-sm btn-primary">Review</Link>
                      : <Link to={`/dealers/${d._id}`} className="btn btn-sm">View</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows && rows.length === 0 && <p className="py-8 text-center text-muted">No dealers match.</p>}
          {!rows && !error && <p className="py-8 text-center text-muted">Loading...</p>}
        </div>
      </div>
    </>
  );
}