const mongoose = require('mongoose');
const {ObjectID} = require('mongodb')
const validator = require('validator')
const {getToken:getJwtToken, getTokenStr:getJwtTokenStr} = require('./../../../utils/jwt')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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
            required: true, // вообще, здесь надо true
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
// [usage]
//    var user = new User(req.body);
//    user.generateAuthToken().then( token => {})
SchemaUser.methods.generateAuthToken = function () {
    let user = this
    let access = 'auth'
    let salt = SchemaUser.getSalt()

    let token = getJwtTokenStr({_id: user._id.toHexString(), access: access},salt)

    // При такой схеме токены будут накапливаться
    // user.tokens.push({
    //     access,
    //     token
    // });

    user.tokens = [];
    user.tokens.push({
            access,
            token
            // [?] здесь откуда-то берется третьм параметром _id
        });

    return user.save().then( () => token );
};

// Для использования top level операторов (таких, как $pull) необходимо, чтобы метод (напр, findOneAndUpdate()) был вызван на модели (в данном случае, User).
// Т.е. removeToken() не должен быть статическим (SchemaUser.statics.removeToken)
SchemaUser.methods.removeToken = function (token, callback) {

  /**
   * @var SchemaUser user
   * @type {mongoose.Schema.methods}
   */
    // user.update - не заработало
  var user = this; // Документ типа SchemaUser?


  // Работает только через колбэк
  User.update({"tokens.token": token}, {  tokens: [] }, callback);


  // Работает, но только через колбэк , а не промис
  // User.findOneAndUpdate(
  //   // Search conditions
  //   {
  //     // $pull: {  tokens: { token: token }  } - не заработало
  //     // "tokens.token": token
  //     // [!] Поиск не по значению поля, а, когда значением поля является заданный объект
  //     "email": "Lugo@in.ua"
  //   },
  //   // Update object
  //   {
  //     tokens: []
  //   },
  //   // options
  //   {
  //     "new": true,
  //     passRawResult: true
  //   },
  //   (err,doc,rawResult) => {
  //     callback()
  //   }
  // );
};

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
// [!] Как найти юзера в МонгоДБ по его маркеру?
//     Фишка в том,  что мы встроили(захешировали) объект юзера в сам токен, откуда мы можем достать _id!
// [usage]
//    User.findByToken(token);
SchemaUser.statics.findByToken = async function (token) {
    let User = this;
    let salt = SchemaUser.getSalt()
    let decodedObject
    let document = null
    let auth = 'auth'

    try {
        decodedObject = jwt.verify(token, salt);
    } catch (e){
        throw new Error("Token is invalid")
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




SchemaUser.statics.findByCredentials = async function (email, password) {

  let user = await User.findOne({"email":email})

  let hashedPassword = user.password

  if( !bcrypt.compareSync(password, hashedPassword) ){
      return false
      // [!] можно вместо ретурна кидать исключение, но, тогда в клиентском коде
      //     нужно как-то риличать его от системных исключений
      // throw new Error("foo")
  }

  return user
};

/**
 * Если в запросе прилетел пароль в виде plain-text, (c "!" на конце) считаем, что юзер хочет изменить пароль
 * Тогда, нам надо положить в базу хэш этого пароля
 * Не представляю, как определить, что полученная строка - это именно не хэш, а просто текст, поэтому,
 * при смене пароля можно добавлять в конец строки некий спец-символ, например, !, который будет однозначно указывать, что имеет место операция смены пароля
 *
 * Логика функции: If user.password is plain text return true
 *
 * @returns {boolean}
 */
SchemaUser.methods.isPasswordModified = function () {

    let userFromRequest = this
    let userPass = undefined

    try {
        userPass = userFromRequest.password
    } catch (e){}

    if( userPass === undefined )
        return false;

    if( userPass.slice(-1) === '!' )
        return true
}

// Hook перед операцией сохранения
// [!] чтобы корректно отрабатывала ссылка на текущего юзера (this),
// нужно использовать не стрелочную функцию, а обычную
SchemaUser.pre('save', function(next) {

    let user = this

    now = new Date()

    // Добавить время сохранения
    if(!this.createdAt) {
        user.createdAt = now.getTime();
    }

    // Захешировать пароль, если он пришел в открытом виде
    if( user.isPasswordModified() ){

        user.password = user.password.slice(0, -1) // Удалить спецсимвол на конце строки, который говорит о том, что идет смена пароля

        bcrypt.genSalt(10).then( saltGenerated => {
            let hashGenerated = bcrypt.hashSync(user.password, saltGenerated)
            user.password = hashGenerated
            next()
        })

    } else
        next();

    // getJwtToken({},'asd').then( token => {
    //         userObj.tokens = {}
    //         userObj.tokens.access = token
    //         console.log(token)
    //         next()
    //     });

    // next()
});

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
