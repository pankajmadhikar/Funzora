import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct } from '../../utils/enrichProduct';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.order) {
    return (
      <div className="bb-page" style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
        <p style={{ marginBottom: 'var(--space-md)' }}>No order to show.</p>
        <button className="btn btn--primary" onClick={() => navigate('/shop')}>Go shopping</button>
      </div>
    );
  }

  const { order, items = [], total } = state;
  const orderId = order._id || order.id || '—';
  let savings = 0;
  items.forEach((i) => {
    const p = i.productId;
    if (p?.mrp && p?.price) savings += (p.mrp - p.price) * (i.quantity || 0);
  });

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      background: 'linear-gradient(135deg, #FFF3CD, var(--color-accent-light))',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2xl)',
        maxWidth: 560,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}>
        <div style={{ fontSize: 80, marginBottom: 'var(--space-md)' }}>🎉</div>
        <h1 className="bb-head" style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
          Order placed!
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-xl)' }}>
          Your toys are on the way — we'll keep you posted.
        </p>

        <div style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-md) var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}>
          <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 800 }}>
            Order ID: <span style={{ color: 'var(--color-primary)' }}>#{String(orderId).slice(-8)}</span>
          </span>
        </div>

        {savings > 0 && (
          <div style={{
            background: 'linear-gradient(135deg,#EAFAF1,#D5F5E3)',
            border: '2px solid var(--color-success)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md) var(--space-lg)',
            marginBottom: 'var(--space-lg)',
          }}>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-success)' }}>
              You saved {formatPrice(savings)} on MRP
            </span>
          </div>
        )}

        <div style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
          marginBottom: 'var(--space-xl)',
        }}>
          <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            Order details
          </div>
          {items.map((i) => {
            const raw = i.productId;
            if (!raw) return null;
            const ep = enrichProduct(raw);
            return (
              <div key={i._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--space-xs) 0',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <span>{ep?._ui?.emoji} {raw.name} ×{i.quantity}</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(raw.price * i.quantity)}</span>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', color: 'var(--color-primary)' }}>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-md)' }}>Total</span>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-md)' }}>{formatPrice(total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--outline" onClick={() => navigate('/')} style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
            Back to home
          </button>
          <button className="btn btn--primary btn--lg" onClick={() => navigate('/shop')} style={{ fontFamily: 'var(--font-display)' }}>
            Shop more
          </button>
        </div>
      </div>
    </div>
  );
}
