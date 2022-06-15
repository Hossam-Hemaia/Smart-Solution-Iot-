const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  rooms: [
    {
      roomName: { type: String },
      roomNumber: { type: Number },
      devices: [
        {
          deviceName: { type: String },
          sensorId: {
            type: Schema.Types.ObjectId,
            ref: "sensor",
          },
        },
      ],
    },
  ],
  ownerId: { type: Schema.Types.ObjectId, ref: "owner", required: true },
  users: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "owner" },
      permissionType: { type: String },
      entityId: { type: Schema.Types.ObjectId },
    },
  ],
});

projectSchema.methods.addRoom = function (roomName, roomNumber) {
  let room = {
    roomName,
    roomNumber,
    devices: [],
  };
  const rooms = [...this.rooms];
  rooms.push(room);
  this.rooms = rooms;
  return this.save();
};

projectSchema.methods.addDevice = function (roomId, deviceName, sensorId) {
  const roomIdx = this.rooms.findIndex((roomIndex) => {
    if (roomIndex._id.toString() === roomId.toString()) {
      return roomIndex;
    }
  });
  let device = {
    deviceName,
    sensorId,
  };
  const room = this.rooms[roomIdx];
  room.devices.push(device);
  this.rooms[roomIdx] = room;
  return this.save();
};

module.exports = mongoose.model("project", projectSchema);
