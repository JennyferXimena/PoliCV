const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/registro", authController.registrar);

module.exports = router;