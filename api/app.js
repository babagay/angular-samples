const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const port = 8000

const corsOptions = {
    origin: 'http://localhost:3000' // клиентский домен, с которого приходит запрос
}

const Rx = require('rx');

require('./samples')(app, Rx);

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies


MongoClient.connect('mongodb://localhost:27017/todo', (err, db) => {
    if (err)
        return console.log(err)

    require('./routes')(app, db);

    app.listen(port, function () {
        console.log('Example app listening on port ' + port );
    });


});



// Маршруты перенесены в routes.js
/*
app.get('/', function (req, res) {
    res.send('Hello World! ');
});

app.get('/todo', function (req, res) {
    res.send('Hello todo! ');
});

app.post('/todo', (req,res) => {

    if (!req.body)
        return res.sendStatus(400)

        res.send('welcome, ' + req.body.username)
});
*/

