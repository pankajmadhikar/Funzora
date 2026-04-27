import { TOY_CATS, getCat } from '../config/toyStore';

const slug = (s) => String(s || '').toLowerCase();

/**
 * Map backend category / subCategory text to storefront category id.
 * Optional backend field `shopCategoryId` overrides.
 */
export function mapCategoryToShopId(category, subCategory, shopCategoryId) {
  if (shopCategoryId && TOY_CATS.some((c) => c.id === shopCategoryId)) {
    return shopCategoryId;
  }
  const c = `${slug(category)} ${slug(subCategory)}`;
  if (/outdoor|active|sport|water|bubble|rope|ball|yo-yo|lattoo|spinning/.test(c)) return 'outdoor';
  if (/creative|art|clay|crayon|sticker|sand art|dough|paint/.test(c)) return 'creative';
  if (/sensory|fidget|kinetic|duck|slime|sand\b/.test(c)) return 'sensory';
  if (/puzzle|game|card|snap/.test(c)) return 'puzzles';
  if (/action|collect|hero|figure|dart|led|spinner|blaster/.test(c)) return 'collect';
  if (/learn|edu|origami|kaleidoscope|book|stem/.test(c)) return 'learning';
  return 'creative';
}

function extractAgeFromText(text) {
  if (!text) return null;
  const m = String(text).match(/(\d+)\s*\+\s*(?:years?)?/i) || String(text).match(/age\s*(\d+)\s*\+/i);
  return m ? `${m[1]}+` : null;
}

function parseFeatures(p) {
  if (Array.isArray(p.features) && p.features.length) return p.features.slice(0, 8);
  if (p.specification) {
    return String(p.specification)
      .split(/\n|•|\|/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  return ['Non-toxic', 'Quality checked', 'Pan-India delivery', '7-day easy returns'];
}

/**
 * Enrich API product for playful UI. Uses optional backend fields when present:
 * displayEmoji, ageLabel, isHot, isNew, rating, reviewCount, features[], shopCategoryId
 */
export function enrichProduct(p) {
  if (!p || !p._id) return null;
  const displayCatId = mapCategoryToShopId(p.category, p.subCategory, p.shopCategoryId);
  const meta = getCat(displayCatId);
  const mrp = Number(p.mrp) || Number(p.price) || 0;
  const price = Number(p.price) || 0;
  const discountPct =
    p.discountPercentage != null
      ? Number(p.discountPercentage)
      : mrp > 0
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0;
  const hot = p.isHot === true || (p.isHot !== false && discountPct >= 35);
  const isNew = p.isNew === true;
  const age =
    p.ageLabel ||
    extractAgeFromText(p.subCategory) ||
    extractAgeFromText(p.description) ||
    extractAgeFromText(p.name) ||
    '3+';
  const emoji = p.displayEmoji || meta.icon;
  const rating = p.rating != null ? Number(p.rating) : 4.5;
  const rev = p.reviewCount != null ? Number(p.reviewCount) : 0;
  const feat = parseFeatures(p);
  const stock = p.availableQuantity ?? p.quantity ?? 0;

  return {
    ...p,
    _ui: {
      displayCatId,
      catMeta: meta,
      emoji,
      grad: meta.grad,
      txtColor: meta.txtColor,
      hot,
      isNew,
      age,
      rating,
      rev,
      feat,
      discountPct,
      stock,
    },
  };
}

export function enrichProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(enrichProduct).filter(Boolean);
}

export function discPct(price, mrp) {
  const m = Number(mrp);
  const p = Number(price);
  if (!m || m <= 0 || p >= m) return 0;
  return Math.round(((m - p) / m) * 100);
}
