import React from 'react';

const CATEGORY_CONFIG = {
  outdoor:  { bg: 'linear-gradient(135deg, #D4F5E2, #A8E6C8)', emoji: '🌿', color: '#1a6b40' },
  creative: { bg: 'linear-gradient(135deg, #FFE5D4, #FFCBA8)', emoji: '🎨', color: '#9b4a1a' },
  sensory:  { bg: 'linear-gradient(135deg, #E8E0FF, #CDBFFF)', emoji: '🧠', color: '#4a2db5' },
  puzzles:  { bg: 'linear-gradient(135deg, #FFD6EC, #FFB3D9)', emoji: '🧩', color: '#8b1a5a' },
  collect:  { bg: 'linear-gradient(135deg, #D4EEFF, #A8D8FF)', emoji: '🦸', color: '#1a4a8b' },
  learning: { bg: 'linear-gradient(135deg, #FFF3CC, #FFE080)', emoji: '📚', color: '#7a5c00' },
  default:  { bg: 'linear-gradient(135deg, #F0F0F5, #E0E0EA)', emoji: '🎁', color: '#555770' },
};

const sizeMap = {
  xs:   { container: 48,  emoji: '1.4rem' },
  sm:   { container: 72,  emoji: '2rem' },
  md:   { container: 120, emoji: '3rem' },
  lg:   { container: 180, emoji: '4.5rem' },
  full: { container: '100%', emoji: '4rem' },
};

export function ProductThumbnail({ category = 'default', size = 'md', className = '', style = {} }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`product-thumbnail ${className}`}
      style={{
        width: s.container,
        height: size === 'full' ? '100%' : s.container,
        minHeight: size === 'full' ? 120 : undefined,
        background: config.bg,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.emoji,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {config.emoji}
    </div>
  );
}

export function ProductImage({ product, size = 'full', className = '' }) {
  const catId = product?._ui?.displayCatId || product?.category || 'default';
  const imageUrl = product?.images?.[0];

  if (!imageUrl) {
    return <ProductThumbnail category={catId} size={size} className={className} />;
  }

  return (
    <div
      className={className}
      style={{
        width: size === 'full' ? '100%' : (sizeMap[size]?.container || 120),
        height: size === 'full' ? '100%' : (sizeMap[size]?.container || 120),
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <img
        src={imageUrl}
        alt={product?.name || ''}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
        }}
      />
      <ProductThumbnail
        category={catId}
        size={size}
        style={{ display: 'none', position: 'absolute', inset: 0 }}
      />
    </div>
  );
}

export default ProductThumbnail;
