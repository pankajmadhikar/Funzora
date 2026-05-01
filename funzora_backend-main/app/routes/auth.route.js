const express = require("express");
const { whatsappLogin } = require("../controller/guestAuth.controller");

const router = express.Router();

router.post("/whatsapp-login", whatsappLogin);

module.exports = router;
