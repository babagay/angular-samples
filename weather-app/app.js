/**
 * [usage]
 * node weather-app\app.js -a "Kharkov, Poltavski shliakh, 52, Ukraine"
 * node weather-app/app.js -a "kharkov"
 */

// 1 - через колбэки
// 2 - через промисы (axios)
// const weather = require('./weather') // [1]
const weather = require('./weather/index-axios') // [2]

const yargs = require('yargs')
const argv = getArgv()

var address = argv['address'] // var address = argv['a'] - аналогично

// Если getWeather() возвращает цепочку промисов с блоком catch, тогда здесь catch() не нужен
// Однако, если здесь его убрать, могут быть варнинги о том, что он нужен :)
weather.getWeather( address ).catch( err => console.log('Error caught in app.js',err) );

// -----------------------------

function getArgv() {
    return yargs.options({
        // Ключи
        a: {
            demand: true,
            alias: 'address',
            describe: 'Address to fetch weath er for',
            string: true
        }
    })
    // Подсказка по командам
    //.usage("$0 operation [addNote|dropNote] --address='' --desc='' ")
        .help()
        .alias('help', 'h')
        .argv
}