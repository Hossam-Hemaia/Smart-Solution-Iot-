const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sensorSchema = new Schema({
  sensorName: {
    type: String,
  },
  sensorType: {
    type: String,
    required: true,
  },
  identifier: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "owner",
    required: true,
  },
});

module.exports = mongoose.model("sensor", sensorSchema);
