import React, { useState, useEffect, useMemo } from 'react';
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
import { createWhatsAppCheckoutLink, resolveProductPageUrl } from '../../utils/whatsappCheckout';

const steps = ['Cart', 'Delivery', 'Payment', 'Confirm'];

function addressApiToForm(a) {
  return {
    fullName: a.fullName || '',
    deliveryPhone: a.phone || '',
    addressLine1: a.addressLine1 || '',
    addressLine2: a.addressLine2 || '',
    landmark: a.landmark || '',
    city: a.city || '',
    state: a.state || '',
    pin: a.pincode || '',
  };
}

/** Map checkout form slice → POST /user/address/save payload */
export function checkoutFormToAddressPayload(form) {
  const digits = String(form.deliveryPhone || '').replace(/\D/g, '').slice(-10);
  return {
    fullName: form.fullName.trim(),
    phone: digits,
    addressLine1: form.addressLine1.trim(),
    addressLine2: (form.addressLine2 || '').trim(),
    landmark: (form.landmark || '').trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pincode: String(form.pin || '').replace(/\D/g, '').slice(0, 6),
  };
}

/** Build delivery argument for WhatsApp template */
export function deliveryFromCheckoutForm(form) {
  const p = checkoutFormToAddressPayload(form);
  if (!p.fullName || p.phone.length !== 10 || !p.addressLine1) return null;
  if (!p.city || !p.state || !p.pincode) return null;
  return {
    fullName: p.fullName,
    phone: p.phone,
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2 || '',
    landmark: p.landmark || '',
    city: p.city,
    state: p.state,
    pincode: p.pincode,
  };
}

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { phone } = useGuestPhone();

  const [step, setStep] = useState(1);
  const [cartItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /** From server snapshot — locks fields until “Change address”. */
  const [deliveryFieldsLocked, setDeliveryFieldsLocked] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    deliveryPhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pin: '',
    email: '',
    pay: 'upi',
    upi: '',
    card: '',
    exp: '',
    cvv: '',
  });

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      const clean = normalizeStoredPhone(phone);

      if (!clean) {
        if (!cancelled) {
          setLocalItems([]);
          dispatch(setCartItems({ items: [] }));
          setLoading(false);
          setDeliveryFieldsLocked(false);
          setHasSavedAddress(false);
        }
        return;
      }

      try {
        const [cartRes, addrRes] = await Promise.all([
          apiService.getCartItems(clean),
          apiService.getDeliveryAddress(clean).catch(() => ({ success: false, address: null })),
        ]);

        if (cancelled) return;

        const items = cartRes?.data?.items || [];
        setLocalItems(items);
        dispatch(setCartItems(cartRes.data));

        const addr = addrRes?.address;
        if (addr?.fullName) {
          setForm((prev) => ({
            ...prev,
            ...addressApiToForm(addr),
            deliveryPhone: addr.phone || clean,
          }));
          setHasSavedAddress(true);
          setDeliveryFieldsLocked(true);
        } else {
          setForm((prev) => ({
            ...prev,
            deliveryPhone: prev.deliveryPhone || clean,
          }));
          setHasSavedAddress(false);
          setDeliveryFieldsLocked(false);
        }
      } catch {
        setLocalItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [phone, dispatch]);

  const cartSub = cartItems.reduce((a, i) => a + (i.productId?.price || 0) * (i.quantity || 0), 0);
  const ship = cartSub >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const cartTotal = cartSub + ship;

  const whatsappCheckoutHref = useMemo(() => {
    const cartItemsWa = cartItems.map((item) => {
      const raw = item.productId;
      const ep = raw ? enrichProduct(raw) : null;
      const id = raw?._id;
      return {
        name: raw?.name || 'Toy',
        quantity: item.quantity || 1,
        price: Number(raw?.price) || 0,
        productUrl: id ? resolveProductPageUrl(id) : resolveProductPageUrl(''),
        emoji: ep?._ui?.emoji || '🧸',
      };
    });

    const d = deliveryFromCheckoutForm(form);

    return createWhatsAppCheckoutLink({
      cartItems: cartItemsWa,
      address: d
        ? {
            fullName: d.fullName,
            phone: d.phone,
            city: d.city,
            state: d.state,
            pincode: d.pincode,
            addressLine1: d.addressLine1,
            addressLine2: d.addressLine2,
            landmark: d.landmark,
          }
        : null,
      grandTotal: cartTotal,
      shippingAmount: ship,
    });
  }, [cartItems, cartTotal, form, ship]);

  const validateDeliveryStep = () => {
    const p = checkoutFormToAddressPayload(form);
    if (!p.fullName) {
      toast.error('Please enter full name');
      return false;
    }
    if (p.phone.length !== 10 || !/^[6-9]/.test(p.phone)) {
      toast.error('Enter a valid 10-digit delivery phone');
      return false;
    }
    if (!p.addressLine1) {
      toast.error('Please enter address line 1');
      return false;
    }
    if (!p.city || !p.state) {
      toast.error('City and state are required');
      return false;
    }
    if (!p.pincode || p.pincode.length < 6) {
      toast.error('Enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const saveAddressAndContinue = async () => {
    if (!validateDeliveryStep()) return;
    const clean = normalizeStoredPhone(phone);
    if (!clean) {
      toast.error('WhatsApp identity missing.');
      return;
    }
    try {
      await apiService.saveDeliveryAddress(clean, checkoutFormToAddressPayload(form));
      setHasSavedAddress(true);
      setDeliveryFieldsLocked(true);
      toast.success('Delivery address saved');
      setStep(3);
    } catch (e) {
      toast.error(e.message || 'Could not save address');
    }
  };

  const placeOrder = async () => {
    const clean = normalizeStoredPhone(phone);
    if (!clean) {
      toast.error('WhatsApp number missing — go back to cart.');
      return;
    }
    if (!deliveryFromCheckoutForm(form)) {
      toast.error('Complete delivery details first.');
      return;
    }
    try {
      await apiService.saveDeliveryAddress(clean, checkoutFormToAddressPayload(form));
    } catch (e) {
      toast.error(e.message || 'Could not save address');
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

  const inputProps = deliveryFieldsLocked
    ? ({
        disabled: true,
        style: { opacity: 0.85 },
      })
    : ({});

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

      <div className="checkout-grid">
        <div>
          {step === 1 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)', color: 'var(--color-text-primary)' }}>
                📦 Your order
              </h2>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>🧸</div>
                  <div style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Cart is empty</div>
                  <button type="button" className="btn btn--primary" onClick={() => navigate('/shop')}>Shop now</button>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => {
                    const raw = item.productId;
                    if (!raw) return null;
                    const ep = enrichProduct(raw);
                    return (
                      <div
                        key={item._id}
                        style={{
                          display: 'flex',
                          gap: 'var(--space-md)',
                          padding: 'var(--space-md) 0',
                          borderBottom: '1px solid var(--color-border)',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-md)',
                            background: ep?._ui?.grad || 'var(--color-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 26,
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {raw.images?.[0] ? (
                            <img src={raw.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            ep?._ui?.emoji
                          )}
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
                    type="button"
                    className="btn btn--primary btn--full btn--lg"
                    onClick={() => setStep(2)}
                    style={{ marginTop: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}
                  >
                    Continue to delivery →
                  </button>
                  <a
                    href={whatsappCheckoutHref}
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

          {step === 2 && (
            <div className="checkout-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>
                  📍 Delivery details
                </h2>
                {hasSavedAddress && deliveryFieldsLocked && (
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      color: 'var(--color-success)',
                      background: 'var(--color-primary-light)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Saved address
                  </span>
                )}
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                We remember your delivery details for future orders — you can edit anytime.
              </p>

              {(hasSavedAddress && deliveryFieldsLocked) && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setDeliveryFieldsLocked(false)}
                  >
                    Change address
                  </button>
                </div>
              )}

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Full name *</label>
                  <input className="form-input" value={form.fullName} onChange={(e) => F('fullName', e.target.value)} {...inputProps} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.deliveryPhone} onChange={(e) => F('deliveryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} {...inputProps} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address line 1 *</label>
                <textarea
                  className="form-input"
                  style={{ height: 'auto', minHeight: 64, padding: 'var(--space-sm) var(--space-md)' }}
                  value={form.addressLine1}
                  onChange={(e) => F('addressLine1', e.target.value)}
                  rows={2}
                  {...inputProps}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address line 2 (optional)</label>
                <input className="form-input" value={form.addressLine2} onChange={(e) => F('addressLine2', e.target.value)} {...inputProps} />
              </div>
              <div className="form-group">
                <label className="form-label">Landmark (optional)</label>
                <input className="form-input" value={form.landmark} onChange={(e) => F('landmark', e.target.value)} {...inputProps} />
              </div>

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" value={form.city} onChange={(e) => F('city', e.target.value)} {...inputProps} />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" value={form.state} onChange={(e) => F('state', e.target.value)} {...inputProps} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" value={form.pin} onChange={(e) => F('pin', e.target.value.replace(/\D/g, '').slice(0, 6))} {...inputProps} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => F('email', e.target.value)} disabled={deliveryFieldsLocked} />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
                {deliveryFieldsLocked && hasSavedAddress ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    style={{ flex: 1, fontFamily: 'var(--font-display)' }}
                    onClick={() => setStep(3)}
                  >
                    Continue to payment →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    style={{ flex: 1, fontFamily: 'var(--font-display)' }}
                    onClick={saveAddressAndContinue}
                  >
                    Save address & continue →
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                💳 Payment method
              </h2>
              {['upi', 'card', 'cod'].map((pm) => (
                <div
                  key={pm}
                  role="button"
                  tabIndex={0}
                  onClick={() => F('pay', pm)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') F('pay', pm);
                  }}
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
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${form.pay === pm ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                      background: form.pay === pm ? 'var(--color-primary)' : 'var(--color-surface)',
                      transition: 'all 0.15s',
                    }}
                  />
                </div>
              ))}
              {form.pay === 'upi' && (
                <div className="form-group" style={{ marginTop: 'var(--space-sm)' }}>
                  <label className="form-label">UPI ID (optional)</label>
                  <input className="form-input" value={form.upi} onChange={(e) => F('upi', e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>← Back</button>
                <button type="button" className="btn btn--primary btn--lg" style={{ flex: 1, fontFamily: 'var(--font-display)' }} onClick={() => setStep(4)}>
                  Review order →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="checkout-card">
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                ✅ Review & confirm
              </h2>
              <div
                style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
                  📍 Deliver to
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                  {form.fullName} · {form.deliveryPhone}
                  {'\n'}
                  {[form.addressLine1, form.addressLine2].filter(Boolean).join(', ')}
                  {form.landmark ? `\nNear ${form.landmark}` : ''}
                  {`\n${form.city}, ${form.state} - ${form.pin}`}
                  {form.email ? `\nEmail: ${form.email}` : ''}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
                  💳 Payment
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)' }}>{form.pay.toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(3)}>← Back</button>
                <a
                  href={whatsappCheckoutHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--ghost btn--lg"
                  style={{ flex: 1, minWidth: '10rem', textAlign: 'center' }}
                >
                  Send via WhatsApp
                </a>
                <button
                  type="button"
                  className="btn btn--lg btn--full"
                  disabled={submitting || cartItems.length === 0}
                  onClick={placeOrder}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-display)',
                    background: 'linear-gradient(135deg,var(--color-success),#00BCD4)',
                    color: '#fff',
                    minWidth: '10rem',
                  }}
                >
                  {submitting ? 'Placing…' : `Place order · ${formatPrice(cartTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

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
