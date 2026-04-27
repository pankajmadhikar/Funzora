import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { setCartItems } from '../../store/slices/cartSlice';
import { enrichProduct } from '../../utils/enrichProduct';
import { formatPrice } from '../../utils/formatPrice';
import { FREE_SHIP_AT, SHIPPING_FLAT } from '../../config/toyStore';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const cartResponse = await apiService.getCartItems();
      if (cartResponse?.data) dispatch(setCartItems(cartResponse.data));
      setCartData(cartResponse);
      setError(null);
    } catch (err) {
      dispatch(setCartItems({ items: [] }));
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchCartItems(); }, [fetchCartItems]);

  const handleUpdateQuantity = async (item, action) => {
    try {
      setUpdating(true);
      await apiService.updateCartItem(item.productId._id, action);
      await fetchCartItems();
      toast.success('Cart updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      setUpdating(true);
      await apiService.removeCartItem(item?.productId?._id);
      await fetchCartItems();
      toast.success('Item removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bb-page">
        <div className="empty-state">
          <span className="empty-state-icon">⚠️</span>
          <span className="empty-state-title">Something went wrong</span>
          <span className="empty-state-sub">{error}</span>
          <button className="btn btn--primary" onClick={fetchCartItems}>Try again</button>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.data?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item?.productId?.price || 0) * (item?.quantity || 0), 0);
  const toFree = Math.max(0, FREE_SHIP_AT - subtotal);
  const ship = subtotal >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const total = subtotal + ship;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bb-page">
        <h1 className="text-title bb-head" style={{ marginBottom: 'var(--space-xl)' }}>Shopping Cart</h1>
        <div className="empty-state" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
          <span style={{ fontSize: 64 }}>🛒</span>
          <span className="empty-state-title">Your bag is empty</span>
          <span className="empty-state-sub">Explore toys under ₹100</span>
          <button className="btn btn--primary" onClick={() => navigate('/shop')}>Shop now →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bb-page">
      <h1 className="text-title bb-head" style={{ marginBottom: 'var(--space-xl)' }}>
        Shopping Cart <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>({cartItems.length})</span>
      </h1>

      <div className="cart-page-grid">
        {/* Left: Cart items */}
        <div className="cart-page-items">
          {cartItems.map((item) => {
            const raw = item.productId;
            if (!raw) return null;
            const ep = enrichProduct(raw);
            const u = ep?._ui;
            return (
              <div key={item._id} className="cart-page-row">
                <div className="cart-page-thumb" style={{ background: u?.grad || 'var(--color-bg)' }}>
                  {raw.images?.[0] ? (
                    <img src={raw.images[0]} alt={raw.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{u?.emoji || '🎁'}</span>
                  )}
                </div>

                <div className="cart-page-info">
                  <span className="text-heading" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {raw.name}
                  </span>
                  <span className="text-label" style={{ marginTop: 2 }}>
                    Age {u?.age || '3+'} · {u?.catMeta?.label || 'Toy'}
                  </span>
                  {/* Mobile price */}
                  <span className="cart-page-price-mobile text-price" style={{ marginTop: 4 }}>
                    {formatPrice(raw.price * item.quantity)}
                  </span>
                </div>

                <div className="cart-page-qty">
                  <button
                    className="qty-btn"
                    disabled={updating || item.quantity <= 1}
                    onClick={() => handleUpdateQuantity(item, 'decrease')}
                  >−</button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center', fontSize: 'var(--font-size-base)' }}>
                    {item.quantity}
                  </span>
                  <button
                    className="qty-btn"
                    disabled={updating}
                    onClick={() => handleUpdateQuantity(item, 'increase')}
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >+</button>
                </div>

                <span className="cart-page-price text-price">
                  {formatPrice(raw.price * item.quantity)}
                </span>

                <button
                  className="cart-page-delete"
                  disabled={updating}
                  onClick={() => handleRemoveItem(item)}
                >🗑</button>
              </div>
            );
          })}
        </div>

        {/* Right: Order summary */}
        <div className="cart-summary-card">
          <h2 className="bb-head" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-lg)' }}>
            Order Summary
          </h2>

          {/* Item lines */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            {cartItems.map((item) => {
              const raw = item.productId;
              if (!raw) return null;
              const ep = enrichProduct(raw);
              return (
                <div key={item._id} className="cart-summary-line">
                  <span className="text-body" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ep?._ui?.emoji} {raw.name}
                  </span>
                  <span style={{ fontWeight: 800, flexShrink: 0 }}>{formatPrice(raw.price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-divider" />

          {/* Shipping nudge */}
          {subtotal > 0 && toFree > 0 && (
            <div className="shipping-nudge">
              <div className="shipping-nudge-text">🚚 Add {formatPrice(toFree)} more for FREE shipping!</div>
              <div className="shipping-nudge-bar">
                <div className="shipping-nudge-fill" style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_AT) * 100)}%` }} />
              </div>
            </div>
          )}

          <div className="cart-summary-line">
            <span className="text-body">Subtotal</span>
            <span style={{ fontWeight: 800 }}>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-line">
            <span className="text-body">Shipping</span>
            <span style={{ fontWeight: 800, color: ship === 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
              {ship === 0 ? 'FREE' : formatPrice(ship)}
            </span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-summary-line" style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>Total</span>
            <span className="bb-head text-price" style={{ fontSize: 'var(--font-size-lg)' }}>{formatPrice(total)}</span>
          </div>

          <button
            className="btn btn--primary btn--full cart-checkout-btn"
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <div className="cart-trust-line">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>🔄 7-day returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
