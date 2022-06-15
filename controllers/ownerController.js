const Owner = require("../models/owner");
const Project = require("../models/project");
const Sensor = require("../models/sensor");

exports.postCreateProject = async (req, res, next) => {
  const {
    projectName,
    roomName,
    deviceName,
    sensorName,
    sensorType,
    sensorIdentifier,
    socketId,
  } = req.body;
  try {
    const userId = req.userId;
    let sensor = await Sensor.findOne({ identifier: sensorIdentifier });
    if (sensor) {
      const error = new Error("Sensor Already Exists!");
      error.statusCode = 422;
      throw error;
    }
    sensor = new Sensor({
      sensorName,
      sensorType,
      identifier: sensorIdentifier,
      ownerId: userId,
    });
    await sensor.save();
    const project = new Project({
      projectName,
      rooms: [
        {
          roomName,
          devices: [
            {
              deviceName,
              sensorId: sensor._id,
            },
          ],
        },
      ],
      ownerId: userId,
    });
    await project.save();
    const io = require("../socket").getIo();
    io.to(`${socketId}`).emit("sending-message", "New project created");
    res.status(201).json({
      success: true,
      message: `Project ${projectName} created successfully`,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreateRoom = async (req, res, next) => {
  const { roomName, roomNumber } = req.body;
  const ownerId = req.userId;
  try {
    const ownerProject = await Project.findOne({ ownerId: ownerId });
    if (!ownerProject) {
      const error = new Error("Project does not exist!");
      error.statusCode = 404;
      throw error;
    }
    await ownerProject.addRoom(roomName, roomNumber);
    res
      .status(201)
      .json({ success: true, message: "New room created successfully" });
  } catch (err) {
    next(err);
  }
};

exports.postCreateDevice = async (req, res, next) => {
  const ownerId = req.userId;
  const {
    roomId,
    deviceName,
    sensorName,
    sensorType,
    sensorIdentifier,
  } = req.body;
  try {
    const ownerProject = await Project.findOne({ ownerId: ownerId });
    if (!ownerProject) {
      const error = new Error("Project does not exist!");
      error.statusCode = 404;
      throw error;
    }
    let sensor = await Sensor.findOne({ identifier: sensorIdentifier });
    if (sensor) {
      const error = new Error("Sensor already exist!");
      error.statusCode = 422;
      throw error;
    }
    sensor = new Sensor({
      sensorName,
      sensorType,
      identifier: sensorIdentifier,
      ownerId,
    });
    await sensor.save();
    await ownerProject.addDevice(roomId, deviceName, sensor._id.toString());
    res.status(201).json({ success: true, message: "New device is added" });
  } catch (err) {
    next(err);
  }
};
