export const calculateDiscount = (product, quantity) => {
  let currentPrice = product.price;
  let discounts = [];

  // Bulk purchase discounts
  if (product.discounts?.bulk) {
    // Sort by quantity in descending order to get the best applicable discount
    const applicableDiscount = product.discounts.bulk
      .sort((a, b) => b.quantity - a.quantity)
      .find(d => quantity >= d.quantity);

    if (applicableDiscount) {
      const discount = (currentPrice * applicableDiscount.percentage) / 100;
      currentPrice = currentPrice - discount;
      discounts.push({
        type: 'bulk',
        message: `Buy ₹{applicableDiscount.quantity} @₹₹{currentPrice.toFixed(2)}/pc`,
        profit: `₹{applicableDiscount.percentage}%`,
        profitAmount: `₹₹{discount.toFixed(2)}/pc`,
        quantity: applicableDiscount.quantity
      });
    }
  }

  // Cart total based discounts
  const cartTotal = currentPrice * quantity;
  if (product.discounts?.cart) {
    const applicableCartDiscount = product.discounts.cart
      .sort((a, b) => b.minAmount - a.minAmount)
      .find(d => cartTotal >= d.minAmount);

    if (applicableCartDiscount) {
      discounts.push({
        type: 'cart',
        message: `Extra ₹{applicableCartDiscount.percentage}% Off On Purchase Of ₹₹{applicableCartDiscount.minAmount}+ Orders`,
        code: null
      });
    }
  }

  // Coupon discounts
  if (product.discounts?.coupons) {
    product.discounts.coupons.forEach(coupon => {
      if (cartTotal >= coupon.minAmount) {
        discounts.push({
          type: 'coupon',
          message: `Flat ₹₹{coupon.amount} Off On ₹₹{coupon.minAmount}+ Orders`,
          code: coupon.code
        });
      }
    });
  }

  return {
    originalPrice: product.price,
    currentPrice,
    discounts
  };
}; 