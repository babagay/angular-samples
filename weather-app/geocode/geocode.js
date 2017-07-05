
const request = require ('request')

/**
 * Вариант без промисов
 * @param $shortAddress
 * @param afterRequest
 */
var fetchAddress = ($shortAddress, afterRequest ) => {

    var encodedAddress = encodeURIComponent( $shortAddress );

    request(
        {
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI`,
            json: true
        },
        afterRequest
    );

}

/**
 * Вариант с промисом (кастомная обёртка)
 * @param address
 */
var fetchAddrWithPromise = (address) => {

    var encodedAddress = encodeURIComponent( address );

    var promise = new Promise( (resolve, reject) => {
        request(
            {
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI`,
                json: true
            },
            (error, result, body) => {

                var statusCode = null

                try {
                    if( typeof result !== 'undefined' )
                    statusCode = result.statusCode
                } catch (e){}

                // В варианте с промисом логика детектирования ошибок перенесена из клиентского кода сюда, т.е. в модуль
                if( !error && statusCode === 200 ){

                    // result и body заворачиваем в объект
                    resolve({
                        result,
                        body
                    })

                } else {
                    reject({
                        error,
                        result
                    })
                }
            }
        );
    });

    return promise

}

const axios = require('axios')

/**
 * Вариант с промисом (использован Axios)
 */
var fetchAddressWithPromiseAxios = (address) => {

    var encodedAddress = encodeURIComponent(address)

    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI`)
};

module.exports = {
    geocodeAddress: fetchAddress,
    fetchAddrWithPromise,
    fetchAddressWithPromiseAxios
}