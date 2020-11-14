const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  admin: {
    type: String,
    default: "admin",
  },
  password: {
    type: String,
  },
  togglewithdrawal: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
