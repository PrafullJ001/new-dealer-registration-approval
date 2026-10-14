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

// hiding a page here is only for convenience, the API checks the role again
function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-muted">Loading...</p>;
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