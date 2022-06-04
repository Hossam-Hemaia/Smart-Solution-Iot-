const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/owner/register", authController.postOwnerRegister);

router.post("/owner/login", authController.postOwnerLogin);

module.exports = router;
