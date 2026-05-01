const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 });

module.exports = mongoose.model("Customer", CustomerSchema);
