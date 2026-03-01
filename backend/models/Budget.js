const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: Number,
  year: Number,
  amount: Number
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);