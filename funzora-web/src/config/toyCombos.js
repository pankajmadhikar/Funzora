/**
 * Combo deals: match products by name substring (case-insensitive).
 * When all three match, "Add all" adds each to cart via API.
 */
export const TOY_COMBOS = [
  {
    id: 'c1',
    name: 'Creative starter',
    desc: 'Puzzle picks + a second toy from your catalog (3rd slot can stay open)',
    emoji: '🎨',
    color: '#FF6B35',
    matchNames: ['puzzle', 'bubble', 'crayon'],
  },
  {
    id: 'c2',
    name: 'Outdoor fun bundle',
    desc: 'Outdoor / bubble toys — keywords match name, category, or description',
    emoji: '🌿',
    color: '#2ECC71',
    matchNames: ['bubble', 'jigsaw', 'outdoor'],
  },
  {
    id: 'c3',
    name: 'Playroom pair',
    desc: 'Forest / puzzle vibes + bubbles when both are in stock',
    emoji: '🧩',
    color: '#7B4FFF',
    matchNames: ['forest', 'bubble', '48'],
  },
];

function productHaystack(p) {
  const bits = [
    p?.name,
    p?.category,
    p?.subCategory,
    p?.description,
    p?.shopCategoryId,
  ];
  return bits.map((s) => String(s || '').toLowerCase()).join(' ');
}

/**
 * One product per slot; searches name, category, description, etc.
 */
export function resolveComboProducts(products, combo) {
  if (!Array.isArray(products) || !combo?.matchNames?.length) return [];
  const used = new Set();
  const out = [];
  for (const needle of combo.matchNames) {
    const n = String(needle).toLowerCase();
    const found = products.find((p) => {
      const id = String(p?._id ?? '');
      if (!id || used.has(id)) return false;
      return productHaystack(p).includes(n);
    });
    if (found) {
      used.add(String(found._id));
      out.push(found);
    }
  }
  return out;
}
