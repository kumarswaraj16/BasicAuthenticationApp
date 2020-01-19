var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");
var localStrategy = require("passport-local");
var User = require("./models/user.js");
mongoose.connect('mongodb://localhost/auth_demo_app', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connected to DB!');
}).catch(err => {
    console.log('ERROR!', err.message);
});

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
    secret: "CTAE IS A GOOD GOVERNMENT COLLEGE",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});
app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {

    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/secret");
        });
    });
});
app.get("/login", function(req, res) {
    res.render("login");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res) {});
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

app.listen(3000, function() {
    console.log("server is connected.......");
});