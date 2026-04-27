import React, { useEffect, useState, useMemo } from 'react';
import { CircularProgress, MenuItem, Select, FormControl } from '@mui/material';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { enrichProducts } from '../../utils/enrichProduct';
import { TOY_CATS } from '../../config/toyStore';
import ToyProductCard from './ToyProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const q = (searchParams.get('q') || '').trim();
  const selCat = searchParams.get('cat') || 'all';
  const sort = searchParams.get('sort') || 'hot';
  const ageFilter = searchParams.get('age') || 'all';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.getProducts();
        if (!cancelled) { setProducts(res.data || []); setErr(''); }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const enriched = useMemo(() => enrichProducts(products), [products]);

  const filtP = useMemo(() => {
    const ql = q.toLowerCase();
    let list = enriched.filter((p) => {
      const mS = !ql || p.name?.toLowerCase().includes(ql) || p.category?.toLowerCase().includes(ql) || p.description?.toLowerCase().includes(ql);
      const mC = selCat === 'all' || p._ui.displayCatId === selCat;
      const mA = ageFilter === 'all' || p._ui.age === ageFilter;
      return mS && mC && mA;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'disc') return b._ui.discountPct - a._ui.discountPct;
      if (sort === 'new') return (b._ui.isNew ? 1 : 0) - (a._ui.isNew ? 1 : 0);
      return (b._ui.hot ? 1 : 0) - (a._ui.hot ? 1 : 0);
    });
    return list;
  }, [enriched, q, selCat, sort, ageFilter]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all') next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl) 0' }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (err) {
    return (
      <div className="bb-page" style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
        <p style={{ color: '#ef4444' }}>{err}</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: 'var(--space-md)', display: 'inline-flex' }}>Home</Link>
      </div>
    );
  }

  const catObj = TOY_CATS.find((c) => c.id === selCat);
  const catLabel = selCat === 'all' ? 'All Toys' : catObj?.label || '';
  const catIcon = selCat === 'all' ? '🎁' : catObj?.icon || '🎁';

  return (
    <div className="bb-page">
      {/* Header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
      }}>
        <div>
          <h1 className="bb-head" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)' }}>
            {catIcon} {catLabel}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)', fontWeight: 600 }}>
            {filtP.length} toy{filtP.length !== 1 ? 's' : ''} found · Live from your catalog
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small">
            <Select
              value={ageFilter}
              onChange={(e) => setParam('age', e.target.value)}
              sx={{
                bgcolor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                minWidth: 120,
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <MenuItem value="all">All ages</MenuItem>
              {['1+', '2+', '3+', '4+', '5+', '6+', '7+'].map((a) => (
                <MenuItem key={a} value={a}>{a} years</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              sx={{
                bgcolor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                minWidth: 170,
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <MenuItem value="hot">🔥 Trending</MenuItem>
              <MenuItem value="new">✨ New first</MenuItem>
              <MenuItem value="low">💰 Low to High</MenuItem>
              <MenuItem value="high">⬆ High to Low</MenuItem>
              <MenuItem value="disc">🏷 Best discount</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-xl)', overflowX: 'auto', paddingBottom: 'var(--space-xs)' }}>
        {TOY_CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setParam('cat', c.id === 'all' ? '' : c.id)}
            style={{
              background: selCat === c.id ? c.color : 'var(--color-bg)',
              color: selCat === c.id ? '#fff' : 'var(--color-text-secondary)',
              border: selCat === c.id ? `2px solid ${c.color}` : '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filtP.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
          <div style={{ fontSize: 56, marginBottom: 'var(--space-md)' }}>🔍</div>
          <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
            No toys found!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
            Try a different search or category
          </p>
          <button
            className="btn btn--primary"
            onClick={() => setSearchParams(new URLSearchParams())}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bb-grid bb-grid-4">
          {filtP.map((p) => <ToyProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
