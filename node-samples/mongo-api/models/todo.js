const mongoose = require('mongoose')

const {ObjectID} = require('mongodb')

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
        type: Number, // timestamp
        default: null
    }
});

var Todo = mongoose.model('Todo', SchemaTodo);



let getAll = (req,res) => {

    // var title = "Second"
    // Todo.find({ title: title })

    Todo.find({ }).exec().then( r => {
        //console.log(r, `FIND ${title}`)

        // res.send( JSON.stringify(r) )
        res.json( r ) // так лучше для отладки

    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    });
}

/**
 * Здесь идёт жёсткая привязка к типу http-запроса: мы предполагаем, что работаем с get-запросом вида <some-endpoint-name>/:id
 * В добавок, мы здесь работаем с объектом res (http response)
 *
 * Пример дополнительных boilerplate проверок
 *
 * @param req
 * @param res
 */
let getOne = (req,res) => {

    let id = req.params.id

    if( !ObjectID.isValid(id) ){
        return res.status(404).send({'error': "Id is invalid"})
    }

    Todo.find({_id:id}).exec().then( r => {

        // В случае ошибки попадаем в catch
        // throw new Error("asd")

        if( r.length == 0 ){
        // if( !r ){ // не работает
            return res.status(404).json({'error': `Document [${id}] not found`})
        }

        res.json( r )

    }).catch( e => {
        if( process.env.NODE_ENV !== 'test' )
            console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    });
}



let add = (req,res) => {
    var newTodoItem = new Todo({
        id: req.body.id,
        title: req.body.title,
        completedAt: req.body.completedAt
    });

    newTodoItem.save().then( doc => {
        console.log(doc,"newTodoItem saved")
        res.status(200)
        res.send({
            doc: doc
        })
    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
};

// module.exports = Todo;
// module.exports = {Todo}; // создаст объект {"Todo": Todo}

module.exports = {
    Todo,
    add,
    getAll,
    getOne,
};