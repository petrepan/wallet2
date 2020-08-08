const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  username: {
    type: String,
  },
  accountname: {
    type: String,
  },
  accountnumber: {
    type: String,
  },
  accountbank: {
    type: String,
  },
  amountwithdraw: {
    type: Number,
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "task",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("withdraw", withdrawSchema);