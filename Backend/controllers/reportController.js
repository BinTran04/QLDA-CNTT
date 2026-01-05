const Itinerary = require("../models/Itinerary");
const Booking = require("../models/Booking");
const Expense = require("../models/Expense");

// @desc    Lấy thống kê tổng quan (Dashboard)
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Đếm tổng số chuyến đi
    const totalTrips = await Itinerary.countDocuments({ user: userId });

    // 2. Đếm tổng số Booking
    const totalBookings = await Booking.countDocuments({ user: userId });

    // 3. Tính tổng tiền chi tiêu (Dùng Aggregation)

    // a. Tổng tiền từ Booking
    const bookingStats = await Booking.aggregate([
      { $match: { user: userId, status: "Confirmed" } }, // Chỉ tính vé đã confirm
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // b. Tổng tiền từ Expenses (Chi tiêu nhóm)
    const expenseStats = await Expense.aggregate([
      { $match: { payer: userId } }, // Chỉ tính khoản mình đã trả
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Cộng lại (nếu không có dữ liệu thì mặc định là 0)
    const totalSpent =
      (bookingStats[0]?.total || 0) + (expenseStats[0]?.total || 0);

    res.json({
      totalTrips,
      totalBookings,
      totalSpent,
      currency: "VND",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
