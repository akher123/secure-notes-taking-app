import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute({ admin = false }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user?.role !== 'admin') {
    return <Navigate to="/notes" replace />;
  }

  return <Outlet />;
}
