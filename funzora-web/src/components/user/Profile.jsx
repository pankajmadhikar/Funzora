import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { apiService } from '../../services/apiService';
import { formatPrice } from '../../utils/formatPrice';

function Profile() {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserOrders();
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      {/* User Info Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '3rem',
            }}
          >
            {user?.firstname?.[0]}{user?.lastname?.[0]}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {user?.firstname} {user?.lastname}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.phone}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid2 container spacing={3}>
          <Grid2 xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Account Type
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </Typography>
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Order History Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Order History
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {orders.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No orders found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        {order.items.map((item, index) => (
                          <Typography
                            key={item._id}
                            variant="body2"
                            noWrap
                            component="span"
                            sx={{ display: 'inline-block', mr: 1 }}
                          >
                            {item.product.name}
                            {index < order.items.length - 1 ? ', ' : ''}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default Profile; 