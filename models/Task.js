const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  task1: {
    type: String,
  },
  username: {
    type: String,
  },
  task2: {
    type: String,
  },
  sub: {
    type: String,
  },
  allowBalance: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
  },
  withdraw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "withdraw",
  },
  daily: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
