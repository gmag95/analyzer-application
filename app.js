if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const { Client } = require('pg');
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const appError = require("./utils/appError");
const {isLoggedIn} = require("./middleware");
const User = require("./models/user");
const usersRoute = require("./routes/users");
const editRoute = require("./routes/edit");
const viewDataRoute = require("./routes/viewdata");
const indexRoute = require("./routes/index");
const analyticsRoute = require("./routes/analytics");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoDBStore = require('connect-mongo');
const {pool} = require('./db/index');

const dbUrl = process.env.DB_URL || "mongodb://0.0.0.0:27017/analyzer"
const secret = process.env.SESSION_KEY || "defaultsecretcode";
const name = process.env.SESSION_NAME || "sessiondefault";

let db_conn = mongoose.connect(dbUrl)
.then(() => {
        console.log("Connected to mongo database");
    }
)
.catch((err) => {
        console.log("Mongo connection error: ", err);
    }
);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.disable('x-powered-by');

const port = process.env.PORT

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${port}`);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

app.listen(port, () => {
    console.log("Listening from the Heroku server");
})

const sessionConfig = {
    name,
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    },
    store: MongoDBStore.create({ mongoUrl: dbUrl }),
    touchAfter: 24*60*60
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use("/", usersRoute);
app.use("/", editRoute);
app.use("/", viewDataRoute);
app.use("/", indexRoute);
app.use("/analytics", analyticsRoute);

app.all("*", (req, res, next) => {
    next(new appError("Error code 404: page not found", 404));
})

app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = "Something went wrong";
    }
    if (!err.status) {
        err.status = 500;
    }
    res.status(err.status).render("error", {err});
})