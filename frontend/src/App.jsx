import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SetPassword from './pages/SetPassword';
import Dashboard from './pages/Dashboard';
import Dealers from './pages/Dealers';
import DealerForm from './pages/DealerForm';
import DealerDetail from './pages/DealerDetail';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Masters from './pages/Masters';

// grey pulsing boxes shown on page refresh while we check the login
function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" aria-busy="true" aria-label="Loading">
      <header className="flex items-center justify-between bg-navy px-6 py-3">
        <div className="h-6 w-56 rounded bg-white/20" />
        <div className="flex items-center gap-3">
          <div className="h-5 w-24 rounded bg-white/20" />
          <div className="h-7 w-20 rounded bg-white/20" />
        </div>
      </header>

      <div className="md:grid md:grid-cols-[260px_1fr]">
        <nav className="hidden border-r border-line bg-white p-4 md:block md:h-[calc(100vh-57px)]">
          <div className="space-y-4">
            <div className="h-4 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-3/5 rounded bg-slate-200" />
            <div className="h-4 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-2/5 rounded bg-slate-200" />
            <div className="h-4 w-3/5 rounded bg-slate-200" />
          </div>
        </nav>

        <main className="min-w-0 p-6 md:p-8">
          <div className="mb-6 h-7 w-48 rounded bg-slate-200" />
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-24 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-11/12 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-10/12 rounded bg-slate-200" />
            <div className="h-4 w-3/5 rounded bg-slate-200" />
          </div>
        </main>
      </div>
    </div>
  );
}

// hiding a page here is only for convenience, the API checks the role again
function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />

      <Route element={<Protected><Layout /></Protected>}>
         <Route index element={<Dashboard />} />
        <Route path="dealers" element={<Dealers />} />
        <Route
          path="dealers/new"
          element={<Protected roles={['ADMIN', 'CREATOR']}><DealerForm /></Protected>}
        />
        <Route path="dealers/:id" element={<DealerDetail />} />
        <Route path="reports" element={<Protected roles={['ADMIN']}><Reports /></Protected>} />
        <Route path="users" element={<Protected roles={['ADMIN']}><Users /></Protected>} />
        <Route path="masters" element={<Protected roles={['ADMIN']}><Masters /></Protected>} /> 
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}