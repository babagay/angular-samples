const mongoose = require('mongoose');
const validator = require('validator')
const {getToken:getJwtToken, getTokenStr:getJwtTokenStr} = require('./../../../utils/jwt')
const _ = require('lodash')

let basicScheme = mongoose.Schema


let SchemaUser = new basicScheme(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            validate: {
                validator: val =>
                    /[\w]{3,120}\W{0,1}\w{0,120}/.test(val),
                message: '{VALUE} is not a valid name'
            }
        },
        createdAt: {
            type: Number,
            required: false
        },
        email: {
            type: String,
            required: false, // вообще, здесь надо true
            trim: true,
            minlength: 5,
            unique: true,
            validate: {
                validator: val =>
                    validator.isEmail(val)
                ,
                message: '{VALUE} is not a valid email'
            }
        },
        password: {
            type: String,
            required: false, // must be true
            minlength: 6
        },
        tokens: [{
          access: {
              type: String,
              required: false //  must be true
          },
          token: {
                type: String,
                required: false //  must be true
            }
        }]
    },
    {
        versionKey: false
    }
);

// Hook перед операцией сохранения
// fixme не работает
SchemaUser.pre('save', next => {
    now = new Date()

    if(!this.createdAt) {
        this.createdAt = now.getTime();
    }

    // let userObj = this
    // getJwtToken({},'asd').then( token => {
    //         userObj.tokens = {}
    //         userObj.tokens.access = token
    //         console.log(token)
    //         next()
    //     });

    next()

})

// не работает
// SchemaUser.__proto__.foo = ()=>{}

// Расширяем модель новым методом
// [!] не используем стрелочную функцию, т.к. нам нужна ссылка на this
SchemaUser.methods.generateAuthToken = function () {
    let user = this
    let access = 'auth'
    let salt = 'abc123'

    let token = getJwtTokenStr({_id: user._id.toHexString(), access: access},salt)

    user.tokens.push({
        access,
        token
    });

    return user.save().then( () => token );
}

// OK - закоменчено, чтоб не отваливались тесты
// [!] Можно переопределить метод toJSON(), чтобы возвращать
// сокращенный объект юзера
// SchemaUser.methods.toJSON = function () {
//     let user = this
//     let userObj = user.toObject()
//     return _.pick(userObj,['_id','email'])
// }

let User = mongoose.model('User',SchemaUser);

// User.foo = () => "-" // OK
// User.__proto__.foo = () => "+" // OK
// console.log( User.foo({},'asd') ) // -

// OK, но лучше хранить метод в SchemaUser.methods
// User.generateAuthToken = getJwtToken // Расширяем модель внешней функцией



/**
 * [!] Магия: работает без приведения _id к объекту (new ObjectID(req.params.id))
 *
 * @param req
 * @param res
 */
function dropUser(req, res) {
    User.remove({_id: req.params.id}).then( (r) => {

        let message = "Item was not deleted!"
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
}



let addUser = (req, res) => {
    var user = new User(req.body);

    user.save().then( () => {

        // после вставки токен-генератора появился еще один then(), в который переехал код res.send()
        return user.generateAuthToken()

    }).then( token => {

        // после вставки токен-генератора был добавлен заголовок
        res.header('x-auth',token)
        res.status(200)

        res.send({
            message: "Document successfully added!",
            doc: user
            // doc: user.toJSON() // можно так
        })
    }).catch( e => {
        if( process.env.NODE_ENV !== 'test' )
            console.log(e)
        var mess = e.message || e
        res.status(206)
        res.send({'error': mess})
    } );
}


let getUser = (req, res) => {
    User.findById({_id: req.params.id}).then( doc => {
            res.send({
                message: "Document found!",
                doc: doc
            });

    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
}

let updateUser = (req, res) => {

    User.findById({_id: req.params.id}).then( doc => {
        // [!] Для вывода всех исключений в единый кэтч ставим return
        return Object.assign(doc, req.body).save().then( doc => {
            res.send({
                message: "Document updated!",
                doc: doc
            })
        });
    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
}

let getAll = (req, res) => {
    User.find({ }).exec().then( r => {
        // res.send( JSON.stringify(r) )

        res.json( r )
    }).catch( e => {
        console.log(e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    });
}

module.exports = {
    User,
    addUser,
    getUser,
    dropUser,
    updateUser,
    getAll
};