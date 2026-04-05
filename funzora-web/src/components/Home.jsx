import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  Paper,
  IconButton,
  Rating,
  Chip,
  Button,
  alpha,
  Badge,
  styled,
  InputAdornment,
  InputBase,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { apiService } from '../services/apiService';
import { formatPrice } from '../utils/formatPrice';
import { ArrowForward, ArrowBack, ShoppingCart, Remove, Add, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import gadgetSale from '../assets/Banners/gadget-sale.jpg';
import kitchenSale from '../assets/Banners/kitchen-sale.jpg';
import poco from '../assets/Banners/poco-m4-pro.webp';
import realme from '../assets/Banners/realme-9-pro.webp';
import fashionSale from '../assets/Banners/fashionsale.jpg';
import oppo from '../assets/Banners/oppo-reno7.webp';
import { FavoriteBorder, Visibility } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setCartItems } from '../store/slices/cartSlice';
import { debounce } from 'lodash';
import { setRefreshCartItems } from '../redux/slices/authSlice';


// Carousel images - replace with your actual banner images
const carouselItems = [
  {
    image: gadgetSale,
    title: "Gadget Sale",
    description: "Up to 50% off on latest gadgets"
  },
  {
    image: kitchenSale,
    title: "Kitchen Essentials",
    description: "Great deals on kitchen appliances"
  },
  {
    image: poco,
    title: "POCO M4 Pro",
    description: "New launch special offers"
  },
  {
    image: realme,
    title: "Realme 9 Pro",
    description: "Latest 5G smartphones"
  },
  {
    image: fashionSale,
    title: "Fashion Sale",
    description: "Trending fashion collection"
  },
  {
    image: oppo,
    title: "OPPO Reno7",
    description: "Premium smartphone deals"
  }
];

// Enhanced search component styling
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: '400px',
  },
  marginBottom: '10px',
  border: '1px solid #e0e0e0',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

const ProductCard = ({ product, navigate, theme }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newValue) => {
    const value = Math.max(1, newValue);
    setQuantity(value);
  };

  const handleQuickAdd = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button

    if (isAdding) return; // Prevent multiple clicks

    try {
      setIsAdding(true);
      // Add item to cart with selected quantity
      await apiService.addToCart(product._id, quantity);

      // Get updated cart items
      const cartResponse = await apiService.getCartItems();

      // Update Redux store with new cart data
      if (cartResponse.data) {
        dispatch(setCartItems(cartResponse.data));
      }

      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
      dispatch(setRefreshCartItems());
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
          boxShadow: theme.shadows[2],
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
          borderBottom: `1px solid ${theme.palette.divider}`,
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
            p: 3, // Increased padding for better image display
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

      {/* Content Section with fixed padding */}
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1, // Allow content to grow
        }}
      >
        {/* Brand/Category */}
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          {product.category || 'Category'}
        </Typography>

        {/* Product Name */}
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
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {product.name}
        </Typography>

        {/* Price Section */}
        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {formatPrice(product.price * quantity)}
            </Typography>
            {product.discountPercentage > 0 && (
              <Typography
                variant="caption"
                sx={{
                  textDecoration: 'line-through',
                  color: theme.palette.text.secondary,
                }}
              >
                {formatPrice(product.mrp * quantity)}
              </Typography>
            )}
          </Box>

          {/* Quantity Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent card navigation
          >
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isAdding}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
              }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Typography
              variant="body2"
              sx={{
                minWidth: '30px',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              {quantity}
            </Typography>

            <IconButton
              size="small"
              onClick={() => handleQuantityChange(quantity + 1)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            size="small"
            disabled={isAdding || product.quantity <= 0}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
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
                {product.quantity > 0 ? `Add to cart` : 'Out of Stock'}
              </>
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setProducts(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchAnchorEl(null);
      return;
    }

    try {
      setIsSearching(true);
      // Search locally in existing products
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
      setSearchAnchorEl(searchRef.current);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchAnchorEl(null);
  };




  const debouncedSearch = useCallback(
    debounce((query) => handleSearch(query), 300),
    [products] // Add products to dependency array
  );

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setSearchAnchorEl(null);
    }
  };



  // Custom carousel arrow components
  const arrowStyles = {
    position: 'absolute',
    zIndex: 2,
    top: 'calc(50% - 15px)',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const renderArrowPrev = (onClickHandler, hasPrev) => (
    <IconButton
      onClick={onClickHandler}
      sx={{
        ...arrowStyles,
        left: 15,
        display: hasPrev ? 'flex' : 'none'
      }}
    >
      <ArrowBack />
    </IconButton>
  );

  const renderArrowNext = (onClickHandler, hasNext) => (
    <IconButton
      onClick={onClickHandler}
      sx={{
        ...arrowStyles,
        right: 15,
        display: hasNext ? 'flex' : 'none'
      }}
    >
      <ArrowForward />
    </IconButton>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Carousel Section */}
      {/* <Box sx={{ mb: 4 }}>
        <Carousel
          showThumbs={false}
          infiniteLoop
          autoPlay
          interval={5000}
          renderArrowPrev={renderArrowPrev}
          renderArrowNext={renderArrowNext}
          showStatus={false}
          swipeable
          emulateTouch
        >
          {carouselItems.map((item, index) => (
            <Paper
              key={index}
              sx={{
                position: 'relative',
                height: { xs: '200px', sm: '300px', md: '400px' },
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={item.image}
                alt={item.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  p: 2,
                }}
              >
                <Typography variant="h5">{item.title}</Typography>
                <Typography variant="body1">{item.description}</Typography>
              </Box>
            </Paper>
          ))}
        </Carousel>
      </Box> */}
      <Search ref={searchRef}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search products…"
          value={searchQuery}
          onChange={handleSearchChange}
          endAdornment={
            searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ mr: 1 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }
        />
      </Search>
      {/* Products Grid */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={2.5}>
          {/* {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                navigate={navigate}
                theme={theme}
              />
            </Grid>
          ))} */}
          {(searchResults.length > 0 ? searchResults : products).map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                navigate={navigate}
                theme={theme}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 