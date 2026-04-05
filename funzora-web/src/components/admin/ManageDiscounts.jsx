import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

function ManageDiscounts({ product, onSave }) {
  const [discounts, setDiscounts] = useState({
    bulk: [],
    cart: [],
    coupons: []
  });

  useEffect(() => {
    // Initialize discounts when product changes
    if (product && product.discounts) {
      setDiscounts(product.discounts);
    } else {
      setDiscounts({
        bulk: [],
        cart: [],
        coupons: []
      });
    }
  }, [product]);

  // Don't render if no product is selected
  if (!product) {
    return null;
  }

  const handleBulkDiscountAdd = () => {
    setDiscounts(prev => ({
      ...prev,
      bulk: [...prev.bulk, { quantity: 2, percentage: 10 }]
    }));
  };

  const handleBulkDiscountChange = (index, field, value) => {
    setDiscounts(prev => ({
      ...prev,
      bulk: prev.bulk.map((discount, i) => 
        i === index ? { ...discount, [field]: Number(value) } : discount
      )
    }));
  };

  const handleBulkDiscountDelete = (index) => {
    setDiscounts(prev => ({
      ...prev,
      bulk: prev.bulk.filter((_, i) => i !== index)
    }));
  };

  const handleCartDiscountAdd = () => {
    setDiscounts(prev => ({
      ...prev,
      cart: [...prev.cart, { minAmount: 1000, percentage: 5 }]
    }));
  };

  const handleCartDiscountChange = (index, field, value) => {
    setDiscounts(prev => ({
      ...prev,
      cart: prev.cart.map((discount, i) => 
        i === index ? { ...discount, [field]: Number(value) } : discount
      )
    }));
  };

  const handleCartDiscountDelete = (index) => {
    setDiscounts(prev => ({
      ...prev,
      cart: prev.cart.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(discounts);
      toast.success('Discounts updated successfully');
    } catch (error) {
      toast.error('Failed to update discounts');
      console.error('Error updating discounts:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* <Typography variant="h6" gutterBottom>
        Manage Discounts for {product.name}
      </Typography> */}

      {/* Bulk Discounts */}
      {/* <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Bulk Purchase Discounts</Typography>
            <Button 
              startIcon={<AddIcon />} 
              onClick={handleBulkDiscountAdd}
              variant="outlined"
              size="small"
            >
              Add Bulk Discount
            </Button>
          </Box>

          {discounts.bulk.map((discount, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  label="Minimum Quantity"
                  type="number"
                  value={discount.quantity}
                  onChange={(e) => handleBulkDiscountChange(index, 'quantity', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Discount %"
                  type="number"
                  value={discount.percentage}
                  onChange={(e) => handleBulkDiscountChange(index, 'percentage', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <IconButton 
                  onClick={() => handleBulkDiscountDelete(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </CardContent>
      </Card> */}

      {/* Cart Discounts */}
      {/* <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Cart Total Discounts</Typography>
            <Button 
              startIcon={<AddIcon />} 
              onClick={handleCartDiscountAdd}
              variant="outlined"
              size="small"
            >
              Add Cart Discount
            </Button>
          </Box>

          {discounts.cart.map((discount, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  label="Minimum Amount"
                  type="number"
                  value={discount.minAmount}
                  onChange={(e) => handleCartDiscountChange(index, 'minAmount', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Discount %"
                  type="number"
                  value={discount.percentage}
                  onChange={(e) => handleCartDiscountChange(index, 'percentage', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <IconButton 
                  onClick={() => handleCartDiscountDelete(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </CardContent>
      </Card> */}

      {/* <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave}
        fullWidth
      >
        Save Discounts
      </Button> */}
    </Box>
  );
}

export default ManageDiscounts; 