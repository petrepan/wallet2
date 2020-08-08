const mongoose = require("mongoose");


const totalfundsSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  accountbalance: {
    type: Number,
    required: true,
  },
  task1: {
    type: String,
  },
  task2: {
    type: String,
  },
  allowBalance: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}); 

module.exports = mongoose.model("totalfunds", totalfundsSchema);