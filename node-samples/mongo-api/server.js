const express = require('express');
const bodyParser = require('body-parser')

const port = 8004

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


