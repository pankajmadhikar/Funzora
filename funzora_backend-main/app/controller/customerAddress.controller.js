const Customer = require("../models/customer.model");
const asyncHandler = require("../middlewares/async");
const { normalizeIndianPhone } = require("../utils/phone");

function normalizeAddressPayload(bodyAddress = {}) {
  const deliveryPhone =
    normalizeIndianPhone(bodyAddress.phone) ||
    String(bodyAddress.phone || "").replace(/\D/g, "").slice(-10);

  const pin = String(bodyAddress.pincode || "").replace(/\D/g, "").slice(0, 6);

  return {
    fullName: String(bodyAddress.fullName || "").trim(),
    phone: deliveryPhone?.length === 10 ? deliveryPhone : "",
    pincode: pin,
    city: String(bodyAddress.city || "").trim(),
    state: String(bodyAddress.state || "").trim(),
    addressLine1: String(bodyAddress.addressLine1 || "").trim(),
    addressLine2: String(bodyAddress.addressLine2 || "").trim(),
    landmark: String(bodyAddress.landmark || "").trim(),
  };
}

/** POST /api/v1/user/address/save */
exports.saveAddress = asyncHandler(async (req, res) => {
  const phone = normalizeIndianPhone(req.body?.phone);

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit shopper phone is required",
    });
  }

  const incoming = normalizeAddressPayload(req.body?.address ?? {});

  if (!incoming.fullName) {
    return res.status(400).json({ success: false, message: "Full name is required" });
  }
  if (!incoming.phone || incoming.phone.length !== 10 || !/^[6-9]/.test(incoming.phone)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit delivery phone is required",
    });
  }
  if (!incoming.addressLine1) {
    return res.status(400).json({
      success: false,
      message: "Address line 1 is required",
    });
  }
  if (!incoming.city || !incoming.state || !incoming.pincode) {
    return res.status(400).json({
      success: false,
      message: "City, state, and pincode are required",
    });
  }

  const now = new Date();
  let customer = await Customer.findOne({ phone });

  if (!customer) {
    customer = await Customer.create({
      phone,
      lastActiveAt: now,
      address: incoming,
    });
  } else {
    if (!customer.address) {
      customer.address = incoming;
    } else {
      Object.assign(customer.address, incoming);
    }
    customer.lastActiveAt = now;
    customer.markModified("address");
    await customer.save();
  }

  const fresh = await Customer.findOne({ phone }).select("address");

  res.status(200).json({
    success: true,
    address: fresh?.address ?? null,
  });
});

/** GET /api/v1/user/address/:phone */
exports.getAddressByPhone = asyncHandler(async (req, res) => {
  let raw = req.params.phone;
  try {
    raw = decodeURIComponent(raw);
  } catch (_) {
    /* ignore */
  }

  const phone = normalizeIndianPhone(raw);

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Valid phone param required",
    });
  }

  const customer = await Customer.findOne({ phone }).select("address");

  if (!customer?.address?.fullName) {
    return res.status(200).json({ success: true, address: null });
  }

  res.status(200).json({
    success: true,
    address: customer.address,
  });
});
