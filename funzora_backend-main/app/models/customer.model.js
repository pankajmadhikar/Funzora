const mongoose = require("mongoose");

/** Single saved delivery profile per customer (multiple addresses planned later). */
const DeliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    /** Contact number for delivery (may match WhatsApp identity). */
    phone: { type: String, trim: true },
    pincode: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true, default: "" },
    landmark: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

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
    address: {
      type: DeliveryAddressSchema,
      default: null,
    },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 });

module.exports = mongoose.model("Customer", CustomerSchema);
