const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Place = require("../models/Place");
const User = require("../models/User"); // [MỚI] Cần model này để lấy email khách
const sendEmail = require("../utils/sendEmail"); // [MỚI] Import hàm gửi thư

// Service xử lý việc tạo Booking
const createBookingService = async ({
  userId,
  type,
  target_id,
  bookingDate,
  quantity,
}) => {
  let totalPrice = 0;
  let eventRef = null;
  let placeRef = null;
  let targetName = ""; // Biến lưu tên địa điểm để hiển thị trong mail

  // 1. Logic cho Vé sự kiện
  if (type === "EventTicket") {
    const eventData = await Event.findById(target_id);
    if (!eventData) throw new Error("Event not found");

    if (eventData.availableTickets < quantity) {
      throw new Error("Not enough tickets available");
    }

    totalPrice = eventData.ticketPrice * quantity;
    targetName = eventData.name;

    // Trừ vé
    eventData.availableTickets -= quantity;
    await eventData.save();

    eventRef = target_id;
  }
  // 2. Logic cho Đặt bàn
  else if (type === "TableReservation") {
    const placeData = await Place.findById(target_id);
    if (!placeData) throw new Error("Place not found");

    totalPrice = placeData.price * quantity; // (Cập nhật: Tính tiền theo giá địa điểm * khách)
    targetName = placeData.name;

    placeRef = target_id;
  } else {
    throw new Error("Invalid booking type");
  }

  // 3. Lưu vào DB
  const newBooking = new Booking({
    user: userId,
    type,
    event: eventRef,
    place: placeRef,
    bookingDate,
    quantity,
    totalPrice,
    status: "Pending", // Mặc định là Chờ xử lý
    paymentStatus: "Unpaid",
  });

  const savedBooking = await newBooking.save();

  // --- [MỚI] GỬI EMAIL XÁC NHẬN ĐÃ NHẬN ĐƠN ---
  try {
    const user = await User.findById(userId); // Lấy thông tin khách hàng
    if (user && user.email) {
      const message = `
        <h3>Cảm ơn ${user.name} đã đặt vé tại TripPlanner!</h3>
        <p>Chúng tôi đã nhận được yêu cầu đặt chỗ của bạn:</p>
        <ul>
          <li><strong>Dịch vụ:</strong> ${targetName}</li>
          <li><strong>Ngày đi:</strong> ${new Date(
            bookingDate
          ).toLocaleDateString("vi-VN")}</li>
          <li><strong>Số lượng:</strong> ${quantity} khách</li>
          <li><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString()} VNĐ</li>
        </ul>
        <p>Trạng thái đơn hàng: <b style="color:orange">Đang chờ xác nhận</b>.</p>
        <p>Vui lòng chờ Admin kiểm tra thanh toán và duyệt đơn trong vòng 24h.</p>
      `;

      await sendEmail({
        email: user.email,
        subject: "TripPlanner - Xác nhận yêu cầu đặt vé",
        message,
      });
    }
  } catch (error) {
    console.log("Lỗi gửi mail (create): ", error.message);
    // Không ném lỗi ra ngoài để tránh việc đặt vé thành công mà báo lỗi chỉ vì mail hỏng
  }
  // ----------------------------------------------

  return savedBooking;
};

// Service lấy lịch sử booking
const getMyBookingsService = async (userId) => {
  return await Booking.find({ user: userId })
    .populate("event", "name locationString ticketPrice")
    .populate("place", "name address image")
    .sort({ createdAt: -1 });
};

// Service lấy tất cả booking (Cho Admin)
const getAllBookingsService = async () => {
  return await Booking.find({})
    .populate("user", "name email")
    .populate("place", "name image")
    .sort({ createdAt: -1 });
};

// Service cập nhật trạng thái đơn (Duyệt/Hủy)
const updateStatusService = async (bookingId, status) => {
  // [MỚI] Populate user, place, event để có thông tin gửi mail
  const booking = await Booking.findById(bookingId)
    .populate("user", "name email")
    .populate("place", "name")
    .populate("event", "name");

  if (!booking) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  booking.status = status;
  const updatedBooking = await booking.save();

  // --- [MỚI] GỬI EMAIL THÔNG BÁO KẾT QUẢ ---
  try {
    if (booking.user && booking.user.email) {
      let subject = "";
      let message = "";
      const targetName =
        booking.place?.name || booking.event?.name || "Dịch vụ";

      if (status === "Confirmed") {
        subject = "TripPlanner - Vé của bạn đã được XÁC NHẬN! ✅";
        message = `
            <h3>Xin chào ${booking.user.name},</h3>
            <p>Tin vui! Đơn đặt chỗ <strong>${targetName}</strong> của bạn đã được Admin xác nhận thành công.</p>
            <p>Hãy chuẩn bị hành lý và tận hưởng chuyến đi nhé!</p>
            <hr/>
            <p style="font-size:12px; color:gray">Cảm ơn bạn đã tin tưởng TripPlanner.</p>
        `;
      } else if (status === "Cancelled") {
        subject = "TripPlanner - Thông báo Hủy đơn ❌";
        message = `
            <h3>Xin chào ${booking.user.name},</h3>
            <p>Rất tiếc, đơn đặt chỗ <strong>${targetName}</strong> của bạn đã bị hủy.</p>
            <p>Vui lòng liên hệ bộ phận hỗ trợ nếu có thắc mắc.</p>
        `;
      }

      if (subject) {
        await sendEmail({ email: booking.user.email, subject, message });
      }
    }
  } catch (error) {
    console.log("Lỗi gửi mail (update): ", error.message);
  }
  // ------------------------------------------

  return updatedBooking;
};

module.exports = {
  createBookingService,
  getMyBookingsService,
  getAllBookingsService,
  updateStatusService,
};
