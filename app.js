var createError = require('http-errors');
var express = require('express');
var path = require('path');
var { PrismaClient } = require("@prisma/client");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('./config/passport');
var PrismaSessionStore = require('./prismaSessionStore');
var dotenv = require('dotenv').config()
var prismaStore = new PrismaSessionStore();
var prisma = new PrismaClient();

var hbs = require('hbs');
hbs.registerHelper('formatName', function (name) {
    return name.toLowerCase().replace(/ /g, '-');
});

const usersRouter = require('./components/users/usersRoute');
const adminRouter = require('./components/admin/adminRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

const { engine } = require('express-handlebars');
// Set up Handlebars engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        layoutsDir: path.join(__dirname, "views", "layouts"),
        partialsDir: path.join(__dirname, "views", "partials"),
    })
);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: prismaStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7 // (miliseconds, total: 7 days)
    } // Set true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user; // Make 'req.user' available as 'user' in templates
    next();
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
