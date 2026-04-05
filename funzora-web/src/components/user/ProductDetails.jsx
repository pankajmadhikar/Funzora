import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem,
  Chip,
  TextField,
  IconButton,
} from '@mui/material';
import {
  AddShoppingCart,
  ArrowBack,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { setCartItems } from '../../store/slices/cartSlice';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const result = await apiService.getProductById(id);
        console.log("result", result);
        if (result.success && result.data) {
          setProduct(result.data);
          setError(null);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, value);
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      setAddingToCart(true);
      await apiService.addToCart(id, quantity);

      const cartResponse = await apiService.getCartItems();

      // Update Redux store with new cart data
      if (cartResponse?.data) {
        dispatch(setCartItems(cartResponse?.data));
      }


      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
      dispatch(setRefreshCartItems());
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
      dispatch(setRefreshCartItems());
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  const finalPrice = product.actualAmount * quantity;
  const originalPrice = product.price * quantity;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 4 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Left Column - Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <Box sx={{ position: 'relative', p: 2 }}>
              {product.discountPercentage > 0 && (
                <Chip
                  label={`${product.discountPercentage}% OFF`}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                  }}
                />
              )}
              <Box
                component="img"
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/400'}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                }}
              />
            </Box>
            {Array.isArray(product.images) && product.images.length > 1 && (
              <Box sx={{ p: 2 }}>
                <ImageList sx={{ width: '100%' }} cols={4} rowHeight={100}>
                  {product.images.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                      }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        style={{ objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column - Product Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {product.category} / {product.subCategory}
              </Typography>

              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>

              <Box sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <Typography variant="h4" color="primary">
                    ₹{(product.price * quantity).toFixed(2)}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    MRP: ₹{(product.mrp * quantity).toFixed(2)}
                  </Typography>
                </Box>
                {product.discountPercentage > 0 && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    You save: ₹{((product.mrp - product.price) * quantity).toFixed(2)} ({product.discountPercentage}% off)
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-line',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {product.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Specification
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-line',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {product.specification}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {user?.role === 'user' && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Quantity:
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      size="small"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      inputProps={{
                        min: 1,
                        style: { textAlign: 'center', width: '100px' }
                      }}
                      sx={{ mx: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    fullWidth
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetails;