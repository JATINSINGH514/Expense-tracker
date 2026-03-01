const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const auth = require("../middleware/authMiddleware");

// SET budget
router.post("/", auth, async (req, res) => {
  const { amount } = req.body;

  const now = new Date();

  const budget = await Budget.findOneAndUpdate(
    {
      userId: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    },
    { amount },
    { upsert: true, new: true }
  );

  res.json(budget);
});

// GET budget
router.get("/", auth, async (req, res) => {
  const now = new Date();

  const budget = await Budget.findOne({
    userId: req.user.id,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });

  res.json(budget);
});

module.exports = router;