var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var boardSchema = new Schema({
  board: { type: Array },
  id: { type: String }
});

module.exports = mongoose.model("Board", boardSchema);
