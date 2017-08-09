/**
 * node node-samples/mongo-api/queries.js
 * Ctrl-C остановить сценарий
 *
 * https://docs.mongodb.com/manual/tutorial/query-documents/ - запросы для использования в оболочке типа RoboMongo
 * http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html - запросы для использования в ноде
 */
let {ObjectID} = require('mongodb')

let {mongoose} = require('./connection');

let {Todo, add:addTodo, getAll:getAllTodos} = require('./models/todo');

let id = "5988a108f62f000b809c71c0"
let id2 = "5988a1664b9e9508c08447f4"
let id3 = "5988ab1f0ffe1e10687878e2"

if( !ObjectID.isValid(id3) )
    console.log("id3 is invalid")

Todo.find({_id:id}).then( doc => {
    console.log( doc )
}).catch( e => {
   console.log(e)
});

Todo.findOne({_id:id2}).then( doc => {
    console.log( doc )
}).catch( e => {
   console.log(e)
});

Todo.findById(id3).then( doc => {
    if( !doc )
        return console.log( "Doc not founnd" )
    console.log( doc )
}).catch( e => {
   console.log(e)
});
