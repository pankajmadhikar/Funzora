import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
} from '@mui/material';
import { AddShoppingCart, ArrowBack, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { setCartItems } from '../../store/slices/cartSlice';
import { enrichProduct, enrichProducts, discPct } from '../../utils/enrichProduct';
import { formatPrice } from '../../utils/formatPrice';
import { toggleWishlist, isInWishlist } from '../../utils/wishlistStorage';
import ToyProductCard from '../storefront/ToyProductCard';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wish, setWish] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        setLoading(true);
        const [one, all] = await Promise.all([apiService.getProductById(id), apiService.getProducts()]);
        if (c) return;
        if (one.success && one.data) {
          setProduct(one.data);
          setWish(isInWishlist(one.data._id));
          setError(null);
        } else throw new Error('Product not found');
        setAllProducts(all.data || []);
      } catch (e) {
        if (!c) setError(e.message || 'Failed to load');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  const ep = useMemo(() => (product ? enrichProduct(product) : null), [product]);

  const related = useMemo(() => {
    if (!ep) return [];
    const enriched = enrichProducts(allProducts);
    return enriched.filter((p) => p._id !== ep._id && p._ui.displayCatId === ep._ui.displayCatId).slice(0, 4);
  }, [allProducts, ep]);

  const handleQuantityChange = (value) => {
    setQuantity(Math.max(1, value));
  };

  const syncCart = async () => {
    const cartResponse = await apiService.getCartItems();
    if (cartResponse?.data) dispatch(setCartItems(cartResponse.data));
    dispatch(setRefreshCartItems());
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      setAddingToCart(true);
      await apiService.addToCart(id, quantity);
      await syncCart();
      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to bag 🛍️`);
    } catch (err) {
      toast.error(err.message || 'Failed to add');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      setAddingToCart(true);
      await apiService.addToCart(id, quantity);
      await syncCart();
      navigate('/checkout');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    );
  }

  if (error || !product || !ep) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={<Button onClick={() => navigate('/shop')}>Shop</Button>}>
          {error || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  const u = ep._ui;
  const d = discPct(product.price, product.mrp);
  const stock = u.stock;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Button
        component={Link}
        to="/shop"
        startIcon={<ArrowBack />}
        sx={{ mb: 3, color: 'var(--color-accent)', fontWeight: 800, textTransform: 'none' }}
      >
        Back to shop
      </Button>

      <Grid container spacing={{ xs: 3, md: 6 }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: u.grad,
              borderRadius: '24px',
              p: { xs: 2, md: 4 },
              minHeight: { xs: 280, md: 360 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {u.hot && (
              <Typography
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bgcolor: '#FF6B35',
                  color: '#fff',
                  borderRadius: '10px',
                  px: 1.75,
                  py: 0.5,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                🔥 HOT
              </Typography>
            )}
            {u.isNew && (
              <Typography
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: u.hot ? 88 : 16,
                  bgcolor: '#7B4FFF',
                  color: '#fff',
                  borderRadius: '10px',
                  px: 1.75,
                  py: 0.5,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ✨ NEW
              </Typography>
            )}
            {stock > 0 && stock <= 5 && (
              <Typography
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: '#FEF9EC',
                  border: '2px solid #F59E0B',
                  color: '#F59E0B',
                  borderRadius: '10px',
                  px: 1.75,
                  py: 0.5,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ⚠️ Only {stock} left
              </Typography>
            )}
            <Box
              component="img"
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/400'}
              alt={product.name}
              sx={{
                maxHeight: { xs: 220, md: 300 },
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
          {Array.isArray(product.images) && product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1.25, mt: 1.5 }}>
              {product.images.map((img, index) => (
                <Box
                  key={img}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    p: 1,
                    border: selectedImage === index ? '3px solid #FF6B35' : '3px solid transparent',
                    cursor: 'pointer',
                    bgcolor: '#f8f9ff',
                  }}
                >
                  <Box component="img" src={img} alt="" sx={{ width: '100%', height: 56, objectFit: 'contain' }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              bgcolor: u.catMeta.bg,
              color: u.catMeta.color,
              borderRadius: '20px',
              px: 1.75,
              py: 0.5,
              fontSize: 12,
              fontWeight: 800,
              display: 'inline-block',
              mb: 1.5,
            }}
          >
            {u.catMeta.icon} {u.catMeta.label}
          </Typography>
          <Typography className="bb-head" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, color: 'var(--color-text-primary)', mb: 1, lineHeight: 1.2 }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#FFD23F', fontSize: 16 }}>{'★'.repeat(Math.floor(u.rating))}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{u.rating}</Typography>
            <Typography sx={{ color: '#999', fontSize: 13 }}>({u.rev} reviews)</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography className="bb-head" sx={{ fontSize: 48, color: 'var(--color-primary)' }}>
              {formatPrice(product.price * quantity)}
            </Typography>
            <Box>
              <Typography sx={{ fontSize: 18, color: '#bbb', textDecoration: 'line-through' }}>{formatPrice(product.mrp * quantity)}</Typography>
              {d > 0 && (
                <Typography sx={{ bgcolor: '#FFF0EB', color: '#FF6B35', borderRadius: '8px', px: 1.25, py: 0.25, fontSize: 13, fontWeight: 900, mt: 0.5, display: 'inline-block' }}>
                  {d}% OFF
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, mb: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ bgcolor: '#F3EFFF', color: '#7B4FFF', borderRadius: '10px', px: 1.75, py: 0.75, fontSize: 13, fontWeight: 800 }}>
              👶 Age {u.age}
            </Typography>
            <Typography sx={{ bgcolor: '#EAFAF1', color: '#2ECC71', borderRadius: '10px', px: 1.75, py: 0.75, fontSize: 13, fontWeight: 800 }}>
              ✅ In stock
            </Typography>
          </Box>

          <Typography sx={{ color: '#555', fontSize: 15, lineHeight: 1.8, mb: 2.5 }}>{product.description}</Typography>

          <Box sx={{ bgcolor: '#F8F9FF', borderRadius: '16px', p: 2.5, mb: 2.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1A1A2E', mb: 1.25 }}>
              ✨ What&apos;s great
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              {u.feat.map((f) => (
                <Typography key={f} sx={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  <Box component="span" sx={{ color: '#2ECC71', mr: 0.5 }}>
                    ✓
                  </Box>
                  {f}
                </Typography>
              ))}
            </Box>
          </Box>

          {user?.role === 'user' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>Qty:</Typography>
                <IconButton size="small" onClick={() => handleQuantityChange(quantity - 1)} sx={{ border: '1.5px solid #E5E7EB' }}>
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, style: { textAlign: 'center', width: 72 } }}
                />
                <IconButton size="small" onClick={() => handleQuantityChange(quantity + 1)} sx={{ border: '1.5px solid #FF6B35', color: '#FF6B35' }}>
                  <AddIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddToCart}
                  disabled={addingToCart || stock <= 0}
                  startIcon={<AddShoppingCart />}
                  sx={{
                    borderColor: '#FF6B35',
                    color: '#FF6B35',
                    borderWidth: 2,
                    borderRadius: '14px',
                    py: 1.5,
                    textTransform: 'none',
                    fontFamily: "'Fredoka One',cursive",
                    fontSize: 17,
                  }}
                >
                  {stock <= 0 ? 'Out of stock' : addingToCart ? 'Adding…' : 'Add to bag'}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={buyNow}
                  disabled={addingToCart || stock <= 0}
                  sx={{
                    background: 'linear-gradient(135deg,#FF6B35,#FFD23F)',
                    borderRadius: '14px',
                    py: 1.5,
                    textTransform: 'none',
                    fontFamily: "'Fredoka One',cursive",
                    fontSize: 17,
                    boxShadow: 'none',
                  }}
                >
                  Buy now →
                </Button>
              </Box>
              <Button
                fullWidth
                onClick={() => {
                  const on = toggleWishlist(product._id);
                  setWish(on);
                  toast(on ? 'Saved to wishlist ❤️' : 'Removed from wishlist');
                }}
                sx={{
                  bgcolor: wish ? '#FDE8F4' : '#F8F9FF',
                  color: wish ? '#E91E96' : '#999',
                  border: `1.5px solid ${wish ? '#E91E96' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  py: 1.25,
                  fontWeight: 800,
                  textTransform: 'none',
                  mb: 2,
                }}
              >
                {wish ? '❤ Saved to wishlist' : '🤍 Add to wishlist'}
              </Button>
            </>
          )}
        </Grid>
      </Grid>

      {related.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography className="bb-head" sx={{ fontSize: 24, color: 'var(--color-text-primary)', mb: 2.5 }}>
            You might also <span style={{ color: 'var(--color-accent)' }}>love</span>
          </Typography>
          <Box className="bb-grid bb-grid-4">
            {related.map((p) => (
              <ToyProductCard key={p._id} product={p} />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default ProductDetails;
