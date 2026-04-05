import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout, setLoading } from '../../store/slices/authSlice';
import { Box, CircularProgress } from '@mui/material';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            dispatch(setCredentials({ user, token }));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
      dispatch(setLoading(false));
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthProvider; 