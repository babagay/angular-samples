/**
 * [usage]
 * node weather-app\samples\request.js -h
 * node weather-app\samples\request.js --address "1600 Amphitheatre Parkway, Mountain View, CA"
 * node weather-app\samples\request.js -a "Moscow, 13 Arbat, RU"
 * node weather-app\samples\request.js -a 19147
 *
 * https://api.darksky.net/forecast/9c7eb311198919629135222590f01008/37.8267,-122.4233
 */
const yargs = require ('yargs')
const geocode = require('./../geocode/geocode')
const forecast = require('./../forecast/darksky')

const argv = yargs.options({
    // Ключи
    a: {
        demand: true,
        alias: 'address',
        describe: 'Address to fetch weather for',
        string: true
    }
})
    // Подсказка по командам
    //.usage("$0 operation [addNote|dropNote] --title='' --desc='' ")
    .help()
    .alias('help', 'h')
    .argv

function getValueOfConsoleKey($keyName) {
    return argv[$keyName];
}

var latitude
var longitude

geocode.geocodeAddress(
    getValueOfConsoleKey('address'),
    (err, res, body) => {
        // [!] надо юзать такую констракшан, чтобы вывести полный json-объект
        // console.log( JSON.stringify(body, undefined, 4) )
        // console.log( JSON.stringify(res, undefined, 4) )
        // console.log( JSON.stringify(err, undefined, 4) )

        if(err){
            console.log("Unable to connect")
        } else
        if (body.status == 'ZERO_RESULTS') {
            console.log("Unable to find the address")
        } else if (body.status == 'OK') {
            console.log(`Current Address: ${body.results[0].formatted_address}`)

            latitude = body.results[0].geometry.viewport.northeast.lat
            longitude =  body.results[0].geometry.viewport.northeast.lng

            // Перестал работать такой вариант
            // latitude = body.results[0].geometry.bounds.northeast.lat;
            // longitude = body.results[0].geometry.bounds.northeast.lng

            // console.log(`Latitude: ${latitude}`)
            // console.log(`Long: ${longitude}`)

            // console.log( JSON.stringify(res, undefined, 2) )

            // Getting forecast
            forecast.getLocalWeather(`${latitude},${longitude}`, (err, res, body) => {

                if( err ){
                    console.log('Unable to connect', err)
                } else if ( body.code === 400 || res.statusCode === 400 ) { // Not found - напр, когда неверно переданы параметры (и получился некорректный урл)
                    var mess = body.error || body
                    console.log( 'Forecaster said: ' , mess )
                } else if ( res.statusCode === 403 ) { // Forbidden - напр, когда неправильный API key
                    console.log('Unable to connect: ', body)
                } else  if ( res.statusCode === 200 ) { // OK
                    // console.log( res )
                    console.log( 'Now the weather is ' + body.currently.summary  )
                    console.log( 'Temperature is ' + body.currently.temperature )
                    console.log( "Current forecast: " + body.daily.summary + '' )
                    // console.log( body.daily.data[0].summary + '' )
                }

                // Более короткий вариант
                // if( !err && res.statusCode === 200 ){
                //     console.log( body.currently.temperature )
                // } else {
                //     console.log( 'Error' )
                // }
            });
        }
    }
);



