const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    place: {
      // Review cho địa điểm nào
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Place",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Thang điểm 5 sao
    },
    comment: {
      type: String,
      required: true,
    },
    // Mảng chứa link ảnh user upload lên
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
