const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const asyncHandler = require("../middlewares/async");
const { normalizeIndianPhone } = require("../utils/phone");

function requirePhone(body, query = {}) {
  return normalizeIndianPhone(body?.phone ?? query.phone);
}

// Add to Cart
exports.addToCart = asyncHandler(async (req, res) => {
  const phone = requirePhone(req.body);
  const { productId, quantity } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit phone is required",
    });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (quantity > product.availableQuantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.availableQuantity} units of this product are available`,
    });
  }

  let cart = await Cart.findOne({ phone });

  if (cart) {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;

      if (newQuantity > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `You can only add up to ${
            product.availableQuantity - cart.items[itemIndex].quantity
          } more units of this product`,
        });
      }

      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  } else {
    cart = await Cart.create({
      phone,
      items: [{ productId, quantity }],
    });
  }

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

exports.viewCart = asyncHandler(async (req, res) => {
  const phone = requirePhone(req.body, req.query);

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "phone query or body required (10-digit Indian mobile)",
    });
  }

  const cart = await Cart.findOne({ phone }).populate(
    "items.productId",
  );

  if (!cart || cart.items.length === 0) {
    return res.status(200).json({
      success: true,
      data: { phone, items: [], _empty: true },
    });
  }

  res.status(200).json({ success: true, data: cart });
});

exports.checkoutCart = asyncHandler(async (req, res) => {
  const phone = requirePhone(req.body, req.query);
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "phone is required for checkout",
    });
  }

  const cart = await Cart.findOne({ phone }).populate(
    "items.productId",
    "name price"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty. Add items to checkout",
    });
  }

  const totalAmount = cart.items.reduce(
    (total, item) =>
      total + (item.productId?.price ?? 0) * (item.quantity || 0),
    0
  );

  const order = await Order.create({
    customerPhone: phone,
    products: cart.items.map((item) => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
    })),
    totalAmount,
  });

  await Cart.findOneAndDelete({ phone });

  res.status(201).json({ success: true, data: order });
});

exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
  const phone = requirePhone(req.body, req.query);
  const { productId } = req.params;
  const { action } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "phone is required",
    });
  }

  if (!["increase", "decrease"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'increase' or 'decrease'",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const cart = await Cart.findOne({ phone });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found in cart",
    });
  }

  const cartItem = cart.items[itemIndex];

  if (action === "increase") {
    if (cartItem.quantity + 1 > product.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.availableQuantity} units of this product are available`,
      });
    }
    cartItem.quantity += 1;
  } else if (action === "decrease") {
    if (cartItem.quantity - 1 < 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      cartItem.quantity -= 1;
    }
  }

  if (cart.items.length === 0) {
    await Cart.findOneAndDelete({ phone });
    return res.status(200).json({
      success: true,
      message: "Cart is now empty",
      data: { phone, items: [] },
    });
  }

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const phone = requirePhone(req.body, req.query);
  const { productId } = req.params;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "phone is required",
    });
  }

  const cart = await Cart.findOne({ phone });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found in cart",
    });
  }

  cart.items.splice(itemIndex, 1);

  if (cart.items.length === 0) {
    await Cart.findOneAndDelete({ phone });
    return res.status(200).json({
      success: true,
      message: "Cart is now empty",
      data: { phone, items: [] },
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    data: cart,
  });
});
