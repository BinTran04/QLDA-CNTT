const express = require("express");
const router = express.Router();
const { updateUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); // Import middleware bảo vệ

// Định nghĩa đường dẫn
router.put("/profile", protect, updateUserProfile);

module.exports = router;
