const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  admin: {
    type: String,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.toLocaleString(),
  },
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
