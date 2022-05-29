const express = require("express");
router = express.Router();
const index = require("../controllers/index");

router.get("/", index.indexPage);

module.exports = router;