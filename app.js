const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const sanitizeHTML = require("sanitize-html");
const csrf = require("csurf");
const app = express();

let sessionOptions = session({
    secret: "Javascript is Awesome",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
});

app.use(sessionOptions);
app.use(flash());

app.use(function(req, res, next) {
    // Make our markdown function available within ejs templates
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
    }
    // Make all error and success messages available for all templates
    res.locals.errors = req.flash("errors");
    res.locals.success = req.flash("success");
    // Make current user id available on req object
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
    // Make user session data available within view templates
    res.locals.user = req.session.user;
    next()
})

const router = require('./router');

// Allow express to recieve form data and json data
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Allow express to use ejs templating engine for the views
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(csrf())

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next();
})

app.use('/', router);

app.use(function(err, req, res, next) {
    if (err) {
        if (err.code == "EBADCSRFTOKEN") {
            req.flash('errors', "Cross cite request forgery detected");
            req.session.save(() => res.redirect('/'));
        } else {
            res.render('404');
        }
    }
})

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Express Session data to work with socket.io 
io.use(function(socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
    if (socket.request.session.user) {
        let user = socket.request.session.user;

        socket.emit('welcome', {username: user.username, avatar: user.avatar});

        socket.on('chatMessageFromBrowser', function(data) {
            socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar});
        })
    }
})

module.exports = server;