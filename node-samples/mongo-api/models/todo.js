const mongoose = require('mongoose')

const {ObjectID} = require('mongodb')

const _ = require('lodash')

var SchemaTodo = new mongoose.Schema({
    // Чтобы можно было генерировать самостоятельно id-ники
    _id: {
      type: Object,
      required: false,
      default: null
    },
    id: {
      type: Number,
      default: 1001,
      required: false,
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
    },
    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    versionKey: false // __v ключ
  }
);

/**
 * Middleware
 * @see http://mongoosejs.com/docs/middleware.html
 * @see https://gist.github.com/closrks/0fb01bf51612e03017ae
 *
 * SchemaTodo.post('save', function(doc,next)
 *
 * fixme completed не работает, как надо - не может сохранить completed = true
 */
SchemaTodo.pre('save', function(next) {
// Добавить метку времени по умолчанию

    // [!] Пришлось явно генерить _id, т.к. при таком раскладе (когда это поле есть в схеме SchemaTodo),
    // если не передавать _id в запросе на добавление тудушки, в ответе прилетает _id = null, хотя на деле оно генерируется
    if( this._id == null )
        // Do nothing - _id will be added automatically
        this._id = new ObjectID()

    if( this.id == null )
        this.id = Math.round( Math.random() * 100 )

    if( this.completed == null )
        this.completed = false

    if( this.completedAt == null )
        this.completedAt = (new Date()).getTime()

    next();
});

// SchemaTodo.post('save', (doc,next) => {
//     console.log(doc)
//     next()
// })

//  работает странно - вызывается в тестах
SchemaTodo.pre('remove', function(next) {
    // console.log(this._id) // Выводит строку!
    // console.log(typeof this._id) // object

    // Не прокатило
    // this._id = new ObjectID(this._id)

    next()
});

/**
 * Хак, нужный потому, что проще передать строку в поле _id, а не объект ObjectID
 * А вообще, конечно, нет никакого смысла явно указывать идентификатор, т.к. он генерируется автоматически
 */
SchemaTodo.statics.setIdMiddleware = function (req, res, next) {

  try {

    if( _.isString(req.body._id) )
      req.body._id = new ObjectID(req.body._id)

  } catch (e) {
  }

  next()
}

/**
 * Автоматически указывает автора тудушки на основании анализа auth-токена
 * @param req
 * @param res
 * @param next
 */
SchemaTodo.statics.setCreatorMiddleware = function (req, res, next) {

  let creatorId = null

  try {
    // [!] res.user._id присутсвует только, если передан валидный токен в заголовке. Из этого токена и взят _id
    if (res.user._id !== undefined)
      creatorId = res.user._id
  } catch (e) {
  }

  if (creatorId === null && req.body._creator !== undefined)
  // if( typeof req.body._creator === 'string' )
    creatorId =  req.body._creator

  if (creatorId !== null)
    req.body._creator = new ObjectID(creatorId)

  // console.log(req.body._creator) // выведет строку
  // console.dir(req.body._creator) // выведет объект

  next()
};

var Todo = mongoose.model('Todo', SchemaTodo);

/**
 * Возвращает тудушки авторизованного юзера
 */
let getAll = (req,res) => {

    // var title = "Second"
    // Туду.find({ title: title })

    // res.user._id - объект типа ObjectID
    Todo.find({ _creator: res.user._id }).exec().then( r => {

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

    Todo.find({_id: new ObjectID(id) }).exec().then( r => {

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

    let newTodoItem

    // [!] этот код гибельный , т.к. в течение всей эволюции объекта Туду нужно лезть сюда и вносить изменения
    // Для необязательных полей присвоить null'ы. А потом обработать эти значения в блоке pre('save')
    // Вообще, нужно просто скармливать объект конструктору Todo()
    // let _id = (req.body._id) ? new ObjectID(req.body._id) : null;
    // let id = (req.body.id) ? req.body.id : null;
    // let completed = (req.body.completed) ? req.body.completed : null;
    // let completedAt = (req.body.completedAt) ? req.body.completedAt : null;
    // let _creator = (req.body._creator) ? req.body._creator : null;

    // var newTodoItem = new Todo({
    //     _id,
    //     id,
    //     title: req.body.title,
    //     completed,
    //     completedAt,
    //     _creator
    // });

    try {
        newTodoItem = new Todo(req.body);
    } catch (e){
        return res.status(400).json(e);
    }

    newTodoItem.save().then( doc => {

        if( process.env.NODE_ENV !== 'test' )
            console.log(doc,"newTodoItem saved")
            res.status(200)
            res.send({
            doc: doc
        })
    }).catch( e => {
        if( process.env.NODE_ENV !== 'test' )
            console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
};

// fixme
// If id not valid - 404
// After removing if no doc send 404
//      if doc - send 200
// If error occurs send 400
// findByIdAndRemove()
let drop = (req,res) => {

    if( !ObjectID.isValid(req.params.id) ) {
        return res.status(404).send({'error': "Id is invalid"})
    }

    // OK но, ожидалось, что будет работать со строковым req.params.id
    // Todo.findByIdAndRemove( new ObjectID(req.params.id) ).then( item => {
    //     if(!item)
    //         return res.status(404).json({ message: `Not found item [${req.params.id}]` })
    //
    //     res.status(200).json({ message: "OK", doc:item })
    // }).catch( e => {
    //         console.log(e)
    //         var mess = e.message || e
    //         res.status(400)
    //         res.send({'error': mess})
    //     } );

    // И так работает только с объектом
    // туду.remove({_id : new ObjectID(req.params.id)}, (err, result) => {
    //     res.json({ message: "Item successfully deleted!", result });
    // });

    // [!] Мистика: Раньше работал толькок с объектом: туду.remove({_id: new ObjectID(req.params.id) })
    //     Теперь - со строкой
    //     Из некоторых тестов работает с объектом, из других - со строкой
    //     Видимо, из-за того, что в некоторых местах я создаю тудушку с идентификатором-строкой, а в других - с объектом
    //     TODO исправить, чтобы везде создавалась тудушка с объектом-идентификатором
    Todo.remove({_id: new ObjectID(req.params.id) }).then( (r) => {

        let message = "Todo item was not deleted!"
        let status = 404

        if(r.result.n === 1) {
            message = "Item successfully deleted!"
            status = 200
        }

        res.status(status).json({ message: message, r })

    } ).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
};

// Update for todo/:id
let up = (req,res) => {

    Todo.findById(new ObjectID(req.params.id), (err, doc) => {

        if(err) return res.send(err);

        if(!doc) return res.status(404).json({error:`Document [${req.params.id}] not found`})

        // Object.assign(target, ...sources) - копирует перечисляемые и собственные свойства объектов sources в объект target
        // @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        Object.assign(doc, req.body)
            .save()
            .then( doc => {

                if( process.env.NODE_ENV !== 'test' )
                    console.log(doc,"newTodoItem updated")
                res.status(200)
                res.send({
                    doc: doc
                })
            }).catch( e => {
                if( process.env.NODE_ENV !== 'test' )
                    console.log(e)
                var mess = e.message || e
                res.status(400)
                res.send({'error': mess})
        } );
    });

};

// fixme Примитивный вариант - меняет только поле title и не имеет обработки ошибок
// Update for /todo route
let updateObject = (req,res) => {

    if( req.body._id == undefined )
        res.status(400).json({'error': "_id must be defined"})

    if( !ObjectID.isValid(req.body._id) ) {
        return res.status(400).json({'error': "_id is invalid"})
    }

    // Создать новый объект и вкинуть в него обозначенные поля исходного объекта
    let obj = _.pick( req.body, ['title','completedAt','completed','id'] )

    // obj._id = new ObjectID( req.body._id ) // это не обязательно

    // OK
    Todo.findByIdAndUpdate(
        new ObjectID( req.body._id ),
        obj,
        // {$set: obj}, // можно и так
        {
            new: true // return modified document
        }
    ).then( doc => {
        if( !doc )
            return res.status(404).json({error:'Not found'})

        res.status(200).json({doc})
    }).catch( e => {
        res.status(400).json({error: e})
    });

    // OK
    // Todo.findOne(
    //     { _id: new ObjectID( req.body._id ) },
    //     (err, doc) => {
    //         // if (err) ..
    //
    //         if( !_.isBoolean(req.body.completed) )
    //             res.status(400).send({'error': 'completed prop must be boolean'})
    //
    //         doc.title = req.body.title;
    //
    //         let updatedDoc = Object.assign(doc,req.body)
    //         updatedDoc._id = new ObjectID(req.body._id) // [!] Потребовалось создать объект первичного ключа
    //
    //         updatedDoc.save().then( doc => {
    //             res.status(200).json({
    //                 doc: doc
    //             });
    //         }).catch( e => {
    //             var mess = e.message || e
    //             res.status(400)
    //             res.send({'error': mess})
    //         });
    //
    //
    //     }
    // );

    // Todo.update(
    //     {_id: req.body._id},
    //     {$set: { title: req.body.title}}
    // ).then( res => {
    //
    // }).catch( e => {
    //     console.log(e)
    //     var mess = e.message || e
    //     res.status(400)
    //     res.send({'error': mess})
    // } );

        /*
    Todo.find({_id: new ObjectID(req.body._id)})
        .update(
            {
                title: req.body.title
            }
        )
        .then( doc => {

        let newObj = new Todo(
            {
                title: req.body.title
            }
        );

        // [!] Для вывода всех исключений в единый кэтч ставим return
        // return newObj.save().then( doc => {
        //     res.send({
        //         message: "Document updated!",
        //         doc: doc
        //     })
        // });
    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
    */
};

// module.exports = Todo; // OK
// module.exports = {Todo}; // создаст объект {"Todo": Todo}

module.exports = {
    Todo,
    add,
    getAll,
    getOne,
    drop,
    updateObject,
    up
};
