/**
 * [usage]
 * node node-samples\promise.js
 */

var promise = new Promise( (resolve, reject) => {
    //resolve('worked')
    reject('reject')
});

 // promise.then( res => console.log(res, 'W') ).catch( e => console.log(e, 'Err' ) )

const geocode = require('../weather-app/geocode/geocode')
const forecast = require('../weather-app/forecast/darksky')

var address = "Харьков, Украина"

geocode.fetchAddrWithPromise(address).then( res => {

        /**
         * [Examples]
         * console.log( JSON.stringify(res.result, undefined, 2) ) // OK
         * console.log( res.result.statusCode ) // 200
         *
         * console.log( res.body.results[0].formatted_address )
         *
         * [!] В реальности не обязательно в ответе содержится поле northeast
         */

        return {
            latitude: res.body.results[0].geometry.viewport.northeast.lat,
            longitude: res.body.results[0].geometry.viewport.northeast.lng
        }
    },
    (err) => {
        // console.log('ERR', err.error.code)
        // console.log('ERR')

        // [!] если добавить return, в следующий then будет передан объект ошибки, а иначе undefined
        // [!] Даже после ошибки интерпретатор может пройти по всем then'ам
        // Но, если мы отсюда возвращаем объект err, он попадает на вход последующим функциям и
        // вследствие этого теряется!
        // return err

        // [!] вот так можно телепортироваться прямо в блок catch
        // Но (!) объект err до туда не долетает
        throw new Error( err )
    })
    .then( data => {

        // [!] Функция fetchWeatherWithPromise() должна возвращать промис
        // [!] обязательно пробрасываем промис дальше по цепочке

        return forecast.fetchWeatherWithPromise(data.latitude, data.longitude)
    })
    .then( res => {

        // Финальная обработка результата
        // [?] Как использовать finally

        console.log( 'Temperature now is: ' + res.currently.temperature )
        console.log( res.daily.summary )
    } )
    .catch( err => {
        // Здесь ловятся ошибки из всех then
        // [?] Как определить, в каком именно блоке возникла ошибка. Есть ли тут stackTrace?



        console.log('Catch triggered', JSON.stringify(err, undefined, 2) )

    });
