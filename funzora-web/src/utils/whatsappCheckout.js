import { getMerchantWhatsappDigits } from "../config/support";
import { formatPrice } from "./formatPrice";

/** Absolute product URL for wa.me links (prefer current origin). */
export function resolveStorefrontOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const env = String(
    import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || "",
  ).trim();
  return env.replace(/\/$/, "");
}

/** @param {string} productId */
export function resolveProductPageUrl(productId) {
  const id = String(productId || "").trim();
  if (!id) return `${resolveStorefrontOrigin()}/shop`;
  const base = resolveStorefrontOrigin();
  const path = `/product/${id}`;
  return base ? `${base}${path}` : path;
}

/**
 * Builds the structured WhatsApp order body (plain text, ready for encodeURIComponent).
 *
 * @param {object} opts
 * @param {{ name: string, quantity?: number, price?: number, productUrl: string, emoji?: string }[]} [opts.cartItems]
 * @param {{
 *   fullName: string,
 *   phone: string,
 *   city?: string,
 *   state?: string,
 *   pincode?: string,
 *   addressLine1?: string,
 *   addressLine2?: string,
 *   landmark?: string,
 * } | null} [opts.address]
 * @param {number} [opts.grandTotal] — inclusive total (e.g. subtotal + shipping). If omitted, derived from lines + shipping.
 * @param {number} [opts.shippingAmount] — shown when &gt; 0
 */
export function buildStructuredWhatsAppOrderMessage({
  cartItems = [],
  address = null,
  grandTotal: grandTotalOpt = null,
  shippingAmount = 0,
} = {}) {
  const lines = [];

  lines.push("Hi, I want to place an order:");
  lines.push("");
  lines.push("🛒 *Order Details*");
  lines.push("");

  let qtySum = 0;
  let lineMoney = 0;
  const baseUrl = `${resolveStorefrontOrigin()}/shop`;
  const items = cartItems.length
    ? cartItems
    : [
        {
          name: "Browse shop to confirm items",
          quantity: 1,
          price: 0,
          productUrl: baseUrl,
          emoji: "🛍️",
        },
      ];

  items.forEach((item, idx) => {
    const q = Math.max(1, Number(item.quantity) || 1);
    const unit = Number(item.price);
    const unitResolved = Number.isFinite(unit) && unit >= 0 ? unit : 0;
    const sub = unitResolved * q;
    qtySum += q;
    lineMoney += sub;

    const emoji = String(item.emoji || "🛍️").trim() || "🛍️";
    const name = String(item.name || "Product").trim() || "Product";
    const rawUrl = String(item.productUrl || "").trim();
    const url = rawUrl || baseUrl;

    lines.push(`${idx + 1}. ${emoji} ${name}`);
    lines.push(`Qty: ${q}`);
    lines.push(`Price: ${formatPrice(unitResolved)} each`);
    lines.push(`Subtotal: ${formatPrice(sub)}`);
    lines.push(`🔗 ${url}`);
    lines.push("");
  });

  lines.push("---");
  lines.push("");

  const a = address;
  const hasAddress =
    a && String(a.fullName || "").trim() && String(a.phone || "").trim();

  if (hasAddress) {
    lines.push("📦 *Delivery Address*");
    lines.push(String(a.fullName).trim());
    const streets = [];
    if (String(a.addressLine1 || "").trim())
      streets.push(String(a.addressLine1).trim());
    if (String(a.addressLine2 || "").trim())
      streets.push(String(a.addressLine2).trim());
    if (String(a.landmark || "").trim())
      streets.push(`Near ${String(a.landmark).trim()}`);
    streets.forEach((s) => lines.push(s));

    const city = String(a.city || "").trim();
    const state = String(a.state || "").trim();
    const pin = String(a.pincode || "").trim();
    const cs = [city, state].filter(Boolean).join(", ");
    if (cs || pin) {
      lines.push(cs && pin ? `${cs} - ${pin}` : cs || pin);
    }
    lines.push(`Phone: ${String(a.phone).trim()}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const ship = Number(shippingAmount);
  const shipOk = Number.isFinite(ship) && ship > 0;
  const totalNum =
    grandTotalOpt != null && Number.isFinite(Number(grandTotalOpt))
      ? Number(grandTotalOpt)
      : lineMoney + (shipOk ? ship : 0);

  lines.push("💰 *Order Summary*");
  lines.push(`Items: ${qtySum}`);
  if (shipOk) lines.push(`Shipping: ${formatPrice(ship)}`);
  lines.push(`Total: ${formatPrice(totalNum)}`);
  lines.push("");
  lines.push("Please confirm availability and delivery.");

  return lines.join("\n");
}

/**
 * Opens a chat with the **store** WhatsApp (`VITE_WHATSAPP_NUMBER` or default in support.js).
 *
 * @param {object} opts
 * @param {{ name: string, quantity?: number, price?: number, productUrl: string, emoji?: string }[]} [opts.cartItems]
 * @param {Parameters<typeof buildStructuredWhatsAppOrderMessage>[0]['address']} [opts.address]
 * @param {number} [opts.grandTotal]
 * @param {number} [opts.shippingAmount]
 */
export function createWhatsAppCheckoutLink({
  cartItems = [],
  address = null,
  grandTotal = null,
  shippingAmount = 0,
} = {}) {
  const merchantDigits = getMerchantWhatsappDigits();
  if (!merchantDigits) {
    return "#";
  }

  const message = buildStructuredWhatsAppOrderMessage({
    cartItems,
    address,
    grandTotal,
    shippingAmount,
  });

  return `https://wa.me/${merchantDigits}?text=${encodeURIComponent(message)}`;
}
