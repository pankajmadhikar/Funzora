const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const userModel = require("../models/user.model");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: `Unauthorized User. Please Login!` });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded.userId);
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: `Unauthorized User. Please Login!` });
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to perform this action.",
        });
    }
    next();
  };
};
