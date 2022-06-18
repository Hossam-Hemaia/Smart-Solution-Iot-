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
    if (sensorIdentifier) {
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
    } else {
      const project = new Project({
        projectName,
        rooms: [],
        ownerId: userId,
        users: [],
      });
      await project.save();
    }
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

exports.getAllProjects = async (req, res, next) => {
  const ownerId = req.userId;
  try {
    const projects = await Project.find({ ownerId: ownerId });
    if (!projects) {
      const error = new Error("No projects found!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, projects: projects });
  } catch (err) {
    next(err);
  }
};

exports.getProjectDetails = async (req, res, next) => {
  const projectName = req.params.projectName;
  const ownerId = req.userId;
  try {
    const project = await Project.findOne({
      projectName: projectName,
      ownerId: ownerId,
    });
    if (!project) {
      const error = new Error("This project does not exist");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, project: project });
  } catch (err) {
    next(err);
  }
};

exports.removeProject = async (req, res, next) => {
  const projectName = req.query.projectName;
  const ownerId = req.userId;
  try {
    const project = await Project.findOneAndDelete({
      projectName: projectName,
      ownerId: ownerId,
    });
    if (!project) {
      const error = new Error("Project does not exist");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(201)
      .json({ success: true, message: "Project removed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.postCreateRoom = async (req, res, next) => {
  const { projectName, roomName, roomNumber } = req.body;
  const ownerId = req.userId;
  try {
    const ownerProject = await Project.findOne({
      ownerId: ownerId,
      projectName: projectName,
    });
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

exports.removeRoom = async (req, res, next) => {
  const projectName = req.query.projectName;
  const roomId = req.query.roomId;
  const ownerId = req.userId;
  try {
    const project = await Project.findOne({
      projectName: projectName,
      ownerId: ownerId,
    });
    if (!project) {
      const error = new Error("Project does not exist");
      error.statusCode = 404;
      throw error;
    }
    await project.removeRoom(roomId);
    res
      .status(201)
      .json({ success: true, message: "Room removed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.postCreateDevice = async (req, res, next) => {
  const ownerId = req.userId;
  const {
    projectName,
    roomId,
    deviceName,
    sensorName,
    sensorType,
    sensorIdentifier,
  } = req.body;
  try {
    const ownerProject = await Project.findOne({
      projectName: projectName,
      ownerId: ownerId,
    });
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

exports.getAllSensors = async (req, res, next) => {
  const ownerId = req.userId;
  try {
    const sensors = await Sensor.find({ ownerId: ownerId });
    if (!sensors) {
      const error = new Error("Snesor does not exist!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, sensors: sensors });
  } catch (err) {
    next(err);
  }
};

exports.postAssignDevice = async (req, res, next) => {
  const {
    projectName,
    toProjectName,
    newRoomId,
    oldRoomId,
    sensorId,
  } = req.body;
  const ownerId = req.userId;
  try {
    const project = await Project.findOne({
      projectName: projectName,
      ownerId: ownerId,
    });
    const toProject = await Project.findOne({
      projectName: toProjectName,
      ownerId: ownerId,
    });
    if (!project || !toProject) {
      const error = new Error("Project does not exist!");
      error.statusCode = 404;
      throw error;
    }
    let oldRoom = project.rooms.find((room) => {
      return room._id.toString() === oldRoomId.toString();
    });
    if (!oldRoom) {
      const error = new Error(
        "Project does not exist, please create room first!"
      );
      error.statusCode = 404;
      throw error;
    }
    const device = oldRoom.devices.find((device) => {
      return device.sensorId.toString() === sensorId.toString();
    });
    const sensor = await Sensor.findById(sensorId);
    if (!sensor) {
      const error = new Error("Sensor does not exist!");
      error.statusCode = 404;
      throw error;
    }
    await toProject.addDevice(newRoomId, device.deviceName, sensorId);
    await project.removeDevice(oldRoomId, sensorId);
    res
      .status(201)
      .json({ success: true, message: "Device moved successfully" });
  } catch (err) {
    next(err);
  }
};
