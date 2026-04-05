import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  AddCircle as AddIcon,
  List as ListIcon,
  ShoppingCart as OrdersIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const dashboardItems = [
    {
      title: 'Add Product',
      description: 'Add new products to the store',
      icon: <AddIcon fontSize="large" />,
      path: '/admin/add-product',
      color: '#4caf50',
    },
    {
      title: 'Manage Products',
      description: 'Edit or remove existing products',
      icon: <ListIcon fontSize="large" />,
      path: '/admin/manage-products',
      color: '#2196f3',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: <OrdersIcon fontSize="large" />,
      path: '/admin/orders',
      color: '#ff9800',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: item.color + '10',
              }}
            >
              <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                {item.description}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(item.path)}
                sx={{ bgcolor: item.color }}
              >
                Access
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 