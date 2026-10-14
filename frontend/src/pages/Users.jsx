import { useEffect, useState } from 'react';
import api, { errorText } from '../api';
import { useAuth } from '../context/useAuth';

const ROLE_NAME = { ADMIN: 'Admin', APPROVER: 'Approver', CREATOR: 'Creator' };

function StatusTag({ user }) {
  const [text, style] = user.invited
    ? ['Invited', 'border-warn bg-warn-bg text-warn']
    : user.isActive
      ? ['Active', 'border-ok bg-ok-bg text-ok']
      : ['Deactivated', 'border-bad bg-bad-bg text-bad'];
  return <span className={`inline-block border px-2 py-0.5 text-xs font-semibold ${style}`}>{text}</span>;
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', role: 'CREATOR' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data)).catch((e) => setMsg({ bad: true, text: errorText(e) }));
  }, [version]);

  const reload = () => setVersion((v) => v + 1);

  async function invite(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { data } = await api.post('/users', form);
      setForm({ name: '', email: '', role: 'CREATOR' });
      setMsg(
        data.emailed
          ? { text: `Invitation sent to ${data.user.email}.` }
          : { bad: true, text: 'User created, but the email could not be sent. Use Resend invite.' }
      );
      reload();
    } catch (err) {
      setMsg({ bad: true, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  }

  async function run(request, okText) {
    setMsg(null);
    try {
      await request();
      setMsg({ text: okText });
      reload();
    } catch (err) {
      setMsg({ bad: true, text: errorText(err) });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mb-5 text-muted">Invite people and control who can sign in.</p>

      {msg && (
        <div className={`mb-4 border px-3 py-2 text-sm ${msg.bad ? 'border-bad bg-bad-bg text-bad' : 'border-ok bg-ok-bg text-ok'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={invite} className="card">
        <h2 className="font-semibold">Invite a user</h2>
        <p className="mb-4 text-sm text-muted">
          The user receives a link by email to set their own password. The link works once and expires in 24 hours.
        </p>
        <div className="grid items-end gap-4 md:grid-cols-[1fr_1fr_180px_auto]">
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" placeholder="name@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="CREATOR">Creator</option>
              <option value="APPROVER">Approver</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={busy}>Send invitation</button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><b>{u.name}</b><p className="text-sm text-muted">{u.email}</p></td>
                <td>{ROLE_NAME[u.role]}</td>
                <td><StatusTag user={u} /></td>
                <td className="text-right">
                  {u._id === me._id ? (
                    <span className="text-sm text-muted">You</span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {u.invited && (
                        <button className="btn btn-sm"
                          onClick={() => run(() => api.post(`/users/${u._id}/invite`), 'Invitation sent again.')}>
                          Resend invite
                        </button>
                      )}
                      <button className="btn btn-sm"
                        onClick={() => run(() => api.patch(`/users/${u._id}`, { isActive: !u.isActive }), 'User updated.')}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}