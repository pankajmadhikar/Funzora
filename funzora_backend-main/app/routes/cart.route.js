const express = require("express");
const {
  addToCart,
  viewCart,
  checkoutCart,
  updateCartItemQuantity,
  removeCartItem
} = require("../controller/cart.controller");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.route("/create-cart").post(protect, addToCart).get(protect, viewCart);

router.route("/item/:productId").put(protect, updateCartItemQuantity);

router.route("/checkout").post(protect, checkoutCart);

router.route("/item/:productId").delete(protect, removeCartItem);


module.exports = router;
