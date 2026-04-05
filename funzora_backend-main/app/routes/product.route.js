const express = require("express");
const {
  addProduct,
  manageProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require("../controller/product.controller");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/").post(protect, authorize("admin"), addProduct);

router.route("/").get(getAllProducts);

router.route("/:id").get(getProductById);

router
  .route("/:id")
  .put(protect, authorize("admin"), manageProduct)
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
