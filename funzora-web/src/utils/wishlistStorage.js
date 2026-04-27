const KEY = 'funzo_wishlist_ids';

export function getWishlistIds() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setWishlistIds(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleWishlist(productId) {
  const id = String(productId);
  const cur = getWishlistIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  setWishlistIds(next);
  return next.includes(id);
}

export function isInWishlist(productId) {
  return getWishlistIds().includes(String(productId));
}
