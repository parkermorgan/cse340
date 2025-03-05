const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");

router.get("/cause-error", utilities.handleErrors(errorController.causeError));

module.exports = router;