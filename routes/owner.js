const express = require("express");
const ownerController = require("../controllers/ownerController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/create/project", isAuth, ownerController.postCreateProject);

router.get(
  "/owner/project/:projectName",
  isAuth,
  ownerController.getProjectDetails
);

router.delete("/remove/project", isAuth, ownerController.removeProject);

router.post("/create/room", isAuth, ownerController.postCreateRoom);

router.delete("/remove/room", isAuth, ownerController.removeRoom);

router.post("/create/device", isAuth, ownerController.postCreateDevice);

router.post("/assign/device", isAuth, ownerController.postAssignDevice);

module.exports = router;
