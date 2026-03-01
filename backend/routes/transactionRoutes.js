const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");
const { Parser } = require("json2csv");

 // ================= EXPORT CSV =================
    router.get("/export", verifyToken, async (req, res) => {
      try {
        const transactions = await Transaction.find({
          userId: req.user.id
        });

        // CSV header
        let csv =
          "Category,Amount,Type,Note,Date\n";

        // rows
        transactions.forEach(t => {
          csv += `${t.category},${t.amount},${t.type},${t.note || ""},${t.date.toISOString()}\n`;
        });

        res.header("Content-Type", "text/csv");
        res.attachment("transactions.csv");

        return res.send(csv);

      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

// POST add transaction
router.post("/", verifyToken, async (req, res) => {
  try {
    const { type, amount, category, date, note } = req.body;

    const newTransaction = new Transaction({
      userId: req.user.id, // comes from JWT
      type,
      amount,
      category,
      date,
      note,
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json(savedTransaction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all transactions (with pagination, filter, sorting)
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const category = req.query.category;
    const sortBy = req.query.sortBy || "date";
    const order = req.query.order === "asc" ? 1 : -1;

    // build filter object
    let filter = { userId };

    if (category) {
      filter.category = category;
    }

    // fetch transactions
    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    // total count for pagination
    const total = await Transaction.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      transactions,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE transaction
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // check ownership
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }   // ✅ fixed here
    );

    res.json(updatedTransaction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE transaction
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // check ownership
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: "Transaction deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
 
});

module.exports = router;