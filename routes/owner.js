const express = require("express");
const ownerController = require("../controllers/ownerController");

const router = express.Router();

router.post("/create/project", ownerController.postCreateProject); //test this endpoint 
