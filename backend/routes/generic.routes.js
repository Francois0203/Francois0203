const express = require("express");
const router = express.Router();
const genericController = require("../controllers/generic.controller");

// General List
router.get("/general-list", genericController.fetchResource("/generic/general-list"));

module.exports = router;