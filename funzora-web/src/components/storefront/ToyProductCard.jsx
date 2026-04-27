import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Eye, Flame, Heart, Package, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct, discPct } from '../../utils/enrichProduct';
import { toggleWishlist, isInWishlist } from '../../utils/wishlistStorage';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';

export default function ToyProductCard({ product: raw, compact = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(() => isInWishlist(raw?._id));

  const product = enrichProduct(raw);
  if (!product) return null;
  const u = product._ui;
  const d = discPct(product.price, product.mrp);

  const goDetail = () => navigate(`/product/${product._id}`);

  const addCart = async (e) => {
    e?.stopPropagation();
    if (adding || u.stock <= 0) return;
    try {
      setAdding(true);
      await apiService.addToCart(product._id, qty);
      const cartResponse = await apiService.getCartItems();
      if (cartResponse?.data) dispatch(setCartItems(cartResponse.data));
      dispatch(setRefreshCartItems());
      toast.success(`${product.name} added!`);
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

  const changeQty = (delta, e) => {
    e.stopPropagation();
    setQty((q) => Math.max(1, Math.min(q + delta, u.stock || 99)));
  };

  const spec = product.specification || '';
  const sizeMatch = spec.match(/Size:\s*([^|]+)/i);
  const matMatch = spec.match(/Material:\s*([^|]+)/i);
  const sizeText = sizeMatch ? sizeMatch[1].trim() : null;
  const matText = matMatch ? matMatch[1].trim() : 'Plush';

  const badgeLabel = u.hot ? 'Bestseller' : u.isNew ? 'New' : null;
  const BadgeIcon = u.hot ? Flame : Sparkles;

  return (
    <div className="pc2" onClick={goDetail}>
      <div className={`pc2-img${compact ? ' pc2-img--sm' : ''}`}>
        <div className="pc2-overlay-top">
          <div className="pc2-badges">
            {d > 0 && <span className="pc2-tag pc2-tag--disc">-{d}%</span>}
            {badgeLabel && (
              <span className={`pc2-tag pc2-tag-with-icon ${u.hot ? 'pc2-tag--best' : 'pc2-tag--new'}`}>
                <BadgeIcon size={12} strokeWidth={ICON_STROKE} className="pc2-tag-icon" aria-hidden />
                {badgeLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            className={`pc2-heart group${wish ? ' on' : ''}`}
            onClick={onWish}
            aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={ICON_SIZES.md}
              strokeWidth={wish ? 2.35 : ICON_STROKE}
              className={wish ? 'text-orange-500' : 'text-neutral-400 transition-colors group-hover:text-neutral-600'}
            />
          </button>
        </div>

        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="pc2-product-img" />
        ) : (
          <span className="pc2-emoji-fallback" aria-hidden>
            <Package size={compact ? 40 : 48} strokeWidth={ICON_STROKE} className="text-neutral-300" />
          </span>
        )}
      </div>

      <div className="pc2-body">
        <div className="pc2-rating-row">
          <span className="pc2-stars pc2-stars--with-icon">
            <Star size={14} strokeWidth={ICON_STROKE} className="pc2-star-icon text-neutral-400" aria-hidden />
            {u.rating} <span className="pc2-rev">({u.rev})</span>
          </span>
          <span className="pc2-age">Age: {u.age}</span>
        </div>

        <h3 className="pc2-name">{product.name}</h3>

        <div className="pc2-specs">
          {sizeText && <><span>Size: {sizeText}</span><span className="pc2-dot">•</span></>}
          <span>Material: {matText}</span>
        </div>

        <div className="pc2-price-row">
          <span className="pc2-price bb-head">{formatPrice(product.price)}</span>
          {product.mrp > product.price && <span className="pc2-mrp">{formatPrice(product.mrp)}</span>}
          <span className="pc2-price-icons" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pc2-mini-icon group" onClick={onWish} title="Wishlist" aria-label="Wishlist">
              <Heart size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" />
            </button>
            <button type="button" className="pc2-mini-icon group" onClick={addCart} title="Add to cart" aria-label="Add to cart">
              <ShoppingCart size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" />
            </button>
          </span>
        </div>

        <div className="pc2-action-row">
          <div className="pc2-qty" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pc2-qty-btn" onClick={(e) => changeQty(-1, e)} disabled={qty <= 1}>−</button>
            <span className="pc2-qty-val">{qty}</span>
            <button type="button" className="pc2-qty-btn" onClick={(e) => changeQty(1, e)}>+</button>
          </div>
          <button type="button" className="pc2-add-btn" onClick={addCart} disabled={adding || u.stock <= 0}>
            {u.stock <= 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="pc2-footer group" onClick={(e) => { e.stopPropagation(); goDetail(); }}>
        <Eye size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} className="text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden />
        <span>Quick View</span>
      </div>
    </div>
  );
}
