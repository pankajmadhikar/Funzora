import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../../assets/Banners/hero-bg-toys.png';
import './HeroSection.css';

const FEATURES = [
  { icon: '🛡️', label: 'Premium\nQuality', bg: '#f19fa8' },
  { icon: '🍃', label: 'Safe &\nNon-Toxic', bg: '#94b9d0' },
  { icon: '👶', label: 'For All\nAges', bg: '#8dbd8d' },
  { icon: '🎁', label: 'Perfect For\nGifting', bg: '#eec170' },
];

const FOOTER_ITEMS = [
  { icon: '🍃', title: 'Beautifully Crafted', desc: 'Made with love and attention to detail.' },
  { icon: '🛡️', title: 'Safe for Your Little Ones', desc: 'High-quality, non-toxic materials you can trust.' },
  { icon: '😊', title: 'Encourages Imagination', desc: 'Inspires creativity, learning and endless adventures.' },
  { icon: '🎁', title: 'Perfect for Every Occasion', desc: 'Birthdays, celebrations or just because!' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-banner" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="hero-banner-content">
        <div className="hero-banner-tagline">
          <span>PLAY. SMILE. GROW.</span>
          <span className="hero-banner-heart">❤</span>
        </div>

        <h1 className="hero-banner-title">
          Toys That<br />
          <span className="hero-banner-title-accent">Create Joy</span>
        </h1>

        <p className="hero-banner-desc">
          Premium soft toys and engaging hard toys<br />
          for endless fun and imaginative play.
        </p>

        <div className="hero-banner-features">
          {FEATURES.map((f) => (
            <div key={f.label} className="hero-banner-feature">
              <div className="hero-banner-feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <span className="hero-banner-feature-label">{f.label}</span>
            </div>
          ))}
        </div>

        <button className="hero-banner-cta" onClick={() => navigate('/shop')}>
          SHOP NOW <span className="hero-banner-cta-arrow">›</span>
        </button>
      </div>

      <div className="hero-banner-badge">
        <div className="hero-banner-badge-inner">
          <span>SOFT HUGS</span>
          <span className="hero-banner-badge-heart">❤</span>
          <span>BIG SMILES</span>
        </div>
      </div>

      <div className="hero-banner-wave">
        <div className="hero-banner-wave-content">
          {FOOTER_ITEMS.map((item) => (
            <div key={item.title} className="hero-banner-wave-item">
              <div className="hero-banner-wave-icon">{item.icon}</div>
              <div>
                <h4 className="hero-banner-wave-title">{item.title}</h4>
                <p className="hero-banner-wave-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
