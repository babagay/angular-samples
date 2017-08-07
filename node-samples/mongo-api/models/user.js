

const mongoose = require('mongoose');

var SchemaUser = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        validate: {
            validator: val =>
                /[\w]{4,120}/.test(val),
            message: '{VALUE} is not a valid name'
        }
    }
});

module.exports = SchemaUser;