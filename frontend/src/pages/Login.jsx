import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';
import { errorText } from '../api';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password); // App moves to the dashboard once the user is set
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <p className="mb-5 text-muted">Use the account issued by your administrator.</p>

      {error && <div className="error-box" role="alert">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="input" placeholder="name@company.com"
            autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="link mb-1 text-sm">Forgot password?</Link>
          </div>
          <div className="flex gap-2">
            <input id="password" className="input" autoComplete="current-password"
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="btn btn-primary w-full py-2.5" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}