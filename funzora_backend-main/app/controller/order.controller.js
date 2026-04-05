const Order = require("../models/order.model");
const asyncHandler = require("../middlewares/async");

// Get All Orders (Admin)
exports.getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", "name price")
      .populate("userId", "firstname lastname email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// Update Order Status (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Processing", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Valid statuses are: ${validStatuses.join(
        ", "
      )}`,
    });
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, data: order });
});
