import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated, selectIsLoading } from '../../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

/** Admin-only JWT gate. Shoppers use WhatsApp phone (no token). */
export default function AdminRoute() {
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 130px)">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
