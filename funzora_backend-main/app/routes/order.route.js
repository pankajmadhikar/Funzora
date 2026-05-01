const express = require("express");
const { getOrders, updateOrderStatus } = require("../controller/order.controller");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(protect, authorize("admin"), getOrders);
router.route("/status/:id").patch(protect, authorize("admin"), updateOrderStatus);

module.exports = router;
