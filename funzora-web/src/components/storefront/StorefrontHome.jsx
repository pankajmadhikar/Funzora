import React, { useEffect, useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Flame, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { enrichProducts } from '../../utils/enrichProduct';
import ToyProductCard from './ToyProductCard';
import HeroSection from './HeroSection';
import ReviewSection from './ReviewSection';

export default function StorefrontHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await apiService.getProducts();
        if (!c) setProducts(res.data || []);
      } catch (e) {
        if (!c) toast.error(e.message || 'Could not load products');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => { c = true; };
  }, []);

  const enriched = useMemo(() => enrichProducts(products), [products]);

  const featured = useMemo(() => enriched.filter((p) => p._ui.hot || p._ui.isNew).slice(0, 8), [enriched]);
  const under50 = useMemo(() => enriched.filter((p) => p.price <= 50).slice(0, 6), [enriched]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 14 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <div>
      {/* ── Hero Banner ── */}
      <HeroSection />

      <div className="bb-page">
        <div className="bb-section" style={{ paddingBottom: 'var(--space-lg)' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by age</h2>
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Decide faster with age-first picks.</p>
            </div>
            <Link to="/gift-finder" className="btn btn--primary btn--sm">Gift finder →</Link>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {['0-2', '3-5', '6-8', '9-12', '13+'].map((age) => (
              <button
                key={age}
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate(`/shop?age=${encodeURIComponent(age)}`)}
              >
                {age} years
              </button>
            ))}
          </div>
        </div>

        {/* ── Hot & new ── */}
        <div className="bb-section">
          <div className="section-header">
            <div>
              <h2 className="section-title inline-flex items-center gap-2">
                <Flame
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--color-primary)]"
                  aria-hidden
                />
                <span>Hot & new</span>
              </h2>
            </div>
            <Link to="/shop" className="section-view-all">All toys →</Link>
          </div>
          <div className="bb-grid bb-grid-4">
            {(featured.length > 0 ? featured : enriched.slice(0, 8)).map((p) => (
              <ToyProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>

        {/* ── Under ₹50 ── */}
        {under50.length > 0 && (
          <div
            className="bb-section rounded-[var(--radius-xl)] bg-neutral-50/90 p-[var(--space-xl)] ring-1 ring-neutral-100"
          >
            <div className="section-header">
              <div>
                <span
                  className="hero-badge mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <Tag size={14} strokeWidth={2} className="shrink-0 opacity-95" aria-hidden />
                  Best value
                </span>
                <h2 className="section-title">
                  Under <span className="text-[var(--color-primary)]">₹50</span> zone
                </h2>
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/shop?sort=low')}>
                See all →
              </button>
            </div>
            <div className="bb-grid bb-grid-5">
              {under50.map((p) => <ToyProductCard key={p._id} product={p} compact />)}
            </div>
          </div>
        )}

        <div className="bb-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Best for gifting</h2>
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Bundle-ready picks parents can trust.</p>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/shop?gifting=1')}>
              View all →
            </button>
          </div>
          <div className="bb-grid bb-grid-4">
            {enriched
              .filter((p) => p.isBestForGifting || p.productLayer === 'bundle')
              .slice(0, 4)
              .map((p) => <ToyProductCard key={p._id} product={p} />)}
          </div>
        </div>

        {/* ── Parent reviews (footer trust ribbon follows in App shell) ── */}
        <div className="bb-section bb-section--before-footer">
          <ReviewSection />
        </div>
      </div>
    </div>
  );
}
