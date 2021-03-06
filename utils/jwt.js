const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')
// let {User} = require('./../node-samples/mongo-api/models/user');

// const {User} = require('./../node-samples/mongo-api/models/user')

let getToken = (data,salt) => {

    let promise = new Promise( (resolve, reject) => {
        jwt.sign(data,salt, (err,token) => {
            if(err)
                reject(err)

            resolve(token)
        })
    });

    return promise

}

let getTokenStr = (data,salt) => {

    return jwt.sign(data,salt).toString()

}

module.exports = {
    getToken,
    getTokenStr
}