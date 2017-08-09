const mongoose = require('mongoose');

let SchemaUser = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            validate: {
                validator: val =>
                    /[\w]{3,120}\W{0,1}\w{0,120}/.test(val),
                message: '{VALUE} is not a valid name'
            }
        },
        createdAt: {
            type: Number,
            required: false
        }
    },
    {
        versionKey: false
    }
);

// Hook перед операцией сохранения
// fixme не работает
SchemaUser.pre('save', next => {
    now = new Date()

    if(!this.createdAt) {
        this.createdAt = now.getTime();
    }

    next()
})


let User = mongoose.model('User',SchemaUser);

// CRUD ----

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
    var newTodoItem = new User(req.body);

    newTodoItem.save().then( doc => {
        // console.log(doc,"new User saved")
        res.status(200)
        res.send({
            message: "Document successfully added!",
            doc: doc
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
    dropUser,
    updateUser,
    getAll
};