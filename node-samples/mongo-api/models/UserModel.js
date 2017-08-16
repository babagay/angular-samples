const mongoose = require('mongoose');
const {ObjectID} = require('mongodb')
const validator = require('validator')
const {getToken:getJwtToken, getTokenStr:getJwtTokenStr} = require('./../../../utils/jwt')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

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

// Добавление статического метода стандартным способом
SchemaUser.getSalt = function () {
    let salt = 'abc123'
    return salt;
}

// не работает
// SchemaUser.__proto__.foo = ()=>{}

// Расширяем модель новым методом
// [!] не используем стрелочную функцию, т.к. нам нужна ссылка на this
// SchemaUser.methods - instance methods
SchemaUser.methods.generateAuthToken = function () {
    let user = this
    let access = 'auth'
    let salt = SchemaUser.getSalt()

    let token = getJwtTokenStr({_id: user._id.toHexString(), access: access},salt)

    user.tokens.push({
        access,
        token
    });

    return user.save().then( () => token );
}

/**
 * Через магию async/await можно промис превратить в примитив или объект! Точнее, сэмулировать
 * Но, тогда, и функцию getUserMe() нужно тоже сделать async'хронной и использовтьа внутри await, иначе, она будет принимать тот же промис от findByToken()
 * В случае ошибки возвращаем null, - тогда, не надо оборачивать вызов fetchUser() в try ... catch
 *
 * @param User
 * @param id
 * @returns {Promise|*|Promise.<T>}
 */
let fetchUser = (User, id, token, auth) => {
    // return User.findById({_id: id}).then( doc => doc ).catch( e => null ) // OK
    return User.findOne({_id: id, 'tokens.token': token, 'tokens.access': auth}).then( doc => doc ).catch( e => null )
}

// Добавление статического метода через SchemaUser.statics
// Опять-таки, избегаем стрелочной нотации
SchemaUser.statics.findByToken = async function (token) {
    let User = this;
    let salt = SchemaUser.getSalt()
    let decodedObject
    let document = null
    let auth = 'auth'

    try {
        decodedObject = jwt.verify(token, salt);
    } catch (e){
        return null
    }

    // try {
    if (ObjectID.isValid(decodedObject._id)) {
        document = await fetchUser(User, decodedObject._id, token, auth)
        // Если вывести здесь сщтыщдуюдщп(document), мы увидим object|null. Однако, findByToken() возвратит, все-равно, промис!
        // Поэтому, там, где мы его вызываем, также используем async/await
    }
    // } catch (e){
    //         // Полезно для дебага или, если здесь есть код, который может бросить исключение
    //         console.log(e)
    // }

    return document
};

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

module.exports = {
    User
}