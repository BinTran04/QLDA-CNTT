const bookingService = require("../services/bookingService");
const Booking = require("../models/Booking");

// @desc    Tạo booking mới
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    // Controller chỉ nhận dữ liệu từ req.body và req.user
    const { type, target_id, bookingDate, quantity } = req.body;
    const userId = req.user._id;

    // Gọi Service để xử lý (không cần biết bên trong làm gì)
    const newBooking = await bookingService.createBookingService({
      userId,
      type,
      target_id,
      bookingDate,
      quantity,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    // Xử lý mã lỗi linh hoạt hơn
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Lấy lịch sử booking
// @route   GET /api/bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getMyBookingsService(req.user._id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái booking (Admin only)
// @route   PUT /api/bookings/:id
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Gọi service để cập nhật trạng thái như bình thường
    const updatedBooking = await bookingService.updateStatusService(id, status);

    // 2. LOGIC MỚI: Nếu là Confirmed hoặc Cancelled -> Đặt lịch xóa sau 30 ngày
    if (status === "Confirmed" || status === "Cancelled") {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30); // Lấy ngày hiện tại cộng thêm 30 ngày

      // Cập nhật trường expireAt vào Database
      await Booking.findByIdAndUpdate(id, { expireAt: expireDate });

      // (Nếu bạn muốn kiểm tra ngay lập tức, hãy thử cộng +1 phút: expireDate.setMinutes(expireDate.getMinutes() + 1))
    } else {
      // Nếu chuyển về trạng thái Pending (nếu có), thì gỡ bỏ lịch xóa
      await Booking.findByIdAndUpdate(id, { expireAt: null });
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// THÊM HÀM NÀY:
// @desc    Lấy tất cả booking (Admin)
// @route   GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookingsService();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật module.exports
module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings, // (Nếu bạn chưa có hàm này thì nhớ thêm vào để Admin xem danh sách)
  updateBookingStatus, // <--- Export thêm hàm mới
};
