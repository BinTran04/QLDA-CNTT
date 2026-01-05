const Expense = require("../models/Expense");

// @desc    Thêm khoản chi tiêu mới
// @route   POST /api/expenses
// @access  Private

const addExpense = async (req, res) => {
  const { itineraryId, amount, description, splitAmong } = req.body;
  // splitAmong là mảng chứa ID những người cùng chia tiền

  try {
    const expense = new Expense({
      itinerary: itineraryId,
      payer: req.user._id, // Người tạo lệnh là người trả tiền
      amount,
      description,
      splitAmong,
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách chi tiêu của 1 chuyến đi
// @route   GET /api/expenses/:itineraryId
// @access  Private
const getExpensesByTrip = async (req, res) => {
  try {
    const expenses = await Expense.find({ itinerary: req.params.itineraryId })
      .populate("payer", "name email")
      .populate("splitAmong", "name");
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addExpense, getExpensesByTrip };
