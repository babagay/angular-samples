/**
 * Perform a connection to mongoDB
 *
 * @type {any}
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