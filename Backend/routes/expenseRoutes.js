const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpensesByTrip,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addExpense);
router.get("/:itineraryId", protect, getExpensesByTrip);

module.exports = router;
