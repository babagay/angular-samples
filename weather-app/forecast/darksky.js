
const request = require ('request')

var fetchWeather = ($latitude_longitude, afterRequest ) => {


    request(
        {
            url: `https://api.darksky.net/forecast/9c7eb311198919629135222590f01008/${$latitude_longitude}?units=si&lang=ru`,
            json: true
        },
        afterRequest
    );

}

// Вариант запроса с промисом
var fetchWeatherWithPromise = (lat, long) => {
    var promise = new Promise( (resolve, reject) => {
        request(
            {
                url: `https://api.darksky.net/forecast/9c7eb311198919629135222590f01008/${lat},${long}?units=si&lang=ru`,
                json: true
            },
            (error, result, body) => {

                // [!] Вариант
                // statusCode = result.statusCode || null
                // валится с ошибкой "Cannot read property 'statusCode' of undefined"

                var statusCode = null

                try {
                    statusCode = result.statusCode
                } catch (e){}

                if( !error && statusCode === 200 ){
                    resolve(body)
                } else {
                    // Упрощенный вариант, когда пробрасываем только ошибку, не всегда оказывается информативным
                    reject({
                        body,
                        error
                    })
                }
            }
        );
    });

    return promise;
}

const axios = require('axios')

// Вариант с промисом через axios
var fetchWeatherWithPromiseAxios = (lat, long) => {
    return axios.get(`https://api.darksky.net/forecast/9c7eb311198919629135222590f01008/${lat},${long}?units=si&lang=ru`)
}

module.exports = {
    getLocalWeather: fetchWeather,
    fetchWeatherWithPromise, // поле и метод называются одинаково
    fetchWeatherWithPromiseAxios
}