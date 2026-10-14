import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ACCESS = {
  ADMIN: ['Full access', 'Manage users, masters and reports', 'Register dealers and decide any registration'],
  APPROVER: ['View all registrations', 'Approve or reject pending registrations'],
  CREATOR: ['Register new dealers', 'View only your own registrations'],
};

const ROLE_NAME = { ADMIN: 'Admin', APPROVER: 'Approver', CREATOR: 'Creator' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/dealers', label: user.role === 'CREATOR' ? 'My registrations' : 'All registrations', end: true },
  ];
  if (user.role !== 'APPROVER') links.push({ to: '/dealers/new', label: 'Register a dealer' });
  if (user.role === 'ADMIN') {
    links.push(
      { to: '/reports', label: 'Reports' },
      { to: '/users', label: 'Users' },
      { to: '/masters', label: 'Masters' }
    );
  }

  function signOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-navy px-6 py-3 text-white">
        <div className="flex items-baseline gap-4">
          <span className="text-lg font-semibold">Dealer Onboarding Portal</span>
          <span className="hidden border-l border-white/30 pl-4 text-sm text-slate-300 sm:inline">
            Registration &amp; Approval
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span>{user.name}</span>
          <span className="border border-white/40 px-2 py-0.5 text-xs tracking-wide">{user.role}</span>
          <button onClick={signOut} className="cursor-pointer border border-white/40 px-3 py-1 hover:bg-white/10">
            Sign out
          </button>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[260px_1fr]">
        <nav className="border-b border-line bg-white md:sticky md:top-[57px] md:h-[calc(100vh-57px)] md:overflow-auto md:border-b-0 md:border-r">
          <ul className="flex flex-wrap md:block">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `block border-b-4 px-4 py-3 md:border-b-0 md:border-l-4 ${
                      isActive
                        ? 'border-accent bg-accent-soft font-medium text-accent'
                        : 'border-transparent hover:bg-page'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="m-4 hidden border-t border-line pt-4 text-sm md:block">
            <p className="mb-1 text-xs font-semibold tracking-widest text-muted">YOUR ACCESS</p>
            <p className="font-semibold">{ROLE_NAME[user.role]}</p>
            <ul className="mt-1 list-disc pl-5 text-muted">
              {ACCESS[user.role].map((line) => (
                <li key={line} className="mb-1">{line}</li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="min-w-0 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}