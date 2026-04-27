import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Footer.css';

const TRUST_RIBBON = [
  {
    key: 'safe',
    icon: '🛡️',
    title: '100% Safe Materials',
    desc: 'Non-toxic, child-safe & BIS certified toys',
    circle: 'funzora-icon-circle--red',
  },
  {
    key: 'delivery',
    icon: '🚚',
    title: 'Pan India Delivery',
    desc: 'Fast & reliable delivery across India',
    circle: 'funzora-icon-circle--green',
  },
  {
    key: 'returns',
    icon: '🔄',
    title: '7-Day Easy Returns',
    desc: 'Hassle-free returns within 7 days',
    circle: 'funzora-icon-circle--purple',
  },
  {
    key: 'pay',
    icon: '🔒',
    title: 'Secure Payments',
    desc: 'Your payments are safe and protected',
    circle: 'funzora-icon-circle--gold',
  },
];

const SHOP_LINKS = [
  { label: 'All Toys', to: '/shop' },
  { label: 'New Arrivals', to: '/shop?sort=new' },
  { label: 'Best Sellers', to: '/shop?sort=hot' },
  { label: 'Offers', to: '/shop' },
  { label: 'Under ₹50', to: '/shop?sort=low' },
];

const HELP_LINKS = [
  { label: 'Contact Us', href: 'mailto:support@funzora.com' },
  { label: 'Track Order', to: '/profile' },
  { label: 'Returns & Refunds', href: '#' },
  { label: 'Shipping Information', href: '#' },
  { label: 'FAQs', href: '#' },
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Shipping Policy', href: '#' },
  { label: 'Return Policy', href: '#' },
  { label: 'Payment Policy', href: '#' },
];

function buildWhatsappHref() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  const text = encodeURIComponent('Hi FunZora — I need help with an order.');
  return `https://wa.me/${digits}?text=${text}`;
}

function Footer() {
  const [email, setEmail] = useState('');
  const whatsappHref = buildWhatsappHref();

  const onNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Thanks! You\'re on the list for toy news & tips.');
    setEmail('');
  };

  const onWhatsappClick = (e) => {
    if (!whatsappHref) {
      e.preventDefault();
      toast('Add VITE_WHATSAPP_NUMBER in .env to enable WhatsApp (e.g. 919876543210).', { icon: '💬' });
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer className="funzora-footer">
      <div className="funzora-footer-inner">
        <div className="funzora-trust-ribbon" aria-label="Store promises">
          {TRUST_RIBBON.map((t) => (
            <div className="funzora-trust-item" key={t.key}>
              <div className={`funzora-icon-circle ${t.circle}`}>{t.icon}</div>
              <div className="funzora-trust-text">
                <strong>{t.title}</strong>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="funzora-footer-main">
          <div className="funzora-brand-story">
            <div className="funzora-footer-logo">
              <RouterLink to="/" className="funzora-footer-logo-link">
                <span className="funzora-footer-logo-icon" aria-hidden="true">🧸</span>
                <div className="funzora-footer-logo-text">
                  <span className="funzora-footer-logo-name">
                    <span className="fun">Fun</span>
                    <span className="zora">Zora</span>
                  </span>
                  <span className="funzora-footer-logo-tagline">Play. Smile. Grow.</span>
                </div>
              </RouterLink>
            </div>
            <p>
              Thoughtfully chosen toys that inspire creativity, learning and endless joy for every child.
            </p>
            <ul className="funzora-brand-checks">
              <li>Safe &amp; Non-Toxic</li>
              <li>Loved by Parents</li>
              <li>Premium Quality</li>
            </ul>
            <div className="funzora-footer-illus" aria-hidden="true">
              <span className="funzora-footer-illus-emoji">🐰</span>
              <div className="funzora-footer-illus-stack">
                <span />
                <span />
                <span />
                <span />
              </div>
              <span className="funzora-footer-illus-star">⭐</span>
            </div>
          </div>

          <div className="funzora-footer-links">
            <nav className="funzora-link-col" aria-label="Shop">
              <h3>Shop</h3>
              <ul>
                {SHOP_LINKS.map((l) => (
                  <li key={l.label}>
                    <RouterLink to={l.to}>{l.label}</RouterLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav className="funzora-link-col" aria-label="Help">
              <h3>Help</h3>
              <ul>
                {HELP_LINKS.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <RouterLink to={l.to}>{l.label}</RouterLink>
                    ) : (
                      <a href={l.href}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <nav className="funzora-link-col" aria-label="Policies">
              <h3>Policies</h3>
              <ul>
                {POLICY_LINKS.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <aside className="funzora-help-card">
            <h3>Need Help?</h3>
            <p className="funzora-help-lead"><strong>We&apos;re here for you!</strong></p>
            <p className="funzora-help-sub">Chat with us on WhatsApp for quick support.</p>
            <a
              className="funzora-whatsapp-btn"
              href={whatsappHref || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsappClick}
            >
              <span aria-hidden="true">💬</span>
              Chat on WhatsApp
            </a>

            <div className="funzora-footer-divider">
              <span>or</span>
            </div>

            <form className="funzora-newsletter" onSubmit={onNewsletter}>
              <input
                type="email"
                name="footer-email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="funzora-subscribe-btn">Subscribe</button>
            </form>
            <p className="funzora-newsletter-note">
              Get updates on new toys, exclusive offers &amp; parenting tips.
            </p>
          </aside>
        </div>

        <div className="funzora-footer-bottom">
          <p className="funzora-footer-copy">© {year} FunZora. All rights reserved.</p>
          <nav className="funzora-legal-links" aria-label="Legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Returns Policy</a>
          </nav>
          <div className="funzora-payment-row">
            <span className="funzora-payment-label">We accept</span>
            <span className="funzora-pay-badge funzora-pay-badge--upi">UPI</span>
            <span className="funzora-pay-badge funzora-pay-badge--visa">VISA</span>
            <span className="funzora-pay-badge funzora-pay-badge--mc" title="Mastercard" aria-label="Mastercard" />
            <span className="funzora-pay-badge funzora-pay-badge--rupay">RuPay</span>
            <span className="funzora-pay-badge funzora-pay-badge--wallet">Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
