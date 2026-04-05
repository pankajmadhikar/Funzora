import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';

const LoginCredentials = ({ loginType }) => {
  const credentials = {
    admin: {
      email: 'admin@example.com',
      password: 'admin123'
    },
    user: {
      email: 'user@example.com',
      password: 'user123'
    }
  };

  const cred = credentials[loginType === 1 ? 'admin' : 'user'];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'action.hover',
        border: '1px dashed',
        borderColor: 'divider'
      }}
    >
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Demo Credentials:
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Email:
          </Typography>
          <Typography variant="body2">{cred.email}</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box>
          <Typography variant="caption" color="text.secondary">
            Password:
          </Typography>
          <Typography variant="body2">{cred.password}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginCredentials; 