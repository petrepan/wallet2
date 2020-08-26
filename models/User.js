const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
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
    }
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
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  date: {
    type: Date,
    default: Date.now,
  },
});


const User = mongoose.model("User", UserSchema);


module.exports = User;