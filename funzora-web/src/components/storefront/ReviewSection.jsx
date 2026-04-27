import React from 'react';
import './Reviews.css';

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=FunZora+toys+reviews';

function GoogleMark({ className, size = 18 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const REVIEWS = [
  {
    id: 1,
    name: 'Neha Sharma',
    date: '2 weeks ago',
    text: 'Amazing collection of toys! The quality is excellent and my son absolutely loves the wooden blocks set. Safe and perfect for learning.',
    img: 'https://i.pravatar.cc/150?u=neha',
  },
  {
    id: 2,
    name: 'Priya Verma',
    date: '3 weeks ago',
    text: 'Ordered a soft toy for my daughter and it\'s so soft and adorable! Delivery was quick and packaging was premium.',
    img: 'https://i.pravatar.cc/150?u=priya',
  },
  {
    id: 3,
    name: 'Rohit Singh',
    date: '1 month ago',
    text: 'FunZora is my go-to place for gifts now! Kids love the toys and I love the safe, non-toxic materials.',
    img: 'https://i.pravatar.cc/150?u=rohit',
  },
  {
    id: 4,
    name: 'Anita Patel',
    date: '1 month ago',
    text: 'Best customer service and amazing toy quality. Highly recommended for parents looking for safe toys.',
    img: 'https://i.pravatar.cc/150?u=anita',
  },
];

const TRUST_RIBBON = [
  {
    key: 'safe',
    icon: '🛡️',
    title: '100% Safe Materials',
    desc: 'Non-toxic, child-safe & BIS certified toys',
    iconClass: 'reviews-trust-icon--green',
  },
  {
    key: 'delivery',
    icon: '🚚',
    title: 'Pan India Delivery',
    desc: 'Fast & reliable delivery across India',
    iconClass: 'reviews-trust-icon--red',
  },
  {
    key: 'returns',
    icon: '🔄',
    title: '7-Day Easy Returns',
    desc: 'Hassle-free returns within 7 days',
    iconClass: 'reviews-trust-icon--purple',
  },
  {
    key: 'pay',
    icon: '🔒',
    title: 'Secure Payments',
    desc: 'Your payments are safe and protected',
    iconClass: 'reviews-trust-icon--orange',
  },
];

export default function ReviewSection() {
  return (
    <section className="reviews-container" aria-labelledby="reviews-heading">
      <div className="reviews-header">
        <p className="reviews-sub-title">PARENTS LOVE FUNZORA ❤</p>
        <h2 id="reviews-heading" className="reviews-main-title">
          What Parents <span>Say</span>
        </h2>
        <div className="reviews-google-rating">
          <span className="reviews-google-rating-text">Real reviews from real parents on Google</span>
          <GoogleMark className="reviews-google-logo" size={22} />
          <span className="reviews-rating-badge">4.8 ⭐</span>
        </div>
      </div>

      <div className="reviews-grid">
        {REVIEWS.map((rev) => (
          <article className="review-card" key={rev.id}>
            <div className="review-card-quote" aria-hidden="true">“</div>
            <p className="review-card-text">{rev.text}</p>
            <div className="review-card-stars" aria-label="5 out of 5 stars">
              <span className="review-card-star">★</span>
              <span className="review-card-star">★</span>
              <span className="review-card-star">★</span>
              <span className="review-card-star">★</span>
              <span className="review-card-star">★</span>
            </div>
            <div className="review-card-user">
              <img src={rev.img} alt="" className="review-card-avatar" width={40} height={40} loading="lazy" />
              <div className="review-card-user-details">
                <strong className="review-card-name">{rev.name}</strong>
                <span className="review-card-date">{rev.date}</span>
              </div>
              <span className="review-card-verify" title="Google review">
                <GoogleMark size={16} />
              </span>
            </div>
          </article>
        ))}
      </div>

      <a
        className="reviews-view-all"
        href={GOOGLE_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        View all reviews on Google →
      </a>

      <div className="reviews-trust-bar">
        {TRUST_RIBBON.map((b) => (
          <div className="reviews-trust-item" key={b.key}>
            <div className={`reviews-trust-icon ${b.iconClass}`}>{b.icon}</div>
            <div className="reviews-trust-copy">
              <strong>{b.title}</strong>
              <p>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
