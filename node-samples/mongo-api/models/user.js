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
    getUserMe,
    dropUser,
    updateUser,
    getAll,
    loginUser
};
