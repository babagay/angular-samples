/**
 * node weather-api
 *
 * @type {any}
 */
const express = require('express')
const pug = require('pug');

// Однако, хоть и можно установить непосредственно handlebars,
// существует порт для экспресса, под названием hbs
// https://www.npmjs.com/package/hbs
// http://handlebarsjs.com/installation.html
// const handlebars = require('handlebars');
const hbs = require('hbs');

const fs = require('fs')

var app = express();

// Либо ту, либо ту строку надо, я так понял
// Хотя, pug работает и без этого
// app.engine('pug', require('pug').__express); // [1]
// app.set("view engine", "pug"); // [2]

app.set("view engine", "hbs"); // А, вот, hbs без этого не работает, т.к. hbs переопределяет стандартный метод render()

app.set("views", `${__dirname}/templates`); // Для pug не нужно. Нужно для hbs!



// Пример middleware
app.use( (req, res, next) => {

    var now = new Date().toJSON();

    // console.log(now)

    //console.log(req.app.get('The views directory is ' + 'views'))

    // [!?] Половина свойств объекта req не работает (http://expressjs.com/en/4x/api.html#req.body)
    // console.log(req.protocol)
    // console.log(req.method) // GET
    // console.log(req.url) // /about?name=asd
    // console.log(req.xhr)
    // console.log(req.accepts('text/html'))
    // console.log( req.get('content-type') )
    // console.log( 'Body', req.body )

    var strLogging = `${now} ${req.method} ${req.url} \n`

    // [!] Чтобы не было варнинга, нужно добавить колбэк, обрабатывающий ошибку
    // fs.appendFile('log.txt', strLogging, err => {
    //    if(err)
    //        console.log('Can not log info in middleware')
    // });

    next();
});

// Заблокировать сайт
// Если перед этим посредником вставить require('./routes')(app,pug), то эти роуты будут работать
// Если же, они подключаются после посредника, все они будут заблокированы
//  express.static тоже перенес За посредника
app.use( (req, res, next) => {
    // res.render('maintenance') // Если эту строку каменим, вставляем next() или каментим всю функцию
    next()
});


// Нужно указать папку со статичскими файлами, чтобы можно было их отдавать
// Допускается указывать несколько папок
app.use( express.static(__dirname + '/templates') );


hbs.registerPartials(__dirname + '/templates/partials')

// hbs Helpers
hbs.registerHelper('getCurrYear',() => new Date().getFullYear());

hbs.registerHelper('toUpper',(text) => new String(text).toUpperCase() );

hbs.registerHelper('toList', list => {
    var result="";
    for(var i=0; i<list.length; i++){
        result +="<li>" + list[i] + "</li>";
    }
    return new hbs.SafeString("<ul>" + result + "</ul>");
} );




const weatherCustomPort = 8081
const port = process.env.PORT || weatherCustomPort


require('./routes')(app,pug)

app.listen(port, () => {
    console.log('Weather app is listening on port ' + port + "\n");
});

// Для тестирования пробрасываем app наружу
module.exports.app = app;