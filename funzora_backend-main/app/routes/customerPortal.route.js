const express = require("express");
const {
  saveAddress,
  getAddressByPhone,
} = require("../controller/customerAddress.controller");

/** Guest shopper portal — keyed by phone, no JWT. */
const router = express.Router();

router.post("/address/save", saveAddress);
router.get("/address/:phone", getAddressByPhone);

module.exports = router;
