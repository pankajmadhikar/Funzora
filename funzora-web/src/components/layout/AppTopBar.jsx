import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Menu, Search, ShoppingCart, Sparkles } from 'lucide-react';
import { setCartItems } from '../../store/slices/cartSlice';
import { bumpCartRefresh } from '../../store/slices/authSlice';
import { apiService } from '../../services/apiService';
import CartBagDrawer from '../storefront/CartBagDrawer';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';
import { useGuestPhone } from '../../contexts/GuestPhoneContext';
import './AppTopBar.css';

export default function AppTopBar({ onMenuClick, showMenuButton = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, cartTick } = useSelector((s) => s.auth);
  const { phone, ensureGuestPhone } = useGuestPhone();

  const cartPayload = useSelector((s) => s.cart.cartItems);
  const items = cartPayload?.items || [];
  const cartCount = items.reduce((a, i) => a + (i.quantity || 0), 0);

  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const isAdminUser = !!(isAuthenticated && user && user.role === 'admin');

  useEffect(() => {
    if (location.pathname === '/shop') {
      const q = new URLSearchParams(location.search).get('q');
      setSearch(q || '');
    }
  }, [location.pathname, location.search]);

  const refreshCart = useCallback(async () => {
    if (isAdminUser) return;
    const clean = String(phone ?? '').replace(/\D/g, '').slice(-10);
    if (!phone || clean.length !== 10) {
      dispatch(setCartItems({ items: [] }));
      return;
    }
    try {
      const res = await apiService.getCartItems(clean);
      if (res?.data) dispatch(setCartItems(res.data));
    } catch {
      dispatch(setCartItems({ items: [] }));
    }
  }, [dispatch, phone, isAdminUser]);

  useEffect(() => {
    refreshCart();
  }, [phone, cartTick, isAdminUser, refreshCart]);

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

  /** Cart: require WhatsApp identity for guests (no JWT). */
  const openCartAfterIdentity = async () => {
    if (isAdminUser) return;
    try {
      await ensureGuestPhone({ intent: 'cart' });
      setCartOpen(true);
      dispatch(bumpCartRefresh());
    } catch {
      /* modal dismissed */
    }
  };

  return (
    <>
      <header className="fz-header">
        <div className="fz-header-inner">
          {showMenuButton && (
            <button
              type="button"
              className="group fz-header-menu-btn"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu size={ICON_SIZES.lg} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden />
            </button>
          )}

          <Link to={isAdminUser ? '/admin' : '/'} className="fz-header-logo group" onClick={() => setSearch('')}>
            <div className="fz-header-logo-icon">
              <Sparkles size={ICON_SIZES.lg} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-[var(--color-primary)]" aria-hidden />
            </div>
            <div className="fz-header-logo-text">
              <span className="fz-header-logo-name">
                <span className="fz-logo-fun">Fun</span><span className="fz-logo-zora">Zora</span>
              </span>
              <span className="fz-header-logo-tagline">Play. Smile. Grow.</span>
            </div>
          </Link>

          {!isAdminUser && (
            <div className="fz-header-search">
              <span className="fz-header-search-icon" aria-hidden>
                <Search size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="text-neutral-400" />
              </span>
              <input
                type="text"
                placeholder="Search for toys, games, puzzles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onSearchKey}
                onFocus={() => { if (location.pathname !== '/shop') goShop(); }}
                className="fz-header-search-input"
              />
              <button type="button" className="fz-header-search-btn" onClick={onSearchSubmit}>Search</button>
            </div>
          )}

          {!isAdminUser && (
            <div className="fz-header-actions">
              <button type="button" className="group fz-header-action" onClick={() => navigate('/wishlist')}>
                <span className="fz-header-action-icon" aria-hidden>
                  <Heart size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" />
                </span>
                <span className="fz-header-action-label">Wishlist</span>
              </button>
              <button
                type="button"
                className="group fz-header-action fz-header-cart"
                onClick={openCartAfterIdentity}
              >
                <span className="fz-header-action-icon" aria-hidden>
                  <ShoppingCart size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" />
                </span>
                <span className="fz-header-action-label">Cart</span>
                {cartCount > 0 && <span className="fz-header-cart-badge">{cartCount}</span>}
              </button>
            </div>
          )}
        </div>
      </header>

      {!isAdminUser && (
        <CartBagDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}
