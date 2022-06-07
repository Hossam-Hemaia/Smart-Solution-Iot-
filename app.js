const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const compression = require("compression");
const cors = require("cors-express");
const dotenv = require("dotenv");

const Owner = require("./models/owner");
const Sensor = require("./models/sensor");

const authRouter = require("./routes/auth");
const ownerRouter = require("./routes/owner");

const app = express();
dotenv.config();

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
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MongoDBUri)
  .then((result) => {
    const server = app.listen(process.env.PORT, process.env.Host, () => {
      console.log("listening on port 5000");
      const mqttClient = require("./mqtt").initMqtt();
      mqttClient.on("connect", () => {
        console.log("connected to mqttBroker");
      });
      mqttClient.subscribe(process.env.CONNECT_TOPIC, () => {
        console.log("lestening to sensors connections");
      });
      mqttClient.on("message", async (topic, payload) => {
        let data = JSON.parse(payload.toString());
        let sensor = await Sensor.findOne({ identifier: data.sensorId });
        if (!sensor) {
          throw new Error("No connected sensor found!");
        }
        (sensor.status = "connected"), await sensor.save();
      });
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
