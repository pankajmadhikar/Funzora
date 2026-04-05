import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  'Processing': 'warning',
  'Delivered': 'success',
  'Cancelled': 'error',
  'Pending': 'info',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllOrders();
      setOrders(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await apiService.updateOrderStatus(selectedOrder._id, newStatus);
      await fetchOrders(); // Refresh orders list
      toast.success(`Order status updated to ${newStatus}`);
      handleClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
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
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Orders ({orders.length})
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer Details</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {order.userId.firstname} {order.userId.lastname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.userId.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {order.userId.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {order.products.map((item, index) => (
                      <Box key={item._id}>
                        {item.productId.name} ({item.quantity} units)
                        {index < order.products.length - 1 ? ', ' : ''}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleStatusClick(e, order)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => updateOrderStatus('Processing')}>
            Mark as Processing
          </MenuItem>
          <MenuItem onClick={() => updateOrderStatus('Delivered')}>
            Mark as Delivered
          </MenuItem>
          <MenuItem onClick={() => updateOrderStatus('Cancelled')}>
            Mark as Cancelled
          </MenuItem>
        </Menu>
      </Paper>
    </Container>
  );
};

export default Orders; 