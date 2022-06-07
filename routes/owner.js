const express = require("express");
const ownerController = require("../controllers/ownerController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/create/project", isAuth, ownerController.postCreateProject); //test this endpoint

module.exports = router;
