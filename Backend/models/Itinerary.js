const mongoose = require("mongoose");

const itinerarySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Liên kết với bảng User
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      // Tổng chi phí dự kiến
      type: Number,
      default: 0,
    },
    // Chi tiết lịch trình: Đi đâu, vào giờ nào
    places: [
      {
        place: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Place", // Liên kết với bảng Place
        },
        date: { type: Date, required: true }, // Ngày giờ ghé thăm
        notes: { type: String }, // Ghi chú cá nhân (ví dụ: "Nhớ mang máy ảnh")
      },
    ],
    isPublic: {
      // Tính năng chia sẻ lịch trình
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Itinerary = mongoose.model("Itinerary", itinerarySchema);
module.exports = Itinerary;
