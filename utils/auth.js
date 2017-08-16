const {User} = require('./../node-samples/mongo-api/models/UserModel')

// Middleware
let authenticate = async (req, res, next) => {
    let token = req.header('x-auth')

    if(!token) return res.status(401).json({'error': 'Token must be set in x-auth header'})

    let user = null

    try {
        user = await User.findByToken(token)
    } catch (e){
        return console.error(e.message)
    }

    if( user === null ) return res.status(401).json({'error': 'Token is invalid'})

    res.user = user
    res.token = token

    next()
};

module.exports = {
    authenticate
}