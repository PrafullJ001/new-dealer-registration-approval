import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import api, { errorText } from '../api';

const BAD_LINK = 'This link is invalid or has expired';

// opened from the invite email and from the reset email
export default function SetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [info, setInfo] = useState(null);
  const [linkError, setLinkError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get(`/auth/token/${token}`)
      .then((res) => setInfo(res.data))
      .catch((err) => setLinkError(errorText(err)));
  }, [token]);

  // a missing token is known straight away, so no effect is needed for it
  const problem = token ? linkError : BAD_LINK;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/set-password', { token, password });
      setDone(true);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  if (problem) {
    return (
      <AuthShell>
        <h2 className="mb-2 text-2xl font-semibold">Link not valid</h2>
        <p className="mb-5 text-muted">{problem}. Ask for a new link.</p>
        <Link to="/forgot-password" className="btn btn-primary mr-2">Request a reset link</Link>
        <Link to="/login" className="btn">&larr; Back to list</Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <h2 className="mb-2 text-2xl font-semibold">Password saved</h2>
        <p className="mb-5 text-muted">You can now sign in with your new password.</p>
        <Link to="/login" className="btn btn-primary">Go to sign in</Link>
      </AuthShell>
    );
  }

  if (!info) return <AuthShell><p className="text-muted">Checking your link...</p></AuthShell>;

  const invite = info.type === 'invite';

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold">{invite ? 'Set your password' : 'Reset your password'}</h2>
      <p className="mb-5 text-muted">
        {invite
          ? `Welcome, ${info.name}. Choose a password to activate your account.`
          : 'Choose a new password for your account.'}
      </p>

      {error && <div className="error-box" role="alert">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="label">Email address</label>
          <input className="input bg-page" value={info.email} disabled />
        </div>
        <div className="mb-4">
          <label className="label" htmlFor="p1">New password</label>
          <input id="p1" type="password" className="input" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="label" htmlFor="p2">Confirm password</label>
          <input id="p2" type="password" className="input" autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <p className="mb-5 text-sm text-muted">At least 8 characters, with a letter and a number.</p>

        <button className="btn btn-primary w-full py-2.5" disabled={busy}>
          {busy ? 'Saving...' : invite ? 'Set password' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  );
}