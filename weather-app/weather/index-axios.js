/**
 * Weather App, построенное на промисах с использованием axios
 *
 * [!] Здесь не вылетает предупреждение  Unhandled promise rejections are deprecated.
 *      Потом стал вылетать.
 *      Вылечил тем, что функция getWeather() стала возвращать всю эту цепочку,
 *      а к её вызову добавил catch: weather.getWeather( address ).catch(...)
 */

const geocode = require('./../geocode/geocode')
const forecast = require('./../forecast/darksky')
const StackTrace = require('stacktrace-js')

var getWeather = (address) => {

   return geocode.fetchAddressWithPromiseAxios(address)
        .then(
            response => {
                // console.log('STATUS',response.status)
                // console.log('StatusText',response.statusText)
                // console.log('HEADERS',response.headers)
                // console.log('CONFIG',response.config)
                // console.log('DATA',response.data)
                // console.log('DATA',JSON.stringify(response.data, undefined, 2) )

                var errorMessageLength = 0

                // Без ручного отслеживания ошибок не обойтись
                // Нужно пробрасывать в catch() само сообщение
                // Нужно вручную указывать источник, т.к. then'ов м.б. много
                // [!] У библиотеки axios есть объект  response.data
                try {
                    if( response.data.error_message.length > 0 )
                        errorMessageLength = response.data.error_message.length
                } catch (e){}

                var status = ''
                try {
                    status = response.data.status
                } catch(e){}

                // Условие 1
                if( errorMessageLength > 0){
                    var ErrorObj = response.data
                    ErrorObj.source = 'geocode a'
                    throw ErrorObj
                }

                // Условие 2
                if( status.length > 0 && status != 'OK' ){
                    var ErrorObj = response.data
                    ErrorObj.source = 'geocode b'
                    ErrorObj.status = status
                    // [!] Возможно (если в блоке catch нужно работать с объектом Error), потребуется унаследовать ErrorObj от Error
                    throw ErrorObj
                }

                console.log(response.data.results[0].formatted_address)

                return {
                    latitude:  response.data.results[0].geometry.viewport.northeast.lat,
                    longitude: response.data.results[0].geometry.viewport.northeast.lng
                };
            }
        )
        .then(
            // Весьма хреново то, что в данном блоке нет обертки, которая позволяла бы:
            // а) достать полезную информацию из респонса (при отвале)
            // б) указать источник
            // в) пробросить error, чтобы он был перехвачен в catch

            // Вариант 1 (рабочий)
            // [!] Если здесь убрать return, выскочит DeprecationWarning: Unhandled promise rejections are deprecated.
            data => forecast.fetchWeatherWithPromiseAxios(data.latitude, data.longitude)

            // Вариант 2 - с отловом исключений
            // FIXME довести до ума (ошибка не ловится)
            // data => forecast.fetchWeatherWithPromiseAxios(data.latitude, data.longitude),
            // ( error ) => {
            //     return {foo:2}
            // }
        )
        .then( finalResult => {
            console.log( 'Temperature now is: ' + finalResult.data.currently.temperature )
            console.log( finalResult.data.daily.summary )
        })
        // Можно смело убрать отсюда catch() и перенести его туда, где эта функция вызывается
        .catch( error => {
            // [!] смысла в этом отслеживании здесь - ноль, т.к. в каждом then по-разному формируются объекты ошибки
            // console.log('code: ', error.code)

            var err = error

            try {
                // У библиотеки axios есть объект  response.data
                err = error.response.data
            } catch (e) {}

            // fixme не работает
            // StackTrace.fromError(error).catch( errback => {
            //     console.log('_____________',errback)
            // })

            // [!] Иногда (на весьма сложные объекты) ругаетсяЖ Converting circular structure to JSON
            // console.log('Weather app, Axios promise variant. Error caught.', JSON.stringify(err,undefined,2) )
            console.log('Weather app, Axios promise variant. Error caught.', err )
        });
}

module.exports = {
    getWeather
}