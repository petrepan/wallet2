const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  files: {
    type: String,
  },
  username: {
    type: String,
  },
  fileID: {
    type: Schema.Types.ObjectId,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
