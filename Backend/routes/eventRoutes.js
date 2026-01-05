const express = require("express");
const router = express.Router();
const { getEvents } = require("../controllers/eventController");

router.get("/", getEvents); // Định nghĩa đường dẫn gốc

module.exports = router;
