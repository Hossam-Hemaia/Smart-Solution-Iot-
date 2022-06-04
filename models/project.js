const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  rooms: [
    {
      roomName: { type: String, required: true },
      devices: [
        {
          deviceName: { type: String, required: true },
          sensorId: {
            type: Schema.Types.ObjectId,
            ref: "sensor",
            required: true,
          },
        },
      ],
    },
  ],
  ownerId: { type: Schema.Types.ObjectId, ref: "owner", required: true },
});

module.exports = mongoose.model("project", projectSchema);
