import React, { useState, useEffect, useCallback } from 'react';
import { Menu, MenuItem, Divider, Badge } from '@mui/material';
import { PersonRounded, LogoutRounded, ListAltRounded } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { setCartItems } from '../../store/slices/cartSlice';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import CartBagDrawer from '../storefront/CartBagDrawer';
import './AppTopBar.css';

const ANNOUNCEMENTS = [
  { icon: '🏷️', text: 'Up to 60% off MRP' },
  { icon: '🎁', text: 'All toys under ₹100' },
  { icon: '🚚', text: 'Free shipping above ₹199' },
  { icon: '⭐', text: '4.8 rated by families' },
  { icon: '🔄', text: '7-day easy returns' },
  { icon: '🇮🇳', text: 'Pan India delivery' },
];

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

  const onSearchSubmit = (e) => {
    e?.preventDefault();
    const v = search.trim();
    if (v) goShop({ q: v }); else goShop();
  };

  const onSearchKey = (e) => {
    if (e.key === 'Enter') onSearchSubmit();
  };

  if (!isAuthenticated || !isValidUser) return null;

  return (
    <>
      <header className="fz-header">
        <div className="fz-header-inner">
          {/* Mobile menu button */}
          {showMenuButton && (
            <button className="fz-header-menu-btn" onClick={onMenuClick} aria-label="Open menu">
              <span /><span /><span />
            </button>
          )}

          {/* Logo */}
          <Link to={userRole === 'admin' ? '/admin' : '/'} className="fz-header-logo" onClick={() => setSearch('')}>
            <div className="fz-header-logo-icon">🧸</div>
            <div className="fz-header-logo-text">
              <span className="fz-header-logo-name">
                <span className="fz-logo-fun">Fun</span><span className="fz-logo-zora">Zora</span>
              </span>
              <span className="fz-header-logo-tagline">Play. Smile. Grow.</span>
            </div>
          </Link>

          {/* Search */}
          {userRole !== 'admin' && (
            <div className="fz-header-search">
              <span className="fz-header-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for toys, games, puzzles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onSearchKey}
                onFocus={() => { if (location.pathname !== '/shop') goShop(); }}
                className="fz-header-search-input"
              />
              <button className="fz-header-search-btn" onClick={onSearchSubmit}>Search</button>
            </div>
          )}

          {/* Actions */}
          <div className="fz-header-actions">
            {userRole !== 'admin' && (
              <button className="fz-header-action" onClick={() => navigate('/wishlist')}>
                <span className="fz-header-action-icon">🤍</span>
                <span className="fz-header-action-label">Wishlist</span>
              </button>
            )}

            <button className="fz-header-action" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <span className="fz-header-action-icon">👤</span>
              <span className="fz-header-action-label">Account</span>
            </button>

            {userRole !== 'admin' && (
              <button className="fz-header-action fz-header-cart" onClick={() => setCartOpen(true)}>
                <span className="fz-header-action-icon">🛒</span>
                <span className="fz-header-action-label">Cart</span>
                {cartCount > 0 && <span className="fz-header-cart-badge">{cartCount}</span>}
              </button>
            )}
          </div>
        </div>

        {/* Announcement bar */}
        {userRole !== 'admin' && (
          <div className="fz-announcement-bar">
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={i} className="fz-announcement-item">
                <span>{a.icon}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      <CartBagDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', mt: 1, minWidth: 180 } }}
      >
        {isValidUser && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>{user.firstname || user.name || 'User'}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{user.email || ''}</div>
          </div>
        )}
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}>
          <PersonRounded sx={{ mr: 1.25, fontSize: 18, color: '#888' }} /> Profile
        </MenuItem>
        {userRole !== 'admin' && (
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}>
            <ListAltRounded sx={{ mr: 1.25, fontSize: 18, color: '#888' }} /> My orders
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ fontSize: 14, fontWeight: 600, py: 1.25, color: '#EF4444' }}>
          <LogoutRounded sx={{ mr: 1.25, fontSize: 18 }} /> Logout
        </MenuItem>
      </Menu>
    </>
  );
}
