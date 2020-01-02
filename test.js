const express = require("express");

const app = express();
app.use(express.urlencoded({extended: false}));

app.get('/', function(req, res) {
    res.send(`
    <form action="/answer" method="POST">
        <p>What colour is the sky on a clear and sunny day?</p>
        <input name="skyColor" autocomplete="off">
        <button>Submit Answer</button>
    </form>
    `)
});

app.post('/answer', function(req, res) {
    if (req.body.skyColor.toLowerCase() == "blue") {
        res.send(`
        <p>Congrats, that is the correct answer!</p>
        <a href="/">Back to homepage</a>
        `);
    } else {
        res.send(`
        <p>Sorry, that is incorrect!</p>
        <a href="/">Back to homepage</a>
        `);
    }
});

app.get('/answer', function(req, res) {
    res.send("Are you lost?")
});

app.listen(3000);