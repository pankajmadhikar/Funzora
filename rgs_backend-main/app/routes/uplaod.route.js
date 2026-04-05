const express = require("express");
const { upload } = require("../middlewares/multer");
const { uploadToS3 } = require("../controller/upload.controller");

const router = express.Router();

// Define the file upload route
router.post("/file/s3upload", upload.single("file"), uploadToS3);

module.exports = router;
