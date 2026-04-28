import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { enrichProducts } from '../../utils/enrichProduct';
import { getWishlistIds } from '../../utils/wishlistStorage';
import ToyProductCard from './ToyProductCard';

export default function WishlistPage() {
  const [allProducts, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getProducts();
        setAll(res.data || []);
      } catch { /* empty */ }
      finally { setLoading(false); }
    })();
  }, []);

  const ids = getWishlistIds();
  const enriched = enrichProducts(allProducts.filter((p) => ids.has(String(p._id))));

  if (loading) {
    return (
      <div className="bb-page" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl) 0' }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="bb-page">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="section-title inline-flex items-center gap-2 text-[22px] sm:text-[24px]">
          <Heart size={22} strokeWidth={2} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
          Wishlist
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)', fontWeight: 600 }}>
          {enriched.length} saved toy{enriched.length !== 1 ? 's' : ''}
        </p>
      </div>

      {enriched.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
          <div style={{ fontSize: 56, color: 'var(--color-border)', marginBottom: 'var(--space-md)' }}>🤍</div>
          <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)', fontSize: 'var(--font-size-sm)' }}>
            Browse the shop and save toys you love.
          </p>
          <Link to="/shop" className="btn btn--primary">Browse shop →</Link>
        </div>
      ) : (
        <div className="bb-grid bb-grid-4">
          {enriched.map((p) => <ToyProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
