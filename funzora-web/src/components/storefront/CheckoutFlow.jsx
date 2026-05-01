import React, { useState, useEffect, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { useGuestPhone, normalizeStoredPhone } from '../../contexts/GuestPhoneContext';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct } from '../../utils/enrichProduct';
import { FREE_SHIP_AT, SHIPPING_FLAT } from '../../config/toyStore';
import { createWhatsAppCheckoutLink } from '../../utils/whatsappCheckout';

const steps = ['Cart', 'Delivery', 'Payment', 'Confirm'];

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { phone } = useGuestPhone();
  const [step, setStep] = useState(1);
  const [cartItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    addr: '', city: '', pin: '', state: '',
    pay: 'upi', upi: '', card: '', exp: '', cvv: '',
  });

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadCart = useCallback(async () => {
    const clean = normalizeStoredPhone(phone);
    try {
      setLoading(true);
      if (!clean) {
        setLocalItems([]);
        dispatch(setCartItems({ items: [] }));
        return;
      }
      const res = await apiService.getCartItems(clean);
      const items = res?.data?.items || [];
      setLocalItems(items);
      dispatch(setCartItems(res.data));
    } catch {
      setLocalItems([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, phone]);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    const clean = normalizeStoredPhone(phone);
    if (clean && !form.phone) {
      setForm((f) => ({ ...f, phone: clean }));
    }
  }, [phone, form.phone]);

  const cartSub = cartItems.reduce((a, i) => a + (i.productId?.price || 0) * (i.quantity || 0), 0);
  const ship = cartSub >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const cartTotal = cartSub + ship;
  const whatsappCheckoutLink = createWhatsAppCheckoutLink({
    products: cartItems.map((item) => ({
      name: item.productId?.name || 'Toy',
      quantity: item.quantity || 1,
    })),
    giftWrap: true,
    pincode: form.pin,
  });

  const placeOrder = async () => {
    const clean = normalizeStoredPhone(phone);
    if (!clean) {
      toast.error('WhatsApp number missing — go back to cart.');
      return;
    }
    try {
      setSubmitting(true);
      const result = await apiService.checkout(clean);
      dispatch(setCartItems({ items: [] }));
      toast.success('Order placed!');
      navigate('/order-success', {
        replace: true,
        state: { order: result, form: { ...form }, total: cartTotal, items: cartItems },
      });
    } catch (e) {
      toast.error(e.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl) 0' }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="bb-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="bb-head" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-xl)' }}>
        Checkout
      </h1>

      {/* Stepper */}
      <div className="checkout-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className={`step-circle${step > i + 1 ? ' completed' : ''}${step === i + 1 ? ' active' : ''}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`step-label${step >= i + 1 ? ' active' : ''}`}>{s}</span>
            </div>
            {i < 3 && (
              <div className={`step-connector${step > i + 1 ? ' completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 2-column grid */}
      <div className="checkout-grid">
        <div>
          {/* Step 1: Cart review */}
          {step === 1 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                📦 Your order
              </h2>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>🧸</div>
                  <div style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Cart is empty</div>
                  <button className="btn btn--primary" onClick={() => navigate('/shop')}>Shop now</button>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => {
                    const raw = item.productId;
                    if (!raw) return null;
                    const ep = enrichProduct(raw);
                    return (
                      <div key={item._id} style={{
                        display: 'flex',
                        gap: 'var(--space-md)',
                        padding: 'var(--space-md) 0',
                        borderBottom: '1px solid var(--color-border)',
                        alignItems: 'center',
                      }}>
                        <div style={{
                          width: 56, height: 56,
                          borderRadius: 'var(--radius-md)',
                          background: ep?._ui?.grad || 'var(--color-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 26, flexShrink: 0, overflow: 'hidden',
                        }}>
                          {raw.images?.[0] ? (
                            <img src={raw.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : ep?._ui?.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                            {raw.name}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            Age {ep?._ui?.age} · Qty: {item.quantity}
                          </div>
                        </div>
                        <span className="bb-head" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary)' }}>
                          {formatPrice(raw.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                  <button
                    className="btn btn--primary btn--full btn--lg"
                    onClick={() => setStep(2)}
                    style={{ marginTop: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}
                  >
                    Continue to delivery →
                  </button>
                  <a
                    href={whatsappCheckoutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--ghost btn--full btn--lg"
                    style={{ marginTop: 'var(--space-sm)', textAlign: 'center' }}
                  >
                    Buy on WhatsApp
                  </a>
                </>
              )}
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                📍 Delivery details
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                For your records — order is placed via your account (backend).
              </p>
              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Full name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => F('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={(e) => F('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email} onChange={(e) => F('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-input"
                  style={{ height: 'auto', minHeight: 80, padding: 'var(--space-sm) var(--space-md)' }}
                  value={form.addr}
                  onChange={(e) => F('addr', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={(e) => F('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.state} onChange={(e) => F('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={form.pin} onChange={(e) => F('pin', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn--primary btn--lg"
                  style={{ flex: 1, fontFamily: 'var(--font-display)' }}
                  onClick={() => {
                    if (!form.name || !form.phone || !form.addr) {
                      toast.error('Please fill required fields');
                      return;
                    }
                    setStep(3);
                  }}
                >
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                💳 Payment method
              </h2>
              {['upi', 'card', 'cod'].map((pm) => (
                <div
                  key={pm}
                  onClick={() => F('pay', pm)}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    alignItems: 'center',
                    border: `2px solid ${form.pay === pm ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-sm)',
                    cursor: 'pointer',
                    background: form.pay === pm ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', flex: 1, fontSize: 'var(--font-size-base)' }}>
                    {pm === 'upi' && '📱 UPI'}
                    {pm === 'card' && '💳 Card'}
                    {pm === 'cod' && '💵 Cash on delivery'}
                  </span>
                  <div style={{
                    width: 20, height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${form.pay === pm ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                    background: form.pay === pm ? 'var(--color-primary)' : 'var(--color-surface)',
                    transition: 'all 0.15s',
                  }} />
                </div>
              ))}
              {form.pay === 'upi' && (
                <div className="form-group" style={{ marginTop: 'var(--space-sm)' }}>
                  <label className="form-label">UPI ID (optional)</label>
                  <input className="form-input" value={form.upi} onChange={(e) => F('upi', e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button className="btn btn--ghost" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn btn--primary btn--lg"
                  style={{ flex: 1, fontFamily: 'var(--font-display)' }}
                  onClick={() => setStep(4)}
                >
                  Review order →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                ✅ Review & confirm
              </h2>
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
              }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
                  📍 Deliver to
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                  {form.name} · {form.phone}{'\n'}
                  {form.addr}, {form.city} {form.pin}, {form.state}
                </div>
              </div>
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
              }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
                  💳 Payment
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)' }}>{form.pay.toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button className="btn btn--ghost" onClick={() => setStep(3)}>← Back</button>
                <button
                  className="btn btn--lg btn--full"
                  disabled={submitting || cartItems.length === 0}
                  onClick={placeOrder}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-display)',
                    background: 'linear-gradient(135deg,var(--color-success),#00BCD4)',
                    color: '#fff',
                  }}
                >
                  {submitting ? 'Placing…' : `Place order · ${formatPrice(cartTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="checkout-card" style={{ position: 'sticky', top: 100, height: 'fit-content' }}>
          <h3 className="bb-head" style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
            Order summary
          </h3>
          {cartItems.map((i) => {
            const raw = i.productId;
            if (!raw) return null;
            const ep = enrichProduct(raw);
            return (
              <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)', padding: 'var(--space-xs) 0', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>
                  {ep?._ui?.emoji} {raw.name} ×{i.quantity}
                </span>
                <span style={{ fontWeight: 800 }}>{formatPrice(raw.price * i.quantity)}</span>
              </div>
            );
          })}
          <div style={{ borderTop: '2px dashed var(--color-border)', margin: 'var(--space-md) 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>Subtotal</span>
            <span style={{ fontWeight: 800 }}>{formatPrice(cartSub)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>Shipping</span>
            <span style={{ fontWeight: 800, color: ship === 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
              {ship === 0 ? 'FREE' : formatPrice(ship)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>Total</span>
            <span className="bb-head" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
