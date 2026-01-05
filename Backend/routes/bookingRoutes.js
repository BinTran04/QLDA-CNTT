const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protect, admin } = require("../middleware/authMiddleware");

// Route cũ
router
  .route("/")
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route("/my-bookings").get(protect, getMyBookings);

// THÊM DÒNG NÀY: Route xử lý duyệt/hủy (Chỉ Admin mới được dùng)
router.route("/:id").put(protect, admin, updateBookingStatus);

module.exports = router;
