/**
 * [usage]
 * node weather-app\app.js -a "Kharkov, Poltavski shliakh, 52, Ukraine"
 */
const weather = require('./weather/index')
const yargs = require('yargs')
const argv = getArgv()

var address = argv['address'] // var address = argv['a'] - аналогично

weather.getWeather( address )

// -----------------------------

function getArgv() {
    return yargs.options({
        // Ключи
        a: {
            demand: true,
            alias: 'address',
            describe: 'Address to fetch weather for',
            string: true
        }
    })
    // Подсказка по командам
    //.usage("$0 operation [addNote|dropNote] --address='' --desc='' ")
        .help()
        .alias('help', 'h')
        .argv
}