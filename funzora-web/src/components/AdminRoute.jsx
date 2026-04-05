import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

function AdminRoute() {
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin
  return userRole === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}

export default AdminRoute;