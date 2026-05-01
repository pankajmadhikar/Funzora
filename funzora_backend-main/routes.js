const UserRouter = require("./app/routes/user.route");
const AuthRoutes = require("./app/routes/auth.route");
const ProductRoutes = require("./app/routes/product.route");
const OrderRoutes = require("./app/routes/order.route");
const CartRoutes = require("./app/routes/cart.route");
const UploadRoutes = require("./app/routes/uplaod.route");

function setupRoutes(app) {
  app.use("/api/v1/auth", AuthRoutes);
  app.use("/api/v1/users", UserRouter);
  app.use("/api/v1/products", ProductRoutes);
  app.use("/api/v1/orders", OrderRoutes);
  app.use("/api/v1/carts", CartRoutes);
  app.use("/api/v1/upload", UploadRoutes);
}

module.exports = setupRoutes;
