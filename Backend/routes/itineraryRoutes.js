const express = require("express");
const router = express.Router();
const {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  addPlaceToItinerary,
} = require("../controllers/itineraryController");
const { protect } = require("../middleware/authMiddleware"); // Import bảo vệ

// Gắn hàm protect vào trước các hàm xử lý
router.route("/").post(protect, createItinerary).get(protect, getMyItineraries);

router.get("/:id", protect, getItineraryById);

router.post("/:id/places", protect, addPlaceToItinerary);

module.exports = router;
