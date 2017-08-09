/**
 * Сервер для тестирования АПИ работы с базой через модели (mongoose)
 */

delete process.env["DEBUG_FD"];

let express = require('express');
let app = express();
// let mongoose = require('mongoose');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let port = 8086;
// let book = require('./app/routes/book');
let config = require('./config'); // загружаем адрес базы из конфигов
//настройки базы
let options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
};

/**
 * @deprecated
 * соединение с базой
 */
// mongoose.connect(config.DBHost, options);
// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));


// fixme не работает config.util.getEnv
//не показывать логи в тестовом окружении
// if(config.util.getEnv('NODE_ENV') !== 'test') {
if(process.env.NODE_ENV  !== 'test') {
    // morgan для вывода логов в консоль
    app.use(morgan('combined')); //'combined' выводит логи в стиле apache
} else {
    console.log("Тестируем...")
}

// парсинг application/json
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(bodyParser.text());
// app.use(bodyParser.json({ type: 'application/json'}));
app.use(bodyParser.json()); // support json encoded bodies


app.get("/", (req, res) => res.json({message: "Welcome to our test server!"}));


require('./routes')(app);

app.listen(port);
console.log("Mongoose CRUD test app is listening on port " + port + "\n");

module.exports = app; // для тестирования