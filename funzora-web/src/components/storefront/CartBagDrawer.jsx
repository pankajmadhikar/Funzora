import React, { useEffect, useCallback, useState } from 'react';
import { Drawer, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct } from '../../utils/enrichProduct';
import { FREE_SHIP_AT, SHIPPING_FLAT } from '../../config/toyStore';

export default function CartBagDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartPayload = useSelector((s) => s.cart.cartItems);
  const items = cartPayload?.items || [];
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getCartItems();
      if (res?.data) dispatch(setCartItems(res.data));
    } catch {
      dispatch(setCartItems({ items: [] }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const cartCount = items.reduce((a, i) => a + (i.quantity || 0), 0);
  const cartSub = items.reduce((a, i) => {
    const p = i.productId?.price ?? 0;
    return a + p * (i.quantity || 0);
  }, 0);
  const toFree = Math.max(0, FREE_SHIP_AT - cartSub);
  const ship = cartSub >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const total = cartSub + ship;

  const updQty = async (item, action) => {
    const pid = item.productId?._id;
    if (!pid) return;
    try {
      setBusy(true);
      await apiService.updateCartItem(pid, action);
      await refresh();
      toast.success('Cart updated');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    const pid = item.productId?._id;
    if (!pid) return;
    try {
      setBusy(true);
      await apiService.removeCartItem(pid);
      await refresh();
      toast.success('Removed');
    } catch (e) {
      toast.error(e.message || 'Remove failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,46,0.45)',
          zIndex: 499,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          backdropFilter: 'blur(2px)',
        }}
      />
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
          },
        }}
        ModalProps={{ keepMounted: true }}
        sx={{ zIndex: 500 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            padding: 'var(--space-lg) var(--space-xl)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
              🛒 My Bag <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>({cartCount})</span>
            </span>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {/* Shipping progress */}
          {cartSub > 0 && toFree > 0 && (
            <div className="shipping-progress-bar" style={{ margin: 'var(--space-md) var(--space-xl)' }}>
              <div className="shipping-progress-text">🚚 Add {formatPrice(toFree)} more for FREE shipping!</div>
              <div className="shipping-progress-track">
                <div
                  className="shipping-progress-fill"
                  style={{ width: `${Math.min(100, (cartSub / FREE_SHIP_AT) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {cartSub >= FREE_SHIP_AT && cartSub > 0 && (
            <div style={{
              padding: 'var(--space-md) var(--space-xl)',
              background: '#EAFAF1',
              borderBottom: '1px solid #D5F5E3',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 700,
              color: 'var(--color-success)',
            }}>
              ✅ You've unlocked FREE shipping!
            </div>
          )}

          {/* Items */}
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={32} sx={{ color: 'var(--color-primary)' }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', padding: 'var(--space-xl)' }}>
              <span style={{ fontSize: 64 }}>🧸</span>
              <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                Your bag is empty!
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Explore amazing toys — add from the shop.
              </span>
              <button
                className="btn btn--primary"
                onClick={() => { onClose(); navigate('/shop'); }}
                style={{ marginTop: 'var(--space-sm)' }}
              >
                Shop now 🎁
              </button>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md) var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {items.map((item) => {
                  const raw = item.productId;
                  if (!raw) return null;
                  const ep = enrichProduct(raw);
                  const u = ep?._ui;
                  return (
                    <div key={item._id || raw._id} className="cart-item">
                      <div className="cart-item-thumb" style={{ background: u?.grad || 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {raw.images?.[0] ? (
                          <img src={raw.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 28 }}>{u?.emoji || '🎁'}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                        <span className="cart-item-name">{raw.name}</span>
                        <span className="cart-item-price">{formatPrice(raw.price)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                          <button
                            className="qty-btn"
                            disabled={busy || item.quantity <= 1}
                            onClick={() => updQty(item, 'decrease')}
                          >
                            −
                          </button>
                          <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center', fontSize: 'var(--font-size-base)' }}>{item.quantity}</span>
                          <button
                            className="qty-btn"
                            disabled={busy}
                            onClick={() => updQty(item, 'increase')}
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() => remove(item)}
                        style={{ color: 'var(--color-text-muted)', fontSize: 16, padding: 'var(--space-xs)', cursor: 'pointer', background: 'none', border: 'none' }}
                        onMouseEnter={(e) => { e.target.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted)'; }}
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: 'var(--space-lg) var(--space-xl)',
                borderTop: '1px solid var(--color-border)',
                flexShrink: 0,
                background: '#fff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{formatPrice(cartSub)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 800, color: ship === 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                    {ship === 0 ? 'FREE' : formatPrice(ship)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '2px dashed var(--color-border)',
                  paddingTop: 'var(--space-md)',
                  marginTop: 'var(--space-sm)',
                  marginBottom: 'var(--space-md)',
                }}>
                  <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>Total</span>
                  <span className="bb-head" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-primary)' }}>{formatPrice(total)}</span>
                </div>
                <button
                  className="btn btn--primary btn--full btn--lg"
                  disabled={busy}
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-sm)' }}
                >
                  Checkout →
                </button>
                <button
                  className="btn btn--ghost btn--full"
                  onClick={onClose}
                >
                  Continue shopping
                </button>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}
