const User = require("../models/user");
const {pool} = require('../db/index');
var moment = require('moment'); 

module.exports.registerForm = (req, res) => {
    res.render("users/register.ejs");
}

module.exports.userRegister = async (req, res, next) => {
    try {
        const {username, name, surname, password, code, grade} = req.body;
        if (code != process.env.REG_CODE) {
            req.flash("error", "Wrong registration code");
            return res.redirect("/register");
        }
        const user = new User({username, name, surname, grade});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if(err) return next(err);
        })
        pool.query("call create_user($1, $2, 0, 0, $3::date, $4, $5);", [name, surname, moment().format().slice(0,10), grade, username])
        .then(() => {
            req.flash("success", "User created successfully");
            res.redirect("/");
        })
        .catch(async (err) => {
            await User.deleteOne({username})
            req.flash("error", err.message);
            res.redirect("/register");
        })
    }
    catch (error) {
        req.flash("error", error.message)
        res.redirect("/register");
    }
}

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.userLogin = (req, res) => {
    req.flash("success", "Welcome back");
    if (req.session.returnTo && req.session.returnTo.slice(-6)=="DELETE") {
        delete req.session.returnTo;
        res.redirect("documents");
    } else {
        const redirectUrl = req.session.returnTo || "/";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
}

module.exports.userLogout = (req, res) => {
    req.logout();
    req.flash("success", "Logged you out successfully");
    res.redirect("/");
}