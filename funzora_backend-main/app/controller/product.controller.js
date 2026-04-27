const productModel = require("../models/product.model");
const asyncHandler = require("../middlewares/async");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");

exports.addProduct = asyncHandler(async (req, res) => {
  let products = req.body?.products;

  // Allow sample JSON shape: { "exampleBulkInsert": { "products": [...] } }
  if (!products && req.body?.exampleBulkInsert?.products) {
    products = req.body.exampleBulkInsert.products;
  }

  // Raw array body (some clients POST [] directly)
  if (!products && Array.isArray(req.body)) {
    products = req.body;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message:
        'Body must include a non-empty "products" array. Example: { "products": [ { "name", "mrp", "price", "quantity", "availableQuantity", ... } ] }. Do not send only "requiredFieldsPerProduct" or the whole sample file without the "products" wrapper.',
    });
  }

  products.forEach((product) => {
    const pct = Number(product.discountPercentage) || 0;
    product.discountPercentage = pct;
    product.actualAmount = product.price - product.price * (pct / 100);
  });

  const createdProducts = await productModel.insertMany(products);

  res.status(201).json({ success: true, data: createdProducts });
});

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await productModel
    .find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: products });
});

// Get product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  res.status(200).json({ success: true, data: product });
});

exports.manageProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  if (productData.price || productData.discountPercentage) {
    productData.actualAmount =
      productData.price -
      productData.price * (productData.discountPercentage / 100);
  }

  const updatedProduct = await productModel.findByIdAndUpdate(id, productData, {
    new: true,
  });

  res.status(200).json({ success: true, data: updatedProduct });
});

// exports.deleteProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   await productModel.findByIdAndDelete(id);

//   res
//     .status(200)
//     .json({ success: true, message: "Product deleted successfully" });
// });


exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if the product exists
  const product = await productModel.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Check if product exists in any "Processing" order
  const existingOrder = await Order.findOne({
    "products.productId": id,
    status: "Processing",
  });

  if (existingOrder) {
    return res.status(400).json({
      success: false,
      message: "This product cannot be deleted as it is part of a processing order.",
    });
  }

  // Soft delete: Mark product as deleted
  product.isDeleted = true;
  await product.save();

  // Remove the product from all carts
  await Cart.updateMany(
    { "items.productId": id },
    { $pull: { items: { productId: id } } }
  );

  res.status(200).json({ success: true, message: "Product hidden successfully" });
});