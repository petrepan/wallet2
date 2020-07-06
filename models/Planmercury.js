const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planmercurySchema = new Schema({
  mercury: {
    type: Number,
  },
  username: {
    type: String,
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

const Planmercury = mongoose.model("Planmercury", planmercurySchema);

module.exports = Planmercury;
