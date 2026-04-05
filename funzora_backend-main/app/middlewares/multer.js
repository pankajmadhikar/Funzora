const multer = require("multer");

const storage = multer.memoryStorage();

// Export upload using CommonJS syntax
const upload = multer({ storage: storage });

module.exports = { upload };
