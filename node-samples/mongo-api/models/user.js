/**
 * User CRUD methods
 *
 * @type {any}
 */
const mongoose = require('mongoose');
const {ObjectID} = require('mongodb')
const validator = require('validator')
const {getToken:getJwtToken, getTokenStr:getJwtTokenStr} = require('./../../../utils/jwt')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') // для проверки пароля

// Создает переменную User и вкидывает в нее UserModel.User
const {User} = require('./UserModel')

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


/**
 *  [usage]
 *      name: 'Boris GodunoffDasd',
 *      email: 'ant@i.ua'
 *      password: 'asd123!' - с ! на конце, как во время смены пароля
 */
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

        if( process.env.NODE_ENV !== 'test' ) {
          console.log("DEBUG: addUser()", e)
        }

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
        console.log("DEBUG: getUser()", e)
        var mess = e.message || e
        res.status(400)
        res.send({'error': mess})
    } );
}

// В постмане юзать x-www-form-urlencoded либо raw
// 202 Accepted
// 400 Bad request
// 401 Unauthorized
// 403 Forbidden
/**
 * Возвращает x-auth-token, который можно использовать в GET user/me
 * Если пароль не верный, выданный ранее токен обнуляется
 * @param req
 * @param res
 */
let loginUser = (req, res) => {

  let body = _.pick(req.body, ['email','password'])

  User.findByCredentials(body.email, body.password)
      .then( doc => {

        if( !doc ) {
            // Сюда интерпретатор попадает, когда юзер найден (по мылу), пароль был отправлен, но он не верный
            // Исходя из этого, можно аннулировать старый токен

            User.findOne({email:body.email}).then( user => {
                user.tokens = []
                user.save()
            });

            throw new Error('User exists but wrong password gotten')
        }

        return doc
  })
      .then( usrObj => {

          // let user = new User(req.body);
          let user = new User( usrObj );

          // сгенерировать новый токен (сохранив его в базу) и вернуть его юзеру
          /* return */ user.generateAuthToken().then( token => {
              res.header( 'x-auth', token )
                  .status( 202 )
                  .send( user );
          });
  })
      .catch( e => {
          // можно так:  res.status(401).send( e.message ), но мы не знаем, какое сообщенеи сюда прилетело - сгенеренное нами (показывать можно) или системно (скрыть, но записать в лог)
          // Здесь можно настроить сепарацию ошибок - отправлять на фронт свои, но прятать системные
          res.status(403).send({'message': 'Forbidden'})
  });



  // OK
  // User.findOne({"email":req.body.email}).then( doc => {
  //
  //     let hashedPassword = doc.password
  //
  //     if( !bcrypt.compareSync(req.body.password, hashedPassword) ){
  //       res.status(404).send({'message': 'Not found'})
  //     } else {
  //       res.status(200).send({'message': 'Ok'})
  //     }
  //  }).catch( err => {
  //     res.status(401).send({'message': 'User not found'})
  //   });
};

// Обнуляем токен
// [!] попробуем здесь не возвращать никаких сообщений типа "обнуление токена прошло удачно", а просто вернем измененный объект юзера
// [!] после того, как отработал посредник authenticate, в поле res.user лежит документ User, соответсвующий текущему юзеру
let logoutUser = (req,res) => {

    let callback = (err, raw) => {
      if( err === null && raw.ok === 1 ){
        res.status(200).json({'message':'Ok', 'modified': raw.nModified })
      } else {
        res.status(401).json({'error': err.message})
      }
      console.log("raw",raw)
    }

    // [!] req.token появился после работы authenticate
    res.user.removeToken(req.token, callback);



    // Ok
    // Здесь исп-ся плоский кэтч + промисообразный, т.к. User.findByToken кидает эксепш
    // Прикол, однако, в том, что посредник authenticate уже вытянул документ юзера через тот же метод findByToken() и положил его в res.user
    // try {
    //     User.findByToken(req.params.token).then( doc => {
    //         User.findOne({_id:doc._id}).then( user => {
    //           user.tokens = []
    //           user.save()
    //           res.status(200).send({'User':user})
    //         });
    //     }).catch(e => {
    //       res.status(401).json({'error':'User is not authenticated.'})
    //     });
    //
    // } catch (e){
    //   res.status(401).json({'error':'User is not authenticated'})
    // }
};

// С использованием middleware
let getUserMe = (req, res) => {
    res.send({'User':res.user})
}

// OK - Без использования middleware
// let getUserMe = async (req, res) => {
//
//     let token = req.header('x-auth')
//
//     if(!token) return res.status(400).json({'error': 'Token must be set in x-auth header'})
//
//     let user = await User.findByToken(token)
//
//     if(user === null) return res.status(401).json({'error': 'Token is invalid'})
//
//     res.status(200).send(
//         {
//             'User': user
//         }
//     );
// }



/**
 * [!] Когда в постмане отправляем Raw-данные, ставим вручную Content-Type = application/json
 *     Если же, x-www-form-urlencoded, то  заголовок будет автоматически выставлен в application/x-www-form-urlencoded
 */
// [!] Допустимые типы контента (заголовок content-type): application/x-www-form-urlencoded
// [!] ID пользователя, которого мы меняем передается явно в виде параметра вместо того, чтобы доставать его из auth-токена
let updateUser = (req, res) => {

  let userId = req.params.id;

  if( req.headers['content-type'].match( /application\/x-www-form-urlencoded/i ) ||
      req.headers['content-type'].match( /application\/json/i )
  ){
    // OK
  } else
    return res.status(400).send({'error': 'Invalid type of Content: ' + req.headers['content-type']})

  User.findById({_id: userId})
    .then(doc => {

    if (doc === null)
      throw new Error("No user with such ID: " + userId)

    // [!] doc при распечатке его через console.log() выглядит как объект: {name: foo, email: bar, ...}
    // Однако, в реальности это результат действия toString()-метода.
    // Сам объект имеет куда более сложную структуру, а собственно, документ 'пользователь' лежит в поле doc._doc

    let _passwordOld = doc._doc.password

    let userObject = Object.assign(doc, req.body)

    if (req.body.password === undefined ||
      userObject.isPasswordModified() !== true
    ) {
      // убрать из объекта поле password
      delete userObject._doc.password
      userObject._doc.password = _passwordOld
    }

    // [!] Для вывода всех исключений в единый кэтч ставим return
    return userObject.save().then(doc => {
      res.send({
        message: "Document updated!",
        doc: doc
      })
    });

  }).catch(e => {
    console.log(e)
    var mess = e.message || e
    res.status(400)
    res.send({'error': mess})
  });
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
    getUserMe,
    dropUser,
    updateUser,
    getAll,
    loginUser,
    logoutUser
};
