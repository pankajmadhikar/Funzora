import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct, discPct } from '../../utils/enrichProduct';
import { toggleWishlist, isInWishlist } from '../../utils/wishlistStorage';
import { ProductImage } from '../ProductThumbnail';

export default function ToyProductCard({ product: raw, compact = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
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
      await apiService.addToCart(product._id, 1);
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

  return (
    <div className="product-card" onClick={goDetail}>
      <div
        className={`product-card-image${compact ? ' compact' : ''}`}
        style={{ background: u.grad }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: compact ? 44 : 56 }}>{u.emoji}</span>
        )}

        <div className="card-badge-row">
          {u.hot && <span className="card-badge card-badge--hot">HOT</span>}
          {u.isNew && !u.hot && <span className="card-badge card-badge--new">NEW</span>}
          {d > 0 && <span className="card-badge card-badge--discount">{d}% OFF</span>}
        </div>

        {u.stock > 0 && u.stock <= 5 && (
          <span
            className="card-badge card-badge--low-stock"
            style={{ position: 'absolute', top: 'var(--space-sm)', right: 42 }}
          >
            Only {u.stock} left
          </span>
        )}

        <button className={`card-wishlist-btn${wish ? ' active' : ''}`} onClick={onWish}>
          {wish ? '❤' : '🤍'}
        </button>
      </div>

      <div className="product-card-body">
        <div className="card-meta">
          <span className="stars">{'★'.repeat(Math.floor(u.rating))}</span>
          <span>{u.rating}</span>
          <span>·</span>
          <span>Age {u.age}</span>
        </div>

        <div className="card-name">{product.name}</div>

        <div className="card-bottom">
          <div className="card-price-block">
            <span className="card-price bb-head">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="card-mrp">{formatPrice(product.mrp)}</span>
            )}
          </div>
          <button
            className="card-add-btn"
            onClick={addCart}
            disabled={adding || u.stock <= 0}
          >
            {u.stock <= 0 ? 'Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
