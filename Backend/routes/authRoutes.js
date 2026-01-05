const express = require("express");
const router = express.Router();
const { registerUser, authUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/register", registerUser);

module.exports = router;
