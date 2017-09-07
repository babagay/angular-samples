/**
 * JWT token samples
 *
 * Token debugger: https://jwt.io
 *
 * node node-samples\hashing.js
 */

const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

let message = "I m user"
let hash
let simpleSalt = '123ABC'
let password = 'querty'


// Взять хэш
hash = SHA256(message).toString()

let data = {
    id: 4,
    name: "Leo"
}

// sign with default (HMAC SHA256)
// пример с колбэком
jwt.sign(data,simpleSalt, (err,token) => {
    console.log( "JWT token: ", token )

    let decodedObject = jwt.verify(token, simpleSalt)
    console.log( "JWT token object: ", decodedObject )
})

// Пример со строкой
console.log( "JWT: ", jwt.sign(data,simpleSalt).toString() )

// пакет принят по сети от другого хоста
let serverSideSalt = 'salt'
let token = {
    data,
    // вычисляется на стороне сервера, к примеру
    hash: SHA256( JSON.stringify(data) + serverSideSalt).toString()
}

// вычисляется на другой строне, например, на клиенте
// hash вычислен локально
// секретное слово хранится в разных местах - на сервере и на клиенте
const clientSideSalt = 'salt'
let resultHash = SHA256( JSON.stringify(data) + clientSideSalt).toString()

// хэши сравниваются
if( token.hash === resultHash )
    console.log( "Hash is valid" )
else
    console.log( "We could not trust the data" )

// bCrypt testing
// Другой вариант использования "соли" - алгоритм bCrypt
// Он позволяет генерировать каждый раз случайную соль (и потом получать каждый раз новый хэш),
// но при обратном преобразовании из этих хешей получается один и тот же пароль
bcrypt.genSalt(10).then( saltGenerated => {

    // Либо так:
    // let hashGenerated = bcrypt.hash(password, saltGenerated).then(  t => console.log("TTTTTT",t) )
    //  либо юзать синхронизированную версию метода
    let hashGenerated = bcrypt.hashSync(password, saltGenerated)

    // [!] Каждый раз генерится новая соль и новый хэш, хотя, строка одна и та же
    console.log('Generated salt by bCrypt: ', saltGenerated)
    console.log('Generated hash by bCrypt: ', hashGenerated)
});

let hashedPassword1 = '$2a$10$lpBXZHhfBgPr6bBhLTX5BO8fdNmvBEmrXPdXgY3wZirkTmOwDDjmi'
let hashedPassword2 = '$2a$10$EEKdSUoZC31NmKpdk3HUn.wGFLjJE7Le09F6H7QnEC4hiv1KPdl4q'
let hashedPassword3 = '$2a$10$NfLw4BTI/5ODwGNFj3nNHe7Pet.hIIeCaBzOp86TOtHl9Mq69ydtk' // k -> K в конце строки
let hashedPassword4 = '$2a$10$6ykBEOXmouYvR9gWKmcISenkdXurfTchGmsHYEBQ8iHz8loVLm4vm'

let resultCompare1 = bcrypt.compareSync(password, hashedPassword1)
let resultCompare2 = bcrypt.compareSync(password, hashedPassword2)
let resultCompare3 = bcrypt.compareSync(password, hashedPassword3)
let resultCompare4 = bcrypt.compareSync("asd123", hashedPassword4)

let y = bcrypt.getSalt("hashedPassword1hashedPassword1hashedPassword1hashedPassword1")

console.log("resultCompare1: ", resultCompare1)
console.log("resultCompare2: ", resultCompare2)
console.log("resultCompare3: ", resultCompare3)
console.log("resultCompare4: ", resultCompare4)

console.log("SALT: ", y)












