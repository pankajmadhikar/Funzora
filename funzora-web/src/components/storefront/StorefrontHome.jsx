import React, { useEffect, useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { setRefreshCartItems } from '../../redux/slices/authSlice';
import { enrichProducts, enrichProduct } from '../../utils/enrichProduct';
import { TOY_CATS } from '../../config/toyStore';
import { TOY_COMBOS, resolveComboProducts } from '../../config/toyCombos';
import { formatPrice } from '../../utils/formatPrice';
import ToyProductCard from './ToyProductCard';
import HeroSection from './HeroSection';

const TICKER_ITEMS = [
  '🎁 All toys under ₹100',
  '🚚 Free shipping above ₹199',
  '⭐ 4.8 rated by families',
  '🔄 7-day easy returns',
  '🇮🇳 Pan India delivery',
  '🛡️ Safe & non-toxic',
  '🏷️ Up to 60% off MRP',
];

const TRUST = [
  { emoji: '🛡️', title: '100% safe materials', desc: 'Non-toxic, child-safe picks' },
  { emoji: '🚚', title: 'Pan-India delivery', desc: 'Ship wherever your pincode allows' },
  { emoji: '↩️', title: '7-day easy returns', desc: 'Hassle-free support' },
  { emoji: '💳', title: 'Secure checkout', desc: 'Payment flow stays protected' },
];

const FAQS = [
  { q: 'Are products safe for children?', a: 'We list age guidance from your catalog and highlight non-toxic picks. Always supervise young children during play.' },
  { q: 'How does delivery work?', a: 'Orders are fulfilled per your store operations. Free shipping applies on cart subtotals of ₹199+.' },
  { q: 'What if something is wrong with my order?', a: 'Reach out via your support channels. Return policies follow your business rules.' },
  { q: 'What payment options are supported?', a: 'Checkout uses your existing backend flow. The payment step is for UX; gateway integration can be added later.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

export default function StorefrontHome() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comboBusy, setComboBusy] = useState(null);

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

  const addCombo = async (combo) => {
    const resolved = resolveComboProducts(products, combo);
    if (resolved.length === 0) { toast.error('No matching toys yet.'); return; }
    try {
      setComboBusy(combo.id);
      for (const p of resolved) await apiService.addToCart(p._id, 1);
      const cartRes = await apiService.getCartItems();
      if (cartRes?.data) dispatch(setCartItems(cartRes.data));
      dispatch(setRefreshCartItems());
      toast.success(resolved.length < combo.matchNames.length ? `${resolved.length} item(s) added` : 'Combo added!');
    } catch (e) { toast.error(e.message || 'Could not add combo'); }
    finally { setComboBusy(null); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 14 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <div>
      {/* ── Ticker ── */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <HeroSection />

      <div className="bb-page">
        {/* ── Category quick icons ── */}
        <div className="category-grid" style={{ marginBottom: 'var(--space-xl)' }}>
          {TOY_CATS.filter((c) => c.id !== 'all').map((c) => {
            const count = enriched.filter((p) => p._ui.displayCatId === c.id).length;
            return (
              <div
                key={c.id}
                className="category-card"
                onClick={() => navigate(`/shop?cat=${c.id}`)}
                style={{ '--category-color': c.color, '--category-bg': c.bg, borderColor: 'var(--color-border)' }}
              >
                <div className="category-icon-wrap" style={{ background: c.bg }}>
                  {c.icon}
                </div>
                <span className="category-label">{c.label}</span>
                {count > 0 && (
                  <span className="category-count">{count} {count === 1 ? 'toy' : 'toys'}</span>
                )}
              </div>
            );
          })}
          <div
            className="category-card"
            onClick={() => navigate('/shop?sort=low')}
            style={{ '--category-color': '#F59E0B', '--category-bg': '#FEF9EC' }}
          >
            <div className="category-icon-wrap" style={{ background: '#FEF9EC' }}>🏷</div>
            <span className="category-label">Under ₹50</span>
          </div>
        </div>

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

        {/* ── Categories section ── */}
        <div
          className="bb-section"
          style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
          }}
        >
          <div className="section-header">
            <h2 className="section-title bb-head">
              Explore <span style={{ color: 'var(--color-primary)' }}>categories</span>
            </h2>
            <Link to="/shop" className="section-view-all" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
              View all →
            </Link>
          </div>
          <div className="bb-grid bb-grid-6">
            {TOY_CATS.filter((c) => c.id !== 'all').map((c) => {
              const count = enriched.filter((p) => p._ui.displayCatId === c.id).length;
              return (
                <div
                  key={c.id}
                  className="category-card"
                  onClick={() => navigate(`/shop?cat=${c.id}`)}
                  style={{ background: c.bg, borderColor: `${c.color}20` }}
                >
                  <span style={{ fontSize: 34 }}>{c.icon}</span>
                  <span className="category-label" style={{ color: c.color }}>{c.label}</span>
                  {count > 0 && (
                    <span className="category-count">{count} {count === 1 ? 'toy' : 'toys'}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Combos ── */}
        <div
          className="bb-section"
          style={{
            background: 'linear-gradient(135deg,#F3EFFF,#FDE8F4)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            textAlign: 'center',
          }}
        >
          <span
            className="hero-badge"
            style={{ background: 'var(--color-accent)', marginBottom: 'var(--space-sm)', display: 'inline-flex' }}
          >
            💡 SAVE MORE
          </span>
          <h2 className="section-title bb-head" style={{ marginBottom: 'var(--space-xs)' }}>Combo deals</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xl)' }}>
            We match products from your catalog by name keywords
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-lg)',
              textAlign: 'left',
            }}
          >
            {TOY_COMBOS.map((c) => {
              const resolved = resolveComboProducts(products, c);
              const orig = resolved.reduce((a, p) => a + (Number(p.price) || 0), 0);
              const comboPrice = orig > 0 ? Math.round(orig * 0.92) : 0;
              const emptySlots = Math.max(0, 3 - resolved.length);
              return (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    border: `1.5px solid ${c.color}25`,
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 290,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: `${c.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                    }}>
                      {c.emoji}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{c.desc}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flex: 1, alignItems: 'stretch' }}>
                    {resolved.map((p) => {
                      const ep = enrichProduct(p);
                      return (
                        <div
                          key={p._id}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: 88,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: ep._ui.grad,
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-sm) var(--space-xs)',
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{ep._ui.emoji}</span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: ep._ui.txtColor,
                            marginTop: 4,
                            lineHeight: 1.2,
                            textAlign: 'center',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {p.name}
                          </span>
                        </div>
                      );
                    })}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div key={`empty-${i}`} className="combo-empty-slot" />
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-md)', marginTop: 'auto' }}>
                    <div style={{ minWidth: 0 }}>
                      {orig > 0 ? (
                        <>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textDecoration: 'line-through', fontWeight: 600, marginBottom: 4 }}>
                            Sum {formatPrice(orig)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                            <span className="bb-head" style={{ fontSize: 'var(--font-size-xl)', color: c.color, lineHeight: 1.1 }}>
                              {formatPrice(comboPrice)}
                            </span>
                            <span style={{
                              fontSize: 'var(--font-size-xs)',
                              background: c.color,
                              color: '#fff',
                              borderRadius: 'var(--radius-sm)',
                              padding: '2px 6px',
                              fontWeight: 700,
                            }}>
                              bundle est.
                            </span>
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 700, lineHeight: 1.4 }}>
                          Add matching products for this bundle.
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={comboBusy === c.id || resolved.length === 0}
                      onClick={() => addCombo(c)}
                      style={{ background: c.color, flexShrink: 0 }}
                    >
                      {comboBusy === c.id ? '…' : resolved.length < 3 && resolved.length > 0 ? `Add ${resolved.length}` : 'Add all'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Trust ── */}
        <div className="bb-section">
          <div className="trust-grid">
            {TRUST.map((b) => (
              <div key={b.title} className="trust-card">
                <span className="trust-icon">{b.emoji}</span>
                <span className="trust-title">{b.title}</span>
                <span className="trust-desc">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="bb-section" style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 className="section-title bb-head" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            Questions? <span style={{ color: 'var(--color-primary)' }}>We've got you</span>
          </h2>
          <div className="faq-list">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
