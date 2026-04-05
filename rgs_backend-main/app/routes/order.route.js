const express = require("express");
const { getOrders, updateOrderStatus } = require("../controller/order.controller");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(protect, getOrders);
router.route("/status/:id").patch(protect, updateOrderStatus);

module.exports = router;
