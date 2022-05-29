const express = require("express");
router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {userSchema} = require("../inputValidation");
const appError = require("../utils/appError");
const users = require("../controllers/users");

function validateUser (req, res, next) {
    const {error} = userSchema.validate(req.body);
    if (error) {
        throw new appError(error.message, 500);
    } else {
        next();
    }
}

router.route("/register")
.get(users.registerForm)
.post(validateUser, wrapAsync(users.userRegister))

router.route("/login")
.get(users.loginForm)
.post(passport.authenticate("local", {failureFlash:true, failureRedirect: "/login"}), users.userLogin)

router.get("/logout", users.userLogout)

router.get("/prova", (req, res) => {
    console.dir(req.session.password);
    res.redirect("/")
})

module.exports = router;