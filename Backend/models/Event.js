const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },

    // Sự kiện thường diễn ra tại một địa điểm có sẵn hoặc địa chỉ riêng
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
    locationString: { type: String }, // Địa chỉ cụ thể nếu không thuộc Place nào

    startDate: { type: Date, required: true },
    endDate: { type: Date },

    // Quản lý vé (Ticket) trực tiếp trong Event cho đơn giản hoá MVP
    ticketPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    availableTickets: {
      // Số lượng vé còn lại
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
