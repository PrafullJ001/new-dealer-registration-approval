import { useEffect, useRef, useState } from 'react';
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

  // profile menu (open / close) - display only
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // first letters of the first two words of the name, e.g. "Prafull Jadhav" -> "PJ"
  const initials = (user.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

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
      <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-3 bg-navy px-6 text-white">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">New Dealer Registration And Approval Portal</span>
        </div>

        {/* profile: name and role always visible, click to open the menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
            className="flex cursor-pointer items-center gap-2.5"
          >
            <span className="text-right leading-tight">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="block text-xs text-slate-300">{ROLE_NAME[user.role]}</span>
            </span>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-xs font-medium text-navy">
              {initials}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 border border-line bg-white p-1.5 text-ink shadow-sm"
            >
              <div className="border-b border-line px-3 py-2.5">
                <p className="text-sm font-medium">{user.name}</p>
                <span className="mt-1 inline-block bg-accent-soft px-2 py-0.5 text-xs text-accent">
                  {ROLE_NAME[user.role]}
                </span>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="mt-1.5 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-bad hover:bg-page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M9 12h12l-3 -3" />
                  <path d="M18 15l3 -3" />
                </svg>
                Sign out
              </button>
            </div>
          )}
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