const mongoose = require("mongoose");

/** Matches funzora-web `TOY_CATS` ids (excluding "all"). Empty = auto-map from category text on frontend. */
const SHOP_CATEGORY_IDS = [
  "outdoor",
  "creative",
  "sensory",
  "puzzles",
  "collect",
  "learning",
];

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

    // Storefront / admin (optional — used by enrichProduct on frontend)
    displayEmoji: { type: String, default: "" },
    ageLabel: { type: String, default: "" },
    isHot: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    features: [{ type: String }],
    shopCategoryId: {
      type: String,
      default: "",
      validate: {
        validator(v) {
          return v === "" || SHOP_CATEGORY_IDS.includes(v);
        },
        message: "shopCategoryId must be one of: " + SHOP_CATEGORY_IDS.join(", ") + ", or empty",
      },
    },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  const pct = Number(this.discountPercentage) || 0;
  this.actualAmount = this.price - this.price * (pct / 100);
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
