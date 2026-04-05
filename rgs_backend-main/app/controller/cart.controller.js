const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const asyncHandler = require("../middlewares/async");

// Add to Cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate input
  if (!quantity || quantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity must be at least 1" });
  }

  // Fetch the product to check availability
  const product = await Product.findById(productId);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  if (quantity > product.availableQuantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.availableQuantity} units of this product are available`,
    });
  }

  // Fetch the user's cart
  let cart = await Cart.findOne({ userId: req.user.id });

  if (cart) {
    // Find the product in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Check if the new quantity exceeds availableQuantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;

      if (newQuantity > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `You can only add up to ${
            product.availableQuantity - cart.items[itemIndex].quantity
          } more units of this product`,
        });
      }

      // Update the quantity in the cart
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Add new item to the cart
      cart.items.push({ productId, quantity });
    }
  } else {
    // Create a new cart if none exists
    cart = new Cart({
      userId: req.user.id,
      items: [{ productId, quantity }],
    });
  }

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

// View Cart
exports.viewCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate(
    "items.productId",
  );

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart is empty" });
  }

  res.status(200).json({ success: true, data: cart });
});

// Checkout Cart
exports.checkoutCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate(
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
    (total, item) => total + item.productId.price * item.quantity,
    0
  );

  const order = new Order({
    userId: req.user.id,
    products: cart.items,
    totalAmount,
  });

  await order.save();

  await Cart.findOneAndDelete({ userId: req.user.id });

  res.status(201).json({ success: true, data: order });
});

// Update Cart Item Quantity
exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { action } = req.body;

  // Validate action
  if (!["increase", "decrease"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'increase' or 'decrease'",
    });
  }

  // Fetch the product to check availability
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Fetch the user's cart
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Find the product in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found in cart" });
  }

  const cartItem = cart.items[itemIndex];

  // Update quantity based on action
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
      return res
        .status(400)
        .json({ success: false, message: "Quantity cannot be less than 1" });
    }
    cartItem.quantity -= 1;
  }

  // Save the updated cart
  await cart.save();

  res.status(200).json({ success: true, data: cart });
});


exports.removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found in cart" });
  }

  cart.items.splice(itemIndex, 1);

  if (cart.items.length === 0) {
    await Cart.findOneAndDelete({ userId: req.user.id });
    return res.status(200).json({ success: true, message: "Cart is now empty" });
  }

  await cart.save();

  res.status(200).json({ success: true, message: "Item removed from cart", data: cart });
});
