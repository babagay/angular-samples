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
    getAll
};