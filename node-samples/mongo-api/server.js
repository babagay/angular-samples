/**
 * [Heroku]
 * Нужна конструкция process.env.PORT
 * Нужна запись start в секции scripts в package.json
 * запись node в секции engines в package.json
 * В файле подключения к базе использовать process.env.MONGODB_URI
 *
 * @type {any}
 */
let env = 'development'
const environment = process.env.NODE_ENV || env // Можно устанавливать окруженеи вручную

const express = require('express');
const bodyParser = require('body-parser')

// for dev environment by default
let prt = 8004

// запускать приложение на другом порту для тестов (на случай, если основное приложение уже запущено)
if( environment == 'test' )
    prt = 8085

const port = process.env.PORT || prt

// const cors = require('cors')
// const corsOptions = {
//     origin: 'http://localhost:3000' // клиентский домен, с которого приходит запрос
// }


const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

require('./routes')(app);

app.listen(port, function () {
    console.log('Example app listening on port ' + port );
});

// Для тестирования пробрасываем app наружу
module.exports.app = app;


