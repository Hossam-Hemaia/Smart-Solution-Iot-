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
  status: {
    type: String,
    default: "disconnected",
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "owner",
    required: true,
  },
  sensorHistory: [
    {
      reads: { type: String },
      date: { type: Date },
    },
  ],
});

module.exports = mongoose.model("sensor", sensorSchema);
