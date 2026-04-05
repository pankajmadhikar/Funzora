const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    category: { type: String, required: false },
    subCategory: { type: String, required: false },
    name: { type: String, required: false },
    description: { type: String, required: false },
    specification: { type: String, required: false },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    actualAmount: { type: Number, required: true },
    images: [{ type: String, required: false }],
    quantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  this.actualAmount = this.price - this.price * (this.discountPercentage / 100);
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
