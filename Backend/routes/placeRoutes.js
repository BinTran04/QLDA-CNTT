const express = require("express");
const router = express.Router();
const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  createPlaceReview,
} = require("../controllers/placeController");

// Import middleware bảo vệ
const { protect, admin } = require("../middleware/authMiddleware");

// Khách xem được list, nhưng chỉ Admin mới được tạo (POST)
router.route("/").get(getPlaces).post(protect, admin, createPlace);

// THÊM ROUTE REVIEW:
router.route("/:id/reviews").post(protect, createPlaceReview);

// Khách xem chi tiết, nhưng chỉ Admin mới được sửa (PUT) và xóa (DELETE)
router
  .route("/:id")
  .get(getPlaceById)
  .put(protect, admin, updatePlace)
  .delete(protect, admin, deletePlace);

module.exports = router;
