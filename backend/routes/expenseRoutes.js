const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const verifyToken = require("../middleware/authMiddleware");

// GET all expenses (protected route)
router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add expense (protected route)
router.post("/", verifyToken, async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;