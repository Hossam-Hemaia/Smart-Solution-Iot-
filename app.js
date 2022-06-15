const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const compression = require("compression");
const cors = require("cors-express");
const dotenv = require("dotenv");
const redis = require("redis");
const cron = require("node-cron");

const Owner = require("./models/owner");
const Sensor = require("./models/sensor");

const authRouter = require("./routes/auth");
const ownerRouter = require("./routes/owner");

const app = express();
dotenv.config();
const rdsClient = redis.createClient();
rdsClient.on("error", (err) => {
  console.log("Redis Client Error :" + err);
});
rdsClient.connect().then((result) => {
  console.log("Redis Client Connected");
});

app.use(express.json());
app.use(multer().any());

const options = {
  allow: {
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    headers: "Content-Type, Authorization, Content-Length, Accept-Encoding",
  },
  max: {
    age: null,
  },
};

app.use(cors(options));
app.use(compression());

app.use(process.env.api, authRouter);
app.use(process.env.api, ownerRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ success: false, message: message });
});

const mqttClient = require("./mqtt").initMqtt();
mqttClient.on("connect", () => {
  console.log("connected to mqttBroker");
});
mqttClient.subscribe(process.env.CONNECT_TOPIC, () => {
  console.log("listening to sensors connections");
});
mqttClient.subscribe(process.env.DEVICE_READ_TOPIC, () => {
  console.log("listening to sensors data");
});
mqttClient.on("message", async (topic, payload) => {
  let topics = topic.split("/");
  const sensorId = topics[0];
  const category = topics[topics.length - 1];
  let sensor = await Sensor.findOne({ identifier: sensorId });
  if (!sensor) {
    throw new Error("No connected sensor found!");
  }
  if (category === "connect") {
    const data = payload.toString();
    (sensor.status = data), await sensor.save();
  } else if (category === "disconnect") {
    const data = payload.toString();
    (sensor.status = data), await sensor.save();
  }
  if (category === "data") {
    if (sensor.sensorType === "current sensor") {
      const data = payload.toString();
      const sensorData = await rdsClient.hGetAll(`${sensorId}`);
      if (sensorData.consumption) {
        let sensorRead = parseInt(sensorData.consumption) + parseInt(data);
        await rdsClient.hSet(`${sensorId}`, "consumption", `${sensorRead}`);
      } else {
        await rdsClient.hSet(`${sensorId}`, "consumption", `${data}`);
      }
    }
  }
});

cron.schedule("*/1 * * * *", async () => {
  const currentSensors = await Sensor.find({ sensorType: "current sensor" });
  for (let sensor of currentSensors) {
    let sensorData = await rdsClient.hGetAll(`${sensor.identifier}`);
    if (sensorData.consumption) {
      let data = { reads: sensorData.consumption, date: new Date() };
      sensor.sensorHistory.push(data);
      await sensor.save();
    }
  }
});

mongoose
  .connect(process.env.MongoDBUri)
  .then((result) => {
    const server = app.listen(process.env.PORT, process.env.Host, () => {
      console.log("listening on port 5000");
      const io = require("./socket").initIo(server);
      io.on("connection", (socket) => {
        io.to(socket.id).emit("sending-message", socket.id);
        console.log("io server is running...");
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
