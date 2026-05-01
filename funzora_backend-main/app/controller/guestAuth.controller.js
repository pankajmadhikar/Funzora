const Customer = require("../models/customer.model");
const asyncHandler = require("../middlewares/async");
const { normalizeIndianPhone } = require("../utils/phone");

/**
 * WhatsApp shopper identity — no JWT. Creates or refreshes Customer by phone.
 * POST /api/v1/auth/whatsapp-login
 */
exports.whatsappLogin = asyncHandler(async (req, res) => {
  const phone = normalizeIndianPhone(req.body?.phone);

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit Indian mobile is required",
    });
  }

  let customer = await Customer.findOne({ phone });
  const now = new Date();

  if (!customer) {
    customer = await Customer.create({
      phone,
      lastActiveAt: now,
    });
  } else {
    customer.lastActiveAt = now;
    await customer.save();
  }

  return res.status(200).json({
    success: true,
    user: { phone },
  });
});
