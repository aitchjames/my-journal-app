const express = require("express");
const app = express();

const router = require('./router');

// Allow express to recieve form data and json data
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Allow express to use ejs templating engine for the views
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', router)

app.listen(3000);