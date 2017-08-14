/**
 * Perform a connection to mongoDB
 *
 * @type {any}
 *
 * Можно добавить проверку:
 * if process.env.NODE_ENV == dev
 *  process.env.MONGO_URI = mongodb://localhost:27017/todoApp
 * if process.env.NODE_ENV == test
 *  process.env.MONGO_URI = mongodb://localhost:27017/todoAppTest
 */

const mongoose = require('mongoose');

const dbName = 'todoApp'
const uri = `mongodb://localhost:27017/${dbName}`

mongoose.Promise = global.Promise;

mongoose.connect(
    uri,
    {
        useMongoClient: true,
        poolSize: 4
    }
);

module.exports = {mongoose};