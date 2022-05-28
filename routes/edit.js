const express = require("express");
router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const edit = require("../controllers/edit");
const {isLoggedIn} = require("../middleware");
const multer  = require('multer');
const {postingSchema} = require("../inputValidation");
const appError = require("../utils/appError");

function validatePostings (req, res, next) {
    const {error} = postingSchema.validate(req.body);
    if (error) {
        throw new appError(error, 500);
    } else {
        next();
    }
}

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        return cb(null, "postings_".concat(req.session.passport.user, "_", req.body.identifier, ".csv"))
    }
});
const upload = multer({ storage })

router.route("/upload")
.get(isLoggedIn, edit.newDocument)
.post(isLoggedIn, upload.single("postings"), validatePostings, wrapAsync(edit.uploadDocument))

module.exports = router;