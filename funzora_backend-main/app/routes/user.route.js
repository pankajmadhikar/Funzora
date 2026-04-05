const express = require("express");
const { registerUser, loginUser } = require("../controller/user.controller");

const router = express.Router();

//REGISTER
router.route("/register").post(registerUser);

//LOGIN
router.route("/login").post(loginUser);


module.exports = router;
