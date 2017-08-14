/**
 * Token debugger: https://jwt.io
 */

const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')

let message = "I m user"
let hash



// Взять хэш
hash = SHA256(message).toString()

let data = {
    id: 4,
    name: "Leo"
}

// sign with default (HMAC SHA256)
// пример с колбэком
jwt.sign(data,'123ABC', (err,token) => {
    console.log( "JWT token: ", token )

    let decodedObject = jwt.verify(token, '123ABC')
    console.log( "JWT token object: ", decodedObject )
})

// Пример со строкой
console.log( "JWT: ", jwt.sign(data,'123ABC').toString() )

// пакет принят по сети от другого хоста
let serverSideSalt = 'salt'
let token = {
    data,
    // вычисляется на стороне сервера, к примеру
    hash: SHA256( JSON.stringify(data) + serverSideSalt).toString()
}

// вычисляется на другой строне, например, на клиенте
// hash вычислен локально
// секретнео слово хранится в разных местах - на сервере и на клиенте
const clientSideSalt = 'salt'
let resultHash = SHA256( JSON.stringify(data) + clientSideSalt).toString()

// хэши сравниваются
if( token.hash === resultHash )
    console.log( "Hash is valid" )
else
    console.log( "We could not trust the data" )



