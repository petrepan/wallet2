const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
    trim: true
  },
  number: {
    type: String,
  },
  accountname: {
    type: String,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
  },
  task: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  withdraw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "withdraw",
  },
  totalfunds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "totalfunds",
    },
  ],
  accountnumber: {
    type: String,
  },
  accountbank: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resetLink: {
    data: String,
    default: "",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
