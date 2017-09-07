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

    res.user = user
    res.token = token

    next()
};

module.exports = {
    authenticate
}