const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  accountname: {
    type: String,
    required: true,
  },
  accountnumber: {
    type: Number,
    required: true,
  },
  accountbank: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;