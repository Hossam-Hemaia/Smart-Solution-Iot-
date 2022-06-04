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
    });
    await project.save();
    res.status(201).json({
      success: true,
      message: `Project ${projectName} created successfully`,
    });
  } catch (err) {
    next(err);
  }
};
