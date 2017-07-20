var db = require('./db')

module.exports = {
    handleSignup: (email,pass) => {

        // todo validation

        db.saveUser({email,pass})

        // todo send welcome email
    }
}