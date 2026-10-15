import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { errorText } from '../api';

const ROLES = [
  { value: 'CREATOR', label: 'Creator', note: 'Registers dealers and sees only their own registrations.' },
  { value: 'APPROVER', label: 'Approver', note: 'Reviews registrations and approves or rejects them.' },
  { value: 'ADMIN', label: 'Admin', note: 'Manages users, masters and reports.' },
];

// small info shown under the login card (display only)
const STEPS = [
  { title: 'Register', text: 'Add a new dealer' },
  { title: 'Review', text: 'Approve or reject' },
  { title: 'Track', text: 'See every status' },
];

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState('CREATOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = ROLES.find((r) => r.value === role);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password, role); // App moves to the dashboard once the user is set
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <div className="auth-scale flex min-h-screen flex-col overflow-x-hidden bg-page">
      {/* slim navy band */}
      <header className="bg-navy px-4 pb-20 pt-6 text-center text-white sm:px-6 md:pb-24 md:pt-8">
        <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">New Dealer Registration And Approval Portal</h1>
        <p className="mt-1 text-sm text-slate-300">Register, review and approve dealers in one place</p>
      </header>

      {/* login card floating over the band */}
      <main className="relative mx-auto -mt-14 w-full max-w-md px-4 md:-mt-16 md:max-w-lg">
        <div className="border border-line bg-white p-5 shadow-sm sm:p-6 md:p-6">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mb-5 text-muted">Use the account issued by your administrator.</p>

          {error && <div className="error-box" role="alert">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-5">
              <span className="label" id="role-label">Role</span>
              <div className="flex" role="radiogroup" aria-labelledby="role-label">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={role === r.value}
                    onClick={() => { setRole(r.value); setError(''); }}
                    className={`-ml-px flex-1 border px-2 py-2 first:ml-0 ${
                      role === r.value
                        ? 'relative border-navy bg-navy font-medium text-white'
                        : 'border-line bg-white hover:border-accent'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">{selected.note}</p>
            </div>

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
                <input id="password" className="input min-w-0" autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
                <button
                  type="button"
                  className="btn flex-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // eye with a line through it = password is visible, click to hide
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // normal eye = password is hidden, click to show
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="btn btn-primary w-full py-2.5" disabled={busy}>
              {busy ? 'Signing in...' : `Sign in as ${selected.label}`}
            </button>
          </form>
        </div>
      </main>

      {/* steps: always 3 in a row. phone = number on top, bigger screens = number beside text */}
      <section className="mx-auto mb-6 mt-5 grid w-full max-w-3xl grid-cols-3 gap-2 px-3 sm:gap-4 sm:px-6">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-start sm:justify-center sm:gap-3 sm:text-left"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-sm text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-base font-medium sm:text-lg">{s.title}</p>
              <p className="text-sm leading-snug text-muted sm:text-base">{s.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}