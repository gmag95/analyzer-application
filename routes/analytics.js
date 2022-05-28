const express = require("express");
router = express.Router();
const analytics = require("../controllers/analytics");
const {numberCheck} = require("../inputValidation");
const appError = require("../utils/appError");

function validateNumber (req, res, next) {
    const {error} = numberCheck.validate(req.query);
    if (error) {
        throw new appError(error.message, 500);
    } else {
        next();
    }
}

router.get("/departments", validateNumber, analytics.department);

router.get("/country", validateNumber, analytics.country);

router.get("/history", analytics.history);

router.get("/userstats", analytics.userStats);

module.exports = router;