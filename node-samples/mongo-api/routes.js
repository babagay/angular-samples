
// [?] Object destructuring example
var {mongoose} = require('./connection');

// var Todo = require('./models/todo'); - можно так
var {Todo} = require('./models/todo');


var User = require('./models/user');

// fixme так не работает
var errorHandler = (e,res) => {
    console.log(e)
    var mess = e.message || e
    res.status(400)
    res.send({'error': mess})
}

module.exports = (app) => {

    app.get('/todo', function (req, res) {

        // var title = "Second"
        // Todo.find({ title: title })

        Todo.find({ }).exec().then( r => {
            console.log(r, `FIND ${title}`)
            res.send( JSON.stringify(r) )
        }).catch( e => {
            console.log(e)
            var mess = e.message || e
            res.status(400)
            res.send({'error': mess})
        });

    });

    /**
     * В постмане выставить Raw во вкладке Body
     * И выбрать в выпадающем списке JSON(application/json)
     * [example]
     *  {
     *       "id": "4",
     *       "title": "Fourth",
     *       "completedAt": null
     *  }
     */
    app.post('/todo', (req,res) => {

        var newTodoItem = new Todo({
            id: req.body.id,
            title: req.body.title,
            completedAt: req.body.completedAt
        });

        newTodoItem.save().then( doc => {
            console.log(doc,"newTodoItem saved")
            res.status(200)
            res.send({
                doc: doc
            })
        }).catch( e => {
            console.log(e)
            var mess = e.message || e
            res.status(400)
            res.send({'error': mess})
        } );
    });

};
