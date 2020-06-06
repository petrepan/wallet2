const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  amountwithdraw: {
    type: Number,
    required: true,
  },
  accountbank: {
    type: String,
    required: true,
  },
  accountnumber: {
    type: Number,
    required: false,
  },
  username: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Withdraw", withdrawSchema);