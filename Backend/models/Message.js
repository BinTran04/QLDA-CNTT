const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    placeName: { type: String, required: true },
    author: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, required: true },
    // Mặc định là false (chưa đọc)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
