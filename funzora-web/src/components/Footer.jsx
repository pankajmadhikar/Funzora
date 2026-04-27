import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TOY_CATS } from '../config/toyStore';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="bb-head" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>
              <span style={{ color: 'var(--color-primary)' }}>Funzo</span>Toys
            </div>
            <p style={{ color: '#9899A6', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
              Playful picks for kids — browse the catalog, build your bag, and checkout.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Categories</div>
            {TOY_CATS.filter((c) => c.id !== 'all').map((c) => (
              <RouterLink key={c.id} to={`/shop?cat=${c.id}`} className="footer-link">
                {c.icon} {c.label}
              </RouterLink>
            ))}
          </div>

          <div>
            <div className="footer-col-title">Support</div>
            {['Easy returns', 'Secure checkout', 'Pan-India shipping', 'Profile help'].map((l) => (
              <div key={l} className="footer-link" style={{ cursor: 'default' }}>✓ {l}</div>
            ))}
          </div>

          <div>
            <div className="footer-col-title">Quick links</div>
            {[
              { label: 'All toys', path: '/shop' },
              { label: 'Wishlist', path: '/wishlist' },
              { label: 'Cart', path: '/cart' },
            ].map((l) => (
              <RouterLink key={l.label} to={l.path} className="footer-link">
                {l.label}
              </RouterLink>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} Funzo Toys</span>
          <div className="footer-legal">
            {['Privacy', 'Returns', 'Terms'].map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
