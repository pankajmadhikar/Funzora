import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AlertCircle,
  Loader2,
  Lock,
  Package,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { setCartItems } from '../../store/slices/cartSlice';
import { enrichProduct } from '../../utils/enrichProduct';
import { formatPrice } from '../../utils/formatPrice';
import { FREE_SHIP_AT, SHIPPING_FLAT } from '../../config/toyStore';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';

const fontCart = "font-['Inter',var(--font-body),sans-serif]";

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

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

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
      <div className={`flex min-h-[60vh] items-center justify-center ${fontCart}`}>
        <Loader2
          size={36}
          strokeWidth={ICON_STROKE}
          className="animate-spin text-[var(--color-primary)]"
          aria-hidden
        />
        <span className="sr-only">Loading cart</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bb-page ${fontCart}`}>
        <div className="empty-state">
          <AlertCircle
            size={48}
            strokeWidth={ICON_STROKE}
            className="mx-auto text-neutral-400"
            aria-hidden
          />
          <span className="empty-state-title">Something went wrong</span>
          <span className="empty-state-sub">{error}</span>
          <button type="button" className="btn btn--primary" onClick={fetchCartItems}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.data?.items || [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item?.productId?.price || 0) * (item?.quantity || 0),
    0,
  );
  const toFree = Math.max(0, FREE_SHIP_AT - subtotal);
  const ship = subtotal >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const total = subtotal + ship;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={`bb-page ${fontCart}`}>
        <h1 className="text-title bb-head mb-6">Shopping cart</h1>
        <div className="empty-state px-6 py-16">
          <ShoppingCart
            size={56}
            strokeWidth={ICON_STROKE}
            className="mx-auto text-neutral-300"
            aria-hidden
          />
          <span className="empty-state-title">Your bag is empty</span>
          <span className="empty-state-sub text-neutral-500">Browse the shop and add toys you love.</span>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/shop')}>
            Shop now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bb-page ${fontCart}`}>
      <h1 className="text-title bb-head mb-6 flex flex-wrap items-baseline gap-2">
        Shopping cart
        <span className="text-lg font-semibold text-neutral-400">({cartItems.length})</span>
      </h1>

      <div className="cart-page-grid">
        <div className="cart-page-items">
          {cartItems.map((item) => {
            const raw = item.productId;
            if (!raw) return null;
            const ep = enrichProduct(raw);
            const u = ep?._ui;
            return (
              <div key={item._id} className="cart-page-row">
                <div
                  className="cart-page-thumb flex items-center justify-center"
                  style={{
                    background: u?.grad || 'var(--color-bg)',
                  }}
                >
                  {raw.images?.[0] ? (
                    <img
                      src={raw.images[0]}
                      alt={raw.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Package
                      size={ICON_SIZES.lg}
                      strokeWidth={ICON_STROKE}
                      className="text-neutral-400"
                      aria-hidden
                    />
                  )}
                </div>

                <div className="cart-page-info min-w-0">
                  <span className="block truncate text-base font-semibold text-neutral-900">
                    {raw.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-400">
                    Age {u?.age || '3+'} · {u?.catMeta?.label || 'Toy'}
                  </span>
                  <span className="cart-page-price-mobile mt-1 text-lg font-bold text-[var(--color-primary)]">
                    {formatPrice(raw.price * item.quantity)}
                  </span>
                </div>

                <div className="cart-page-qty">
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={updating || item.quantity <= 1}
                    onClick={() => handleUpdateQuantity(item, 'decrease')}
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-bold text-neutral-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={updating}
                    onClick={() => handleUpdateQuantity(item, 'increase')}
                  >
                    +
                  </button>
                </div>

                <span className="cart-page-price text-lg font-bold text-[var(--color-primary)]">
                  {formatPrice(raw.price * item.quantity)}
                </span>

                <button
                  type="button"
                  className="cart-page-delete inline-flex items-center justify-center text-neutral-400 transition hover:text-[var(--color-primary)]"
                  disabled={updating}
                  onClick={() => handleRemoveItem(item)}
                  aria-label="Remove item"
                >
                  <Trash2 size={ICON_SIZES.md} strokeWidth={ICON_STROKE} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary-card">
          <h2 className="bb-head mb-4 text-base text-neutral-900">Order summary</h2>

          <div className="mb-4 space-y-2">
            {cartItems.map((item) => {
              const raw = item.productId;
              if (!raw) return null;
              return (
                <div key={item._id} className="cart-summary-line">
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">{raw.name}</span>
                  <span className="shrink-0 text-sm font-bold text-neutral-900">
                    {formatPrice(raw.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-divider" />

          {subtotal > 0 && toFree > 0 && (
            <div className="shipping-nudge mb-4">
              <div className="mb-2 flex items-start gap-2 text-sm font-medium leading-snug text-neutral-600">
                <Truck size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden />
                <span>
                  Add <strong className="font-semibold text-[var(--color-primary)]">{formatPrice(toFree)}</strong> more for{' '}
                  <span className="font-semibold text-[var(--color-primary)]">FREE</span> shipping
                </span>
              </div>
              <div className="shipping-nudge-bar">
                <div
                  className="shipping-nudge-fill"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_AT) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="cart-summary-line">
            <span className="text-sm text-neutral-600">Subtotal</span>
            <span className="text-sm font-bold text-neutral-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-line">
            <span className="text-sm text-neutral-600">Shipping</span>
            <span
              className={`text-sm font-bold ${ship === 0 ? 'text-[var(--color-primary)]' : 'text-neutral-900'}`}
            >
              {ship === 0 ? 'FREE' : formatPrice(ship)}
            </span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-summary-line mb-6">
            <span className="bb-head text-lg text-neutral-900">Total</span>
            <span className="bb-head text-lg font-bold text-[var(--color-primary)]">{formatPrice(total)}</span>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--full cart-checkout-btn rounded-xl font-semibold disabled:opacity-50"
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </button>

          <div className="cart-trust-line mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} strokeWidth={ICON_STROKE} className="shrink-0" aria-hidden />
              Secure checkout
            </span>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RotateCcw size={14} strokeWidth={ICON_STROKE} className="shrink-0" aria-hidden />
              7-day returns
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
