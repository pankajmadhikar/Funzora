/**
 * WhatsApp deep links (wa.me) — works on mobile (app) and desktop (web/app).
 * Set VITE_WHATSAPP_NUMBER in .env (digits with country code, e.g. 919876543210).
 */
export const WHATSAPP_DEFAULT_NUMBER = "7397839266";

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I want to know more about your toys";

export function getWhatsappUrl() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER ?? WHATSAPP_DEFAULT_NUMBER;
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  const message = encodeURIComponent(
    import.meta.env.VITE_WHATSAPP_MESSAGE || WHATSAPP_DEFAULT_MESSAGE,
  );
  return `https://wa.me/${digits}?text=${message}`;
}
