const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    itinerary: {
      // Khoản chi này thuộc chuyến đi nào
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Itinerary",
    },
    payer: {
      // Ai là người trả tiền
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      // Chi cho việc gì (Ăn sáng, taxi,...)
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Danh sách những người thụ hưởng (để sau này tính toán chia tiền "Campuchia")
    splitAmong: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
