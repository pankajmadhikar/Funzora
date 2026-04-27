import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, InputBase, Menu, MenuItem, Divider, Badge } from '@mui/material';
import {
  MenuRounded,
  PersonRounded,
  LogoutRounded,
  ShoppingBagRounded,
  ListAltRounded,
  SearchRounded,
  CloseRounded,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { setCartItems } from '../../store/slices/cartSlice';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import CartBagDrawer from '../storefront/CartBagDrawer';

export default function AppTopBar({ onMenuClick, showMenuButton = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, cartItemRefresher } = useSelector((s) => s.auth);
  const cartPayload = useSelector((s) => s.cart.cartItems);
  const items = cartPayload?.items || [];
  const cartCount = items.reduce((a, i) => a + (i.quantity || 0), 0);

  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isValidUser = user && typeof user === 'object';
  const userRole = isValidUser ? user.role || 'user' : 'user';

  useEffect(() => {
    if (location.pathname === '/shop') {
      const q = new URLSearchParams(location.search).get('q');
      setSearch(q || '');
    }
  }, [location.pathname, location.search]);

  const refreshCart = useCallback(async () => {
    try {
      const res = await apiService.getCartItems();
      if (res?.data) dispatch(setCartItems(res.data));
    } catch {
      dispatch(setCartItems({ items: [] }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && userRole !== 'admin') refreshCart();
  }, [isAuthenticated, userRole, cartItemRefresher, refreshCart]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
    setAnchorEl(null);
  };

  const goShop = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    navigate(q ? `/shop?${q}` : '/shop');
  };

  const onSearchKey = (e) => {
    if (e.key === 'Enter') {
      const v = search.trim();
      if (v) goShop({ q: v });
      else goShop();
    }
  };

  if (!isAuthenticated || !isValidUser) return null;

  return (
    <>
      <Box
        component="header"
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #E8EAED',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            maxWidth: 'var(--bb-content-max, 1280px)',
            mx: 'auto',
            width: '100%',
            minHeight: 56,
            px: 'var(--bb-gutter, 16px)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            py: 1,
          }}
        >
          {showMenuButton && (
            <IconButton onClick={onMenuClick} edge="start" sx={{ color: '#6B7280', mr: 0.25 }} aria-label="Open menu">
              <MenuRounded />
            </IconButton>
          )}

          <Box
            component={Link}
            to={userRole === 'admin' ? '/admin' : '/'}
            onClick={() => setSearch('')}
            sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg,#FF6B35,#FFD23F)',
                borderRadius: '12px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              🎁
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography className="bb-head" sx={{ fontSize: 17, color: '#1A1A2E', lineHeight: 1.1 }}>
                <Box component="span" sx={{ color: '#FF6B35' }}>Funzo</Box>
                {userRole === 'admin' ? 'Admin' : 'Toys'}
              </Typography>
            </Box>
          </Box>

          {userRole !== 'admin' && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                maxWidth: { xs: 'none', md: 480 },
                mx: { xs: 0, md: 'auto' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <SearchRounded
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 20,
                    color: '#9CA3AF',
                    pointerEvents: 'none',
                  }}
                />
                <InputBase
                  placeholder="Search toys, games, puzzles…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={onSearchKey}
                  onFocus={() => {
                    if (location.pathname !== '/shop') goShop();
                  }}
                  sx={{
                    width: '100%',
                    pl: 5.75,
                    pr: search ? 4.5 : 2.5,
                    py: 1.125,
                    border: '1px solid #E5E7EB',
                    borderRadius: '999px',
                    bgcolor: '#F9FAFB',
                    fontSize: 14,
                    color: '#1A1A2E',
                    fontWeight: 600,
                    transition: 'border-color 0.2s, background-color 0.2s',
                    '&.Mui-focused': { borderColor: '#FF6B35', bgcolor: '#fff', boxShadow: '0 0 0 3px rgba(255,107,53,0.12)' },
                  }}
                />
                {search && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch('');
                      goShop();
                    }}
                    sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
                    aria-label="Clear search"
                  >
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
          {userRole !== 'admin' && (
            <IconButton
              onClick={() => setCartOpen(true)}
              sx={{
                bgcolor: '#FFF0EB',
                borderRadius: '12px',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#FFE0D3' },
              }}
            >
              <Badge
                badgeContent={cartCount}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#FF6B35',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 10,
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ShoppingBagRounded sx={{ fontSize: 20, color: '#FF6B35' }} />
              </Badge>
            </IconButton>
          )}

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
            aria-label="Account menu"
          >
            <PersonRounded sx={{ fontSize: 20, color: '#6B7280' }} />
          </IconButton>
        </Box>
        </Box>
      </Box>

      <CartBagDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', mt: 1, minWidth: 180 },
        }}
      >
        {isValidUser && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F0F0F0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1A1A2E' }}>
              {user.name || 'User'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>{user.email || ''}</Typography>
          </Box>
        )}
        <MenuItem
          onClick={() => { setAnchorEl(null); navigate('/profile'); }}
          sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}
        >
          <PersonRounded sx={{ mr: 1.25, fontSize: 18, color: '#6B7280' }} />
          Profile
        </MenuItem>
        {userRole !== 'admin' && (
          <MenuItem
            onClick={() => { setAnchorEl(null); navigate('/profile'); }}
            sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}
          >
            <ListAltRounded sx={{ mr: 1.25, fontSize: 18, color: '#6B7280' }} />
            My orders
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ fontSize: 14, fontWeight: 600, py: 1.25, color: '#EF4444' }}>
          <LogoutRounded sx={{ mr: 1.25, fontSize: 18 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
