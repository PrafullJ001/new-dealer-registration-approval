import { useEffect, useState } from 'react';
import api, { errorText } from '../api';

function Matrix({ title, label, rows }) {
  const sum = (key) => rows.reduce((total, r) => total + r[key], 0);
  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>{label}</th>
            <th className="text-right">Pending</th><th className="text-right">Approved</th>
            <th className="text-right">Rejected</th><th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.value}>
              <td>{r.value}</td>
              <td className="text-right">{r.PENDING}</td>
              <td className="text-right">{r.APPROVED}</td>
              <td className="text-right">{r.REJECTED}</td>
              <td className="text-right font-semibold">{r.total}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="border-t-2 border-ink">Total</td>
            <td className="border-t-2 border-ink text-right">{sum('PENDING')}</td>
            <td className="border-t-2 border-ink text-right">{sum('APPROVED')}</td>
            <td className="border-t-2 border-ink text-right">{sum('REJECTED')}</td>
            <td className="border-t-2 border-ink text-right">{sum('total')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/reports').then((r) => setData(r.data)).catch((e) => setError(errorText(e)));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <p className="text-muted">Loading...</p>;

  const roleName = { ADMIN: 'Admin', APPROVER: 'Approver', CREATOR: 'Creator' };

  return (
    <>
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="mb-5 text-muted">Breakdowns by state, dealer type and team member.</p>

      <div className="grid gap-5 xl:grid-cols-2">
        <Matrix title="State by status" label="State" rows={data.byState} />
        <Matrix title="Dealer type by status" label="Dealer type" rows={data.byType} />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Team</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Person</th><th>Role</th>
              <th className="text-right">Registered</th><th className="text-right">Approved</th>
              <th className="text-right">Rejected</th><th className="text-right">Decisions</th>
            </tr>
          </thead>
          <tbody>
            {data.team.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{roleName[t.role]}</td>
                <td className="text-right">{t.registered}</td>
                <td className="text-right">{t.approved}</td>
                <td className="text-right">{t.rejected}</td>
                <td className="text-right font-semibold">{t.decisions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}