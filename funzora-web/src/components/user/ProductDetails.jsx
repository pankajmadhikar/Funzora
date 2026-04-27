import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { setCartItems } from '../../store/slices/cartSlice';
import { enrichProduct, enrichProducts, discPct } from '../../utils/enrichProduct';
import { formatPrice } from '../../utils/formatPrice';
import { toggleWishlist, isInWishlist } from '../../utils/wishlistStorage';
import ToyProductCard from '../storefront/ToyProductCard';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wish, setWish] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        setLoading(true);
        const [one, all] = await Promise.all([apiService.getProductById(id), apiService.getProducts()]);
        if (c) return;
        if (one.success && one.data) {
          setProduct(one.data);
          setWish(isInWishlist(one.data._id));
          setError(null);
        } else throw new Error('Product not found');
        setAllProducts(all.data || []);
      } catch (e) {
        if (!c) setError(e.message || 'Failed to load');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => { c = true; };
  }, [id]);

  const ep = useMemo(() => (product ? enrichProduct(product) : null), [product]);
  const related = useMemo(() => {
    if (!ep) return [];
    return enrichProducts(allProducts).filter((p) => p._id !== ep._id && p._ui.displayCatId === ep._ui.displayCatId).slice(0, 4);
  }, [allProducts, ep]);

  const syncCart = async () => {
    const r = await apiService.getCartItems();
    if (r?.data) dispatch(setCartItems(r.data));
    dispatch(setRefreshCartItems());
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setAddingToCart(true);
      await apiService.addToCart(id, quantity);
      await syncCart();
      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to bag`);
    } catch (err) { toast.error(err.message || 'Failed to add'); }
    finally { setAddingToCart(false); }
  };

  const buyNow = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setAddingToCart(true);
      await apiService.addToCart(id, quantity);
      await syncCart();
      navigate('/checkout');
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setAddingToCart(false); }
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <CircularProgress sx={{ color: '#f06292' }} />
      </div>
    );
  }

  if (error || !product || !ep) {
    return (
      <div className="bb-page">
        <div className="empty-state">
          <span className="empty-state-icon">😿</span>
          <span className="empty-state-title">{error || 'Product not found'}</span>
          <button className="btn btn--primary" onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  const u = ep._ui;
  const d = discPct(product.price, product.mrp);
  const stock = u.stock;
  const images = product.images?.length ? product.images : [];

  const prevImg = () => setSelectedImage((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setSelectedImage((i) => (i + 1) % images.length);

  return (
    <div className="pd-page-wrap">
    <div className="pd-page">
      {/* Back link */}
      <Link to="/shop" className="pd-back">
        ← Back to {u.catMeta.label || 'Shop'}
      </Link>

      <div className="pd-layout">
        {/* LEFT: Image Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            {u.hot && <span className="pd-hot-badge">🔥 HOT</span>}
            {u.isNew && <span className="pd-new-badge">✨ NEW</span>}
            {stock > 0 && stock <= 5 && <span className="pd-stock-badge">⚠️ Only {stock} left</span>}

            {images.length > 1 && (
              <button className="pd-nav-arrow pd-nav-left" onClick={prevImg}>‹</button>
            )}

            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} className="pd-main-img" />
            ) : (
              <span className="pd-main-emoji">{u.emoji}</span>
            )}

            {images.length > 1 && (
              <button className="pd-nav-arrow pd-nav-right" onClick={nextImg}>›</button>
            )}
          </div>

          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`pd-thumb${selectedImage === idx ? ' active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="pd-info">
          <span className="pd-cat-tag" style={{ background: u.catMeta.bg, color: u.catMeta.color }}>
            {u.catMeta.icon} {u.catMeta.label}
          </span>

          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <span className="pd-stars">{'★'.repeat(Math.floor(u.rating))}</span>
            <span className="pd-rating-num">{u.rating}</span>
            <span className="pd-reviews">({u.rev} reviews)</span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price bb-head">{formatPrice(product.price * quantity)}</span>
            <span className="pd-mrp">{formatPrice(product.mrp * quantity)}</span>
            {d > 0 && <span className="pd-discount">{d}% OFF</span>}
          </div>

          <div className="pd-attr-row">
            <span className="pd-attr pd-attr--age">👶 Age {u.age}</span>
            <span className="pd-attr pd-attr--stock">✅ In stock</span>
          </div>

          <p className="pd-desc">{product.description}</p>

          {/* Feature box */}
          <div className="pd-feature-box">
            <h3 className="pd-feature-title">Why kids & parents love it?</h3>
            <div className="pd-feature-grid">
              {u.feat.map((f, i) => {
                const icons = ['❤️', '⭐', '🔗', '🎁', '💎', '🧼'];
                return (
                  <div key={f} className="pd-feature-item">
                    <span>{icons[i % icons.length]}</span> {f}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchase controls */}
          {user?.role === 'user' && (
            <div className="pd-purchase">
              <div className="pd-qty-row">
                <span className="pd-qty-label">Quantity:</span>
                <div className="pd-qty-counter">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="pd-btn-group">
                <button
                  className="pd-btn-add"
                  onClick={handleAddToCart}
                  disabled={addingToCart || stock <= 0}
                >
                  🛒 {stock <= 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  className="pd-btn-buy"
                  onClick={buyNow}
                  disabled={addingToCart || stock <= 0}
                >
                  ⚡ Buy Now
                </button>
              </div>

              <button
                className={`pd-btn-wish${wish ? ' on' : ''}`}
                onClick={() => {
                  const on = toggleWishlist(product._id);
                  setWish(on);
                  toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
                }}
              >
                {wish ? '❤ Saved to Wishlist' : '♡ Add to Wishlist'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="pd-related">
          <div className="section-header">
            <h2 className="section-title bb-head">
              You may also <span style={{ color: '#f06292' }}>like</span>
            </h2>
            <Link to="/shop" className="section-view-all">View all →</Link>
          </div>
          <div className="bb-grid bb-grid-4">
            {related.map((p) => <ToyProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default ProductDetails;
