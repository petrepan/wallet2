const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  freeplan: {
    type: String,
  },
  username: {
    type: String,
  },
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
  date: {
    type: Date,
    default: Date.now,
  },
});

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
