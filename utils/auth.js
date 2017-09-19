const {User} = require('./../node-samples/mongo-api/models/UserModel')

// This method is used like Middleware
let authenticate = async (req, res, next) => {
    let token = req.header('x-auth')

    if(!token) return res.status(401).json({'error': 'A valid token must be set in x-auth header!'})

    let user = null

    try {
        /**
         * User.findByToken === SchemaUser.statics.findByToken
         */
        user = await User.findByToken(token)
    } catch (e){
        // console.error(e.message)
        return res.status(401).json({'error':e.message})
    }

    if( user === null ) return res.status(404).json({'error': 'The given token is unauthorized (no such user)'})

    // мы можем произвольно добавлять поля в объекты req и res, а потом пользоваться ими в функциях-обработчиках соответсвующих запросов
    res.user = user // возможно, более правильно юзать req.user
    req.token = token // решил положить токен в request

    next()
};

module.exports = {
    authenticate
}
