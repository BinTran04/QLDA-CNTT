const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // Loại booking: Mua vé sự kiện hay Đặt bàn ăn uống
    type: {
      type: String,
      enum: ["EventTicket", "TableReservation"],
      required: true,
    },
    // Nếu là đặt vé thì điền event_id
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    // Nếu là đặt bàn thì điền place_id
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
    bookingDate: {
      // Ngày sử dụng dịch vụ
      type: Date,
      required: true,
    },
    quantity: {
      // Số lượng vé hoặc số người ăn
      type: Number,
      required: true,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      // Trạng thái thanh toán
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    expireAt: {
      type: Date,
      default: null, // Mặc định là null (không bao giờ xóa)
      index: { expires: 0 }, // MongoDB sẽ tự xóa khi thời gian hiện tại > expireAt
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
