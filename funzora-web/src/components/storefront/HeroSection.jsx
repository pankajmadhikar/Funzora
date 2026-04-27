import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Heart, Leaf, Shield, Sparkles } from 'lucide-react';
import heroBg from '../../assets/Banners/hero-bg-toys.png';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';
import './HeroSection.css';

const FOOTER_ITEMS = [
  { Icon: Leaf, title: 'Beautifully Crafted', desc: 'Made with love and attention to detail.' },
  { Icon: Shield, title: 'Safe for Your Little Ones', desc: 'High-quality, non-toxic materials you can trust.' },
  { Icon: Sparkles, title: 'Encourages Imagination', desc: 'Inspires creativity, learning and endless adventures.' },
  { Icon: Gift, title: 'Perfect for Every Occasion', desc: 'Birthdays, celebrations or just because!' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-banner" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="hero-banner-content">
        <div className="hero-banner-tagline">
          <span>PLAY. SMILE. GROW.</span>
          <Heart size={14} strokeWidth={ICON_STROKE} className="hero-banner-tagline-heart" aria-hidden />
        </div>

        <h1 className="hero-banner-title">
          Toys That<br />
          <span className="hero-banner-title-accent">Create Joy</span>
        </h1>

        <p className="hero-banner-desc">
          Premium soft toys and engaging hard toys<br />
          for endless fun and imaginative play.
        </p>

        <button type="button" className="hero-banner-cta" onClick={() => navigate('/shop')}>
          SHOP NOW <span className="hero-banner-cta-arrow">›</span>
        </button>
      </div>

      <div className="hero-banner-badge">
        <div className="hero-banner-badge-inner">
          <span>SOFT HUGS</span>
          <Heart size={16} strokeWidth={ICON_STROKE} className="hero-banner-badge-heart" aria-hidden />
          <span>BIG SMILES</span>
        </div>
      </div>

      <div className="hero-banner-wave">
        <div className="hero-banner-wave-content">
          {FOOTER_ITEMS.map(({ Icon, title, desc }) => (
            <div key={title} className="hero-banner-wave-item">
              <div className="hero-banner-wave-icon" aria-hidden>
                <Icon size={ICON_SIZES.md} strokeWidth={ICON_STROKE} />
              </div>
              <div>
                <h4 className="hero-banner-wave-title">{title}</h4>
                <p className="hero-banner-wave-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
