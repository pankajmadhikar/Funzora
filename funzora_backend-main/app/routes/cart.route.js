const express = require("express");
const {
  addToCart,
  viewCart,
  checkoutCart,
  updateCartItemQuantity,
  removeCartItem,
} = require("../controller/cart.controller");

/** Guest cart — phone in body or ?phone=. No JWT. */
const router = express.Router();

router.route("/create-cart").post(addToCart).get(viewCart);

router.route("/checkout").post(checkoutCart);

router
  .route("/item/:productId")
  .put(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;
