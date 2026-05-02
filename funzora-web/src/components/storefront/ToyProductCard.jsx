import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Heart, Package, Star } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { bumpCartRefresh } from '../../store/slices/authSlice';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct, discPct } from '../../utils/enrichProduct';
import { toggleWishlist, isInWishlist } from '../../utils/wishlistStorage';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';
import { createWhatsAppCheckoutLink, resolveProductPageUrl } from '../../utils/whatsappCheckout';
import { useGuestPhone } from '../../contexts/GuestPhoneContext';

const fontCard = "font-['Inter',var(--font-body),sans-serif]";

function selectCartLines(state) {
  const payload = state.cart?.cartItems;
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items ?? [];
}

export default function ToyProductCard({ product: raw, compact = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { phone, ensureGuestPhone } = useGuestPhone();
  const cartLines = useSelector(selectCartLines);
  const [adding, setAdding] = useState(false);
  const [updatingQty, setUpdatingQty] = useState(false);
  const [wish, setWish] = useState(() => isInWishlist(raw?._id));

  const product = enrichProduct(raw);
  if (!product) return null;
  const u = product._ui;
  const d = discPct(product.price, product.mrp);

  const cartQty = useMemo(() => {
    const line = cartLines.find((item) => {
      const pid = item.productId?._id ?? item.productId;
      return pid === product._id;
    });
    return line?.quantity ?? 0;
  }, [cartLines, product._id]);

  const inCart = cartQty > 0;

  const goDetail = () => navigate(`/product/${product._id}`);

  const refreshCart = async (digits) => {
    const clean = String(digits || '').replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      dispatch(setCartItems({ items: [] }));
      dispatch(bumpCartRefresh());
      return;
    }
    const cartResponse = await apiService.getCartItems(clean);
    if (cartResponse?.data) dispatch(setCartItems(cartResponse.data));
    dispatch(bumpCartRefresh());
  };

  const addCart = async (e) => {
    e?.stopPropagation();
    if (adding || u.stock <= 0) return;
    let digits;
    try {
      digits = await ensureGuestPhone({ intent: 'generic' });
    } catch {
      return;
    }
    try {
      setAdding(true);
      await apiService.addToCart(digits, product._id, 1);
      await refreshCart(digits);
      toast.success(`${product.name} added`);
    } catch (err) {
      toast.error(err.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const onWish = (e) => {
    e.stopPropagation();
    const on = toggleWishlist(product._id);
    setWish(on);
    toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const changeCartQty = async (delta, e) => {
    e.stopPropagation();
    if (updatingQty) return;
    let digits = String(phone || '').replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
      try {
        digits = await ensureGuestPhone({ intent: 'generic' });
      } catch {
        return;
      }
    }
    try {
      setUpdatingQty(true);
      if (delta < 0) {
        if (cartQty <= 1) {
          await apiService.removeCartItem(digits, product._id);
        } else {
          await apiService.updateCartItem(digits, product._id, 'decrease');
        }
      } else {
        await apiService.updateCartItem(digits, product._id, 'increase');
      }
      await refreshCart(digits);
    } catch (err) {
      toast.error(err.message || 'Could not update cart');
    } finally {
      setUpdatingQty(false);
    }
  };

  const badgeLabel = u.hot ? 'Bestseller' : u.isNew ? 'New' : null;
  const imgH = compact ? 'h-[170px]' : 'h-[220px]';
  const pkgSize = compact ? 40 : 48;

  const primaryCls = 'text-[var(--color-primary)]';
  const primaryBg = 'bg-[var(--color-primary)]';
  const waLink = createWhatsAppCheckoutLink({
    cartItems: [
      {
        name: product.name,
        quantity: 1,
        price: Number(product.price) || 0,
        productUrl: resolveProductPageUrl(product._id),
        emoji: u.emoji,
      },
    ],
    grandTotal: Number(product.price) || 0,
  });

  return (
    <div
      className={`group/pc flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${fontCard}`}
      onClick={goDetail}
    >
      <div className={`relative overflow-hidden bg-neutral-50 ${imgH}`}>
        <div className="absolute left-2.5 right-2.5 top-2.5 z-[4] flex items-start gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {d > 0 && (
              <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-primary)]">
                -{d}%
              </span>
            )}
            {badgeLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-neutral-600"
                style={{ background: 'color-mix(in srgb, var(--color-border) 40%, white)' }}
              >
                {badgeLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            className="group/h ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm transition hover:border-neutral-300"
            style={
              wish
                ? {
                    borderColor: 'color-mix(in srgb, var(--color-primary) 40%, #e7e5e4)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, white)',
                  }
                : undefined
            }
            onClick={onWish}
            aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={ICON_SIZES.lg}
              strokeWidth={ICON_STROKE}
              className={
                wish
                  ? primaryCls
                  : 'text-gray-400 transition-colors group-hover/h:text-gray-600'
              }
            />
          </button>
        </div>

        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <Package size={pkgSize} strokeWidth={ICON_STROKE} className="text-neutral-300" />
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-2">
        <h3 className="line-clamp-2 text-base font-medium leading-snug text-gray-900 text-sm font-medium">{product.name}</h3>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-gray-400">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Star size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="shrink-0 text-gray-400" aria-hidden />
            <span className="truncate">
              {u.rating}
              <span className="font-normal"> ({u.rev})</span>
            </span>
          </span>
          <span className="shrink-0">Age {u.age}</span>
        </div>

        {(product.isBestForGifting || product.productLayer === 'bundle') && (
          <div style={{ marginTop: 6 }}>
            <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
              Best for gifting
            </span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className={`text-lg ${primaryCls} text-sm font-medium`}>{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-sm font-medium text-gray-300 line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>

        <div className="mt-3 flex flex-1 flex-col justify-end" onClick={(e) => e.stopPropagation()}>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="mb-2 w-full rounded-xl border border-[var(--color-primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]"
          >
            Buy on WhatsApp
          </a>
          {!inCart ? (
            <button
              type="button"
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-45 ${primaryBg}`}
              onClick={addCart}
              disabled={adding || u.stock <= 0}
            >
              {u.stock <= 0 ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          ) : (
            <div
              className="inline-flex h-9 max-w-[11rem] items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white self-center"
              role="group"
              aria-label="Quantity in cart"
            >
              <button
                type="button"
                className="px-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 "
                onClick={(e) => changeCartQty(-1, e)}
                disabled={updatingQty}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="flex min-w-[2rem] items-center justify-center border-x border-gray-200 text-xs font-bold text-gray-800">
                {updatingQty ? '…' : cartQty}
              </span>
              <button
                type="button"
                className="px-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
                onClick={(e) => changeCartQty(1, e)}
                disabled={updatingQty || cartQty >= (u.stock || 99)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* <button
        type="button"
        className="group/qv flex w-full items-center justify-center gap-1.5 border-t border-neutral-100 bg-neutral-50/80 px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-neutral-100 hover:text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          goDetail();
        }}
      >
        <Eye size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="shrink-0" aria-hidden />
        Quick view
      </button> */}
    </div>
  );
}
