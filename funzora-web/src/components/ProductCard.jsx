import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiService } from '../services/apiService';
import { setCartItems } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button

    if (isAdding) return; // Prevent multiple clicks

    try {
      setIsAdding(true);
      // Add item to cart
      await apiService.addToCart(product._id, 1);

      // Get updated cart items
      const cartResponse = await apiService.getCartItems();

      // Update Redux store with new cart data
      if (cartResponse.data) {
        dispatch(setCartItems(cartResponse.data));
      }

      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Image Container with fixed aspect ratio */}
      <Box
        sx={{
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect ratio
          backgroundColor: '#f5f5f5',
        }}
      >
        <CardMedia
          component="img"
          image={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            p: 3,
          }}
        />

        {/* Badges Container */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            zIndex: 1,
          }}
        >
          {product.discountPercentage > 0 && (
            <Chip
              label={`${product.discountPercentage}% OFF`}
              color="error"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}
          <Chip
            label={product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            size="small"
            color={product.quantity > 0 ? 'success' : 'error'}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
        }}
      >
        {/* Category */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          {product.category || 'Category'}
        </Typography>

        {/* Product Name and Description */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '2.6em',
            color: 'text.primary',
            mb: 0.5,
            whiteSpace: 'pre-line',
          }}
        >
          {product.name}
        </Typography>

        {/* Description with preserved line breaks */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: 'pre-line',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>

        {/* Price Section */}
        <Box
          sx={{
            mt: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {formatPrice(product.price)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                textDecoration: 'line-through',
                color: 'text.secondary',
              }}
            >
              MRP: {formatPrice(product.mrp)}
            </Typography>
          </Box>
          {product.discountPercentage > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                fontWeight: 500,
              }}
            >
              You save: {formatPrice(product.mrp - product.price)} ({product.discountPercentage}% off)
            </Typography>
          )}

          <Button
            variant="contained"
            size="small"
            disabled={isAdding || product.quantity <= 0}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              py: 0.7,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
            onClick={handleQuickAdd}
          >
            {isAdding ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <ShoppingCart fontSize="small" />
                {product.quantity > 0 ? 'Add to cart' : 'Out of Stock'}
              </>
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 