const geocode = require('./../geocode/geocode')
const forecast = require('./../forecast/darksky')

var getWeather = (address) => {
    console.log(address)
    geocode.geocodeAddress(
        address,
        (err, res, body) => {

            if(err){
                console.log("Unable to connect")
            } else
            if (body.status == 'ZERO_RESULTS') {
                console.log("Unable to find the address")
            } else if (body.status == 'OK') {
                console.log(`Current Address: ${body.results[0].formatted_address}`)

                var latitude = body.results[0].geometry.viewport.northeast.lat
                var longitude =  body.results[0].geometry.viewport.northeast.lng

                // Getting forecast
                forecast.getLocalWeather(`${latitude},${longitude}`, (err, res, body) => {

                    if( !err && res.statusCode === 200 ){
                        console.log( body.currently.temperature )
                    } else {
                        console.log( 'Error' )
                    }

                });
            }
        }
    );
}

module.exports = {
    getWeather
}