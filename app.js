const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors-express");
const dotenv = require("dotenv");

const authRouter = require("./routes/auth");

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
    });
  })
  .catch((err) => {
    console.log(err);
  });
