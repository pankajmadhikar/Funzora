const DEFAULT_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';

export function createWhatsAppCheckoutLink({
  products = [],
  giftWrap = false,
  giftMessage = '',
  pincode = '',
  deliveryDate = '',
}) {
  const lines = products.length
    ? products.map((item, idx) => `${idx + 1}) ${item.name} - Qty ${item.quantity || 1}`)
    : ['1) I need help choosing a toy gift'];

  const message = [
    'Hi FunZora team! I want to order:',
    '',
    ...lines,
    '',
    `Gift wrap: ${giftWrap ? 'Yes' : 'No'}`,
    `Message card: ${giftMessage || 'NA'}`,
    `Delivery pincode: ${pincode || 'NA'}`,
    `Need delivery by: ${deliveryDate || 'NA'}`,
    '',
    'Please confirm total and payment link.',
  ].join('\n');

  return `https://wa.me/${DEFAULT_NUMBER}?text=${encodeURIComponent(message)}`;
}
