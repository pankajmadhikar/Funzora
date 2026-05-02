import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { enrichProducts } from '../../utils/enrichProduct';
import { createWhatsAppCheckoutLink, resolveProductPageUrl } from '../../utils/whatsappCheckout';
import { AGE_BUCKETS, GIFT_BUDGETS, GIFT_INTERESTS, GIFT_OCCASIONS } from '../../config/gifting';
import ToyProductCard from './ToyProductCard';

const STEPS = ['Age', 'Occasion', 'Budget', 'Interest'];

export default function GiftFinderPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [answers, setAnswers] = useState({
    ageBucket: '',
    occasion: '',
    priceBand: '',
    interest: '',
  });

  const giftWhatsAppHref = useMemo(() => {
    const picks = result.slice(0, 3);
    const sub = picks.reduce((s, p) => s + (Number(p.price) || 0), 0);
    return createWhatsAppCheckoutLink({
      cartItems: picks.map((item) => ({
        name: item.name,
        quantity: 1,
        price: Number(item.price) || 0,
        productUrl: resolveProductPageUrl(item._id),
        emoji: item._ui?.emoji || '🎁',
      })),
      grandTotal: sub,
    });
  }, [result]);

  const complete = useMemo(() => Object.values(answers).every(Boolean), [answers]);

  const pick = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const runFinder = async () => {
    try {
      setLoading(true);
      const res = await apiService.getProducts({
        ageBucket: answers.ageBucket,
        occasion: answers.occasion,
        priceBand: answers.priceBand,
        interest: answers.interest,
        isBestForGifting: true,
      });
      setResult(enrichProducts(res.data || []));
    } catch (err) {
      toast.error(err.message || 'Could not fetch gift suggestions');
    } finally {
      setLoading(false);
    }
  };

  const selections = [
    {
      key: 'ageBucket',
      list: AGE_BUCKETS.map((item) => ({ id: item, label: item })),
    },
    {
      key: 'occasion',
      list: GIFT_OCCASIONS,
    },
    {
      key: 'priceBand',
      list: GIFT_BUDGETS,
    },
    {
      key: 'interest',
      list: GIFT_INTERESTS,
    },
  ];

  return (
    <div className="bb-page" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="section-title">Gift Finder</h1>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Find the right gift in under 30 seconds.
        </p>
      </div>

      <div className="checkout-steps" style={{ marginBottom: 'var(--space-xl)' }}>
        {STEPS.map((label, idx) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`step-circle${step > idx ? ' completed' : ''}${step === idx ? ' active' : ''}`}>
              {idx + 1}
            </div>
            <span className={`step-label${step >= idx ? ' active' : ''}`}>{label}</span>
          </div>
        ))}
      </div>

      {step < selections.length && (
        <div className="checkout-card">
          <h2 className="bb-head" style={{ marginBottom: 'var(--space-md)' }}>
            Choose {STEPS[step].toLowerCase()}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {selections[step].list.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="btn btn--ghost"
                onClick={() => pick(selections[step].key, opt.id)}
                style={{
                  border: answers[selections[step].key] === opt.id
                    ? '2px solid var(--color-primary)'
                    : '2px solid var(--color-border)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={step === 0}
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!answers[selections[step].key]}
              onClick={() => {
                if (step === selections.length - 1) runFinder();
                setStep((prev) => Math.min(selections.length, prev + 1));
              }}
            >
              {step === selections.length - 1 ? 'Show gifts' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {step >= selections.length && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Top picks for gifting</h2>
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {loading ? 'Curating options...' : `${result.length} gifts found`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
                Restart
              </button>
              <a
                className="btn btn--primary"
                href={giftWhatsAppHref}
                target="_blank"
                rel="noreferrer"
              >
                Buy on WhatsApp
              </a>
            </div>
          </div>
          {!loading && result.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-title">No exact match yet</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Try a wider budget or different interest.</span>
              <Link to="/shop" className="btn btn--primary" style={{ marginTop: 12 }}>Browse all toys</Link>
            </div>
          ) : (
            <div className="bb-grid bb-grid-4">
              {result.map((item) => <ToyProductCard key={item._id} product={item} />)}
            </div>
          )}
        </div>
      )}

      {!complete && (
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Tip: complete all 4 steps for better gift suggestions.
        </p>
      )}
    </div>
  );
}
