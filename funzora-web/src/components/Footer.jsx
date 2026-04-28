import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Lock, Package, RotateCcw, Shield, Sparkles, Star, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ICON_STROKE, ICON_SIZES } from '../constants/appIconTokens';
import { getWhatsappUrl } from '../config/support';
import './Footer.css';

function WhatsAppGlyph({ className }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const TRUST_RIBBON = [
  {
    key: 'safe',
    Icon: Shield,
    title: '100% Safe Materials',
    desc: 'Non-toxic, child-safe & BIS certified toys',
  },
  {
    key: 'delivery',
    Icon: Truck,
    title: 'Pan India Delivery',
    desc: 'Fast & reliable delivery across India',
  },
  {
    key: 'returns',
    Icon: RotateCcw,
    title: '7-Day Easy Returns',
    desc: 'Hassle-free returns within 7 days',
  },
  {
    key: 'pay',
    Icon: Lock,
    title: 'Secure Payments',
    desc: 'Your payments are safe and protected',
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

function Footer() {
  const [email, setEmail] = useState('');

  const onNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Thanks! You\'re on the list for toy news & tips.');
    setEmail('');
  };

  const handleWhatsApp = () => {
    const url = getWhatsappUrl();
    if (!url) {
      toast.error('WhatsApp number is not configured.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const year = new Date().getFullYear();

  return (
    <footer className="funzora-footer">
      <div className="funzora-footer-inner">
        <div className="funzora-trust-ribbon" aria-label="Store promises">
          {TRUST_RIBBON.map(({ key, Icon, title, desc }) => (
            <div className="funzora-trust-item" key={key}>
              <div className="funzora-trust-icon-wrap" aria-hidden>
                <Icon size={ICON_SIZES.md} strokeWidth={ICON_STROKE} />
              </div>
              <div className="funzora-trust-text">
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="funzora-footer-main">
          <div className="funzora-brand-story">
            <div className="funzora-footer-logo">
              <RouterLink to="/" className="funzora-footer-logo-link">
                <span className="funzora-footer-logo-icon" aria-hidden="true">
                  <Sparkles size={22} strokeWidth={ICON_STROKE} />
                </span>
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
              <Package size={36} strokeWidth={ICON_STROKE} className="funzora-footer-illus-pack" />
              <div className="funzora-footer-illus-stack">
                <span />
                <span />
                <span />
                <span />
              </div>
              <Star size={28} strokeWidth={ICON_STROKE} className="funzora-footer-illus-star" />
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
            <p className="funzora-help-sub">We usually reply within 2–5 minutes ⚡</p>
            <button type="button" className="funzora-whatsapp-btn" onClick={handleWhatsApp}>
              <WhatsAppGlyph className="funzora-whatsapp-icon" />
              Chat on WhatsApp
            </button>

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
