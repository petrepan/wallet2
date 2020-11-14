const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
  user: {
    type: String,
    default: "admin",
  },
  task1: {
    type: String,
  },
  task2: {
    type: String,
  },
  task3: {
    type: String, 
  },
  imgtask1: {
    type: String,
  },
  imgtask2: {
    type: String,
  },
  imgtask3: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Upload = mongoose.model("Upload", UploadSchema);

module.exports = Upload;
