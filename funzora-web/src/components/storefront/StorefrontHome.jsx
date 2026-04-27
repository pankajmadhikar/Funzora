import React, { useEffect, useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
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
        {/* ── Hot & new ── */}
        <div className="bb-section">
          <div className="section-header">
            <div>
              <h2 className="section-title bb-head">
                🔥 Hot & <span style={{ color: 'var(--color-accent)' }}>new</span>
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
            className="bb-section"
            style={{
              background: 'linear-gradient(135deg,#FEF9EC,#FFE5B4)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
            }}
          >
            <div className="section-header">
              <div>
                <span
                  className="hero-badge"
                  style={{ background: 'var(--color-primary)', marginBottom: 'var(--space-sm)', display: 'inline-flex' }}
                >
                  🏷 BEST VALUE
                </span>
                <h2 className="section-title bb-head">
                  Under <span style={{ color: 'var(--color-primary)' }}>₹50</span> zone
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

        {/* ── Parent reviews (footer trust ribbon follows in App shell) ── */}
        <div className="bb-section bb-section--before-footer">
          <ReviewSection />
        </div>
      </div>
    </div>
  );
}
