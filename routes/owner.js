const express = require("express");
const ownerController = require("../controllers/ownerController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/create/project", isAuth, ownerController.postCreateProject);

router.post('/create/room', isAuth, ownerController.postCreateRoom);

router.post('/create/device', isAuth, ownerController.postCreateDevice);

module.exports = router;
