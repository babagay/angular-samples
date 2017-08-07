/**
 *
 * @see http://mongoosejs.com/docs/connections.html#use-mongo-client
 *
 * [use]
 * node node-samples/mongoose
 *
 * @type {any}
 */
var assert = require('assert');
const expect = require('expect')

const mongoose = require('mongoose')

var bluebirdPromise = require("bluebird");

// Используем промис от bluebird
mongoose.Promise = bluebirdPromise;

// используем встроенный промис
// mongoose.Promise = global.Promise;

const dbName = 'test'
const uri = `mongodb://localhost:27017/${dbName}`

// используем альтернативную либу, которая сама оборачивает в промисы
// const MongooseConnection = require('mongoose-connection-promise');

try {
    // тест, присоединен ли встроенный промис к мангусту
    assert.equal(query.exec().constructor, global.Promise);
    console.log("использован нативный промис");
} catch (e) {
}

try {
    expect(query.exec().constructor).toEqual(bluebirdPromise);
    console.log("использован промис от bluebird");
} catch (e){}

// Default Options (устаревший формат)
// const defaultOpts = {
//     debug: false,
//     host: 'localhost',
//     port: 27017,
//     database: 'test',
//     connectOptions: {
//         db: {},
//         server: {
//             poolSize: 4,
//             auto_reconnect: true
//         },
//         replset: {},
//         user: {},
//         pass: {},
//         auth: {},
//         mongos: {}
//     }
// };


// Run Helper
async function run() {
    await mongoose.connect(
        uri,
        {
           useMongoClient: true,
           // server: { poolSize: 4 } // the server/replset/mongos options are deprecated
           poolSize: 4
        })
}

run().then( res => {
        // console.log(res, "RESz") // undefined

    // Работает и так, и, если весь код погрузить внутрь then()
    // })
    // .catch( e => {
    //     console.log("Что-то пошло не так", e)
    // });

    // mongoose.connect('mongodb://localhost:27017/test', { useMongoClient: true });

    // OK, но ругается:
    // DeprecationWarning: `open()` is deprecated in mongoose >= 4.11.0, use `openUri()` instead, or set the `useMongoClient` option if using `connect()` or `createConnection()`. See http://mongoosejs.com/docs/connections.html#use-mongo-client
    // const mongooseConnection = new MongooseConnection(defaultOpts);
    //
    // mongooseConnection.connect().then( connection => {
    //     console.log("Connected: OK")
    // }).catch(err => {
    //     // an error occurred
    //     console.log('Error creating a mongoose connection', err);
    // });

    // [!] Код не заработал. Вместо него заюзал mongoose-connection-promise
    // Use native promises
    // mongoose.Promise = global.Promise;
    //
    // const useMongoClient = true;

    // var db = mongoose.createConnection(
    //         uri,
    //         // { server: { poolSize: 4 }},
    //         // useMongoClient
    //     );
    //
    // // db.open(uri);
    //
    // db.then( dbConn => {
    //     console.log('DB connected')
    // });

    // [!] Можно юзать внешние библиотеки промисов
    // // Use bluebird
    // mongoose.Promise = require('bluebird');
    // assert.equal(query.exec().constructor, require('bluebird'));
    //
    // // Use q. Note that you **must** use `require('q').Promise`.
    // mongoose.Promise = require('q').Promise;
    // assert.ok(query.exec() instanceof require('q').makePromise);

    var SchemaBand = new mongoose.Schema({ name: 'string', members: 'array', style: "string"});
    var Band = mongoose.model('Band', SchemaBand);

    var gnr = new Band({
        name: "Roxette",
        members: ['Man', 'Blondie'],
        style: "rock"
    });

    // OK
    // Band.create(gnr, function (err, small) {
    //     if (err) return handleError(err);
    //     // saved!
    // });

    // OK
    Band.find({ style: "rock" }).where('name').eq("Guns N' Roses").exec().then( r => {
        console.log(r, "FIND Guns N Roses")
    });

    var query = Band.find({name: "Roxette2"});

    // fixme (not working)
    query.exec( data => {
         // console.log(data, "FIND Roxette")
     });

    // OK
    // Band.find({ style: "rock" }).exec().then( r => {
    //     console.log(r, "FIND rock")
    // });

    // OK
    // Band.find({ name: "Roxette2" }).exec().then( r => {
    //     console.log(r, "FIND Roxette2")
    // });

    // mongoose.close()

    var otherBand = new Band({
        title: "Louf",
        members: ["Ivan"],
        style: "Folk"
    });

    // OK, но, если так сделать, title будет отброшено, т.к. оно отсутсвует в схеме SchemaBand
    // otherBand.save().then( doc => {
    //     console.log(doc, "DOC Louf")
    // }, err => {
    //     console.log(err, "Err 2")
    // } );

    // OK
    // Band.find({ title: "Louf" }).exec().then( r => {
    //     console.log(r, "FIND Louf")
    // });

    // ----------------------------------------------------
    // Работа с коллекцией документов Todo


    var SchemaTodo = new mongoose.Schema({
        id: {
            type: Number,
            default: 1001
        },
        completed: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
            type: String,
            required: true,
            minlength: 4,
            trim: true
        },
        completedAt: {
            type: Number,
            default: null
        }
    });

    /**
     * Допустимые типы данных:
     * @see http://mongoosejs.com/docs/guide.html
     */
    var Todo = mongoose.model('Todo', SchemaTodo);

    // fixme
    SchemaTodo.methods.customFindMethod = (cb) => {
        return this.model('Todo').find({ completed: this.completed }, cb);
    }

    // [!] Если задать title: true, значение будет превращено в строку
    var newItem = new Todo({
        //id: 7007,
       completed: false,
       title: " Peti skeen "
    });

    // OK - сохраняет в defaultOpts.database/todos. Имя коллекции генерится автоматически
    // Todo.create(newItem, (err, res) => {
    //     console.log(err,"ERR")
    //     console.log(res,"rrr")
    // });

    // OK - сохраняет в БД test в коллекцию todos. Причем, имя todos создается автоматически, если нет такой коллекции
    newItem.save()
            .then( doc => {
                console.log(doc,"res")
            }).catch( err => {
               console.log(err,"ERR")
            });


    // ---------- Gizmo ------
    /**
     * Validators: http://mongoosejs.com/docs/validation.html
     */
    var SchemaGizmo = new mongoose.Schema({
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 4,
            validate: {
                validator: val =>
                    /[\w]{4,120}/.test(val),
                message: '{VALUE} is not a valid title'
            }
        }
    });

    // Автоматом создает коллекцию  defaultOpts.database/Gizmos
    var Gizmo = mongoose.model('Gizmo', SchemaGizmo);

    var newItemGizmo = new Gizmo({
        title: "Caprismo"
    });

    // OK
    newItemGizmo.save().then( doc => {
        console.log(doc,"Captizmo saved")
    }).catch( e =>  console.log(e) );

})
    .catch( e => {
        console.log("Что-то пошло не так", e)
    });