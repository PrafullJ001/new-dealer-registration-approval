import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import api, { errorText } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <h2 className="mb-2 text-2xl font-semibold">Check your email</h2>
        <p className="mb-5 text-muted">
          If this email is registered, a reset link has been sent. The link works once and expires in 1 hour.
        </p>
        <Link to="/login" className="link">&larr; Back to list</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold">Forgot your password?</h2>
      <p className="mb-5 text-muted">Enter your email address and we will send a reset link.</p>

      {error && <div className="error-box" role="alert">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-5">
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="input" placeholder="name@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-full py-2.5" disabled={busy}>
          {busy ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4"><Link to="/login" className="link">&larr; Back to list</Link></p>
    </AuthShell>
  );
}