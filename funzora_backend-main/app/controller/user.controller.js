const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const asyncHandler = require("../middlewares/async");

exports.registerUser = asyncHandler(async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password } = req.body;

    // Check if email or phone already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await userModel.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
    });

    // Remove sensitive data before sending the response
    user.password = undefined;

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Staff login only. Customers check out with WhatsApp on the store.",
    });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET
  );

  const userData = {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role || "user",
  };

  res.status(200).json({
    success: true,
    token,
    user: userData,
  });
});
