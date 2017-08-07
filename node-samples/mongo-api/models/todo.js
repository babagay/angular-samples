
const mongoose = require('mongoose')

var SchemaTodo = new mongoose.Schema({
    id: {
        type: Number,
        default: 1001
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    title: {
        type: String,
        required: true,
        minlength: 4,
        trim: true
    },
    completedAt: {
        type: Number,
        default: null
    }
});

var Todo = mongoose.model('Todo', SchemaTodo);

// module.exports = Todo;
module.exports = {Todo};