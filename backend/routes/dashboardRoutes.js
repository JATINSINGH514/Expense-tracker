const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const totalIncome = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpense = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyData = await Transaction.aggregate([
  { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" } },
  {
    $group: {
      _id: {
        month: {
          $month: {
            date: "$date",
            timezone: "Asia/Kolkata" 
          }
        }
      },
      total: { $sum: "$amount" }
    }
  },
  { $sort: { "_id.month": 1 } }
]);

    // Monthly expense
    const monthlyExpenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          $expr: { $eq: [{ $month: "$date" }, currentMonth] }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyExpense = monthlyExpenseAgg[0]?.total || 0;

    // Budget
    const budgetDoc = await Budget.findOne({
      userId,
      month: currentMonth,
      year: currentYear
    });

    const budgetAmount = budgetDoc?.amount || 0;

    const income = totalIncome[0]?.total || 0;
    const expense = totalExpense[0]?.total || 0;

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      monthlyData,
      budget: budgetAmount,
      exceeded:  budgetAmount>0 && monthlyExpense > budgetAmount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;