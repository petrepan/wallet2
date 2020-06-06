const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  amountwithdraw: {
    type: Number,
  },
 useraccount: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}); 

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
  },
  number: {
    type: Number,
  },
  accountname: {
    type: String,
  },
  accountnumber: {
    type: Number,
  },
  accountbank: {
    type: String,
  },
  dashboard: { type: mongoose.Schema.Types.ObjectId, ref: "Withdraw" },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


const User = mongoose.model("User", UserSchema);


module.exports = User;