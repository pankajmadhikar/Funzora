const mongoose = require("mongoose");

/** Shopper carts keyed by WhatsApp phone (no JWT). */
const CartSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
