const mongoose = require("mongoose");

// 1. Tạo Schema con cho Review (Lưu người comment, số sao, nội dung)
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const placeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Ảnh bìa chính

    gallery: [{ type: String }],

    price: { type: Number, required: true, default: 0 },
    country: { type: String, required: true }, // Ví dụ: Việt Nam, Pháp...

    mapEmbed: { type: String, required: false },

    reviews: [reviewSchema], // Chứa danh sách bình luận
    rating: { type: Number, required: true, default: 5 }, // Điểm trung bình (VD: 4.5)
    numReviews: { type: Number, required: true, default: 0 }, // Tổng số người đánh giá
  },
  {
    timestamps: true,
  }
);

const Place = mongoose.model("Place", placeSchema);
module.exports = Place;
