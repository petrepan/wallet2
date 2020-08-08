const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  sub: {
    type: String,
  },
  daily: {
    type: Number,
  },
  username: {
    type: String,
  },
  allowBalance: {
    type: Boolean,
    default: false,
  },
  task : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  amountwithdraw: {
    type: Number,
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
