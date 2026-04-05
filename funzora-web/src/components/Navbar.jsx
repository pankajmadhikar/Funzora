import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  InputBase,
  alpha,
  styled,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Popper,
  Paper,
  ClickAwayListener,
  CircularProgress,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  Person as UserIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  LocalOffer as OffersIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  ListAlt,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { setCartItems } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { debounce } from 'lodash';

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

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const { user, isAuthenticated, cartItemRefresher } = useSelector(state => state.auth);
  const { cartItems = [] } = useSelector(state => state.cart);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchRef = useRef(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isValidUser = user && typeof user === 'object';
  const userRole = isValidUser ? (user.role || 'user') : 'user';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchAnchorEl(null);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiService.searchProducts(query);
      setSearchResults(response.data || []);
      setSearchAnchorEl(searchRef.current);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCartItems();
        if (response.data) {
          dispatch(setCartItems(response.data));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role !== 'admin') {
      loadCartItems();
    }
  }, [dispatch, isAuthenticated, user, apiService.addToCart]);

  const debouncedSearch = useCallback(
    debounce((query) => handleSearch(query), 300),
    []
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

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchAnchorEl(null);
  };

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  if (!isAuthenticated || isAuthPage || !isValidUser) {
    return null;
  }

  const userMenuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Categories', path: '/categories', icon: <CategoryIcon /> },
    { text: 'Offers', path: '/offers', icon: <OffersIcon /> },
    { text: 'Wishlist', path: '/wishlist', icon: <FavoriteIcon /> },
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to={userRole === 'admin' ? "/admin" : "/"}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 700,
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Discount Store
          </Typography>

          {/* <Search ref={searchRef}>
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
          </Search> */}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && userRole !== 'admin' && userMenuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}

            {userRole !== 'admin' && (
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge
                  badgeContent={cartItems?.items?.length || 0}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 3,
                      padding: '0 4px',
                      height: '20px',
                      minWidth: '20px',
                    }
                  }}
                >
                  <CartIcon />
                </Badge>
              </IconButton>
            )}

            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <UserIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Popper
        open={Boolean(searchAnchorEl) && searchQuery.length > 0}
        anchorEl={searchAnchorEl}
        placement="bottom-start"
        style={{ width: searchRef.current?.offsetWidth, zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setSearchAnchorEl(null)}>
          <Paper
            elevation={3}
            sx={{
              mt: 1,
              maxHeight: '400px',
              overflow: 'auto',
              border: 1,
              borderColor: 'divider',
            }}
          >
            {isSearching ? (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((product) => (
                  <MenuItem
                    key={product._id}
                    onClick={() => {
                      navigate(`/product/${product._id}`);
                      handleClearSearch();
                    }}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={product.name}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'contain',
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                        }}
                      />

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            fontWeight="600"
                          >
                            {formatPrice(product.price)}
                          </Typography>
                          {product.discountPercentage > 0 && (
                            <Chip
                              label={`${product.discountPercentage}% OFF`}
                              color="error"
                              size="small"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </>
            ) : searchQuery.length > 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No products found for "{searchQuery}"
                </Typography>
              </Box>
            ) : null}
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { width: 280 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Menu
          </Typography>
          <List>
            {userMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <ListItemText primary={item.text} sx={{ ml: 2 }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          navigate('/profile');
        }}>
          <UserIcon sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          navigate('/orders');
        }}>
          <ListAlt sx={{ mr: 1 }} />
          My Orders
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setAnchorEl(null);
          handleLogout();
        }}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Navbar;