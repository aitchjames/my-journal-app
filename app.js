const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const app = express();

let sessionOptions = session({
    secret: "Javascript is Awesome",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
});

app.use(sessionOptions);

const router = require('./router');

// Allow express to recieve form data and json data
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Allow express to use ejs templating engine for the views
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', router)

module.exports = app