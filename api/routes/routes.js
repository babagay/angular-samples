var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {

    app.post('/todo', (req, res) => {
        // Здесь будем создавать тудушку.

        console.log(req.body)
        console.log( 'Adding...' )

        const newObj = {
            id: req.body.id,
            completed: req.body.completed,
            title: req.body.title
        }

        db.collection('todo').insertOne(newObj).then( (r) => {
            console.log( 'Ok' )
            res.send( r.ops[0] ) // {    "id": "302",    "completed": "false",    "title": "Baz",    "_id": "594bfd942436b325fc290b75"  }
        }).catch( e => {
            res.send({ 'error': 'An error has occurred' });
            console.log( e )
        });


    });

    app.get('/todo', function (req, res) {

        db.collection('todo').find( {  }).toArray( (err,items) => {

            if( err != null ){
                var mess = err.message || err
                console.log( mess )
                res.status(400)
                res.send({'error': mess})
            } else {
                res.send( JSON.stringify(items) )
            }



        });
    });

    app.get('/todo/:id', (req, res) => {

        const id = req.params.id; // 594bfd942436b325fc290b75
        const details = { '_id': new ObjectID(id) };

        db.collection('todo').findOne(details).then( item => {
            res.send(item);
        } ).catch( e => {
            res.send({'error':'An error has occurred'});
            console.log(e)
        } )
    });

    app.delete('/todo/:id', (req, res) => {
        const id = req.params.id;
        const details = {'_id': new ObjectID(id)};

        // try {
        //     const details = {'_id': new ObjectID(id)};
        // } catch (e){
        //     var msg = e.message || e
        //     res.status(400)
        //     res.send({'error': msg})
        // }

        console.log('Deleting item ['+id+']')

        db.collection('todo').removeOne(details).then( r => {

            console.log('OK')

            res.send({message:'Item ' + id + ' deleted!'});

        } ).catch( e => {
            var mess = e.message || e
            console.log( mess )
            res.send({'error': 'ERROR'})
        });
    });

    // fixme не пашет
    app.put('/todo/:id', (req, res) => {

        const  id = req.body.id

        const todoItem = {
            id: id,
            completed: req.body.completed,
            title: req.body.title
        }

        console.log('Updating item... ' + id)
        console.log('New values: ', todoItem)


        const filter = { '_id': new ObjectID(todoItem.id) };

        // console.log(filter)

        // НЕ РАБОТАЕТ
        db.collection('todo').updateOne(
            { "_id" : new ObjectID(todoItem.id) },
            { $set: todoItem },
            { upsert: true }
        ).then( r => {
            console.log('OK', !!r.result.ok )

            res.send({message:'Item ' + id + ' updated!'});
        }).catch( e => {
            var mess = e.message || e
            console.log( mess + '!' )
            res.status(400)
            res.send({'error': mess})
        });



    });
};


// db.collection('todo').find().toArray( (error,result) => {
//     if (error) {
//         throw error;
//     }
//     console.log('res');
//     console.log(result);
// } );



































