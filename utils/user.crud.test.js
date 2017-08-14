/**
 * Тестирование http-запросов
 * Использован: chai в качестве assertion-либы
 * expect и assert - тоже изнутри chai
 * @see http://chaijs.com/plugins/chai-http/
 */
let {mongoose} = require('../node-samples/mongo-api/connection');

let {User,addUser,dropUser,updateUser,getUser,getAll:getAllUsers} = require('../node-samples/mongo-api/models/user');
let {Todo} = require('../node-samples/mongo-api/models/todo');

let {ObjectID} = require('mongodb')

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Подключаем dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../node-samples/mongo-api/server.test'); // сделано отдельное приложение, чтобы тестить, когда основное запущено
let expect = chai.expect;
let should = chai.should();
let assert = chai.assert;

chai.use(chaiHttp);

let testUser = {
    name: "Basco da Brama"
}

let anotherUser = {
    name: "Betchoven"
}

let brokenUser = {
    name: "Fo"
}

let _id = ""
let _id2 = ""

// Можно создать объект с готовым _id
let mockObjTodo = {
    completed: false,
    title: "mock Todo",
    id: 1380,
    _id: new ObjectID()
}

// Выполнить перед каждым тестом
// beforeEach(done => {
//     User.remove({name:anotherUser.name}).then( () => done() );
// });

describe('Mongoose CRUD User testing',() => {
    it('Add a user', (done) => {
        chai.request(server)
            .post('/user')
            .send(testUser)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('doc');
                res.body.doc.should.have.property('_id');

                expect(res.body.doc._id).to.be.a('string');

                _id = res.body.doc._id // save id

                should.not.exist(err);

                res.body.doc.name.should.equal(testUser.name)

                done()
            })
    });

    // Другой вариант проверки - непосредственно смотрим в базе
    it('Add another user', (done) => {
        chai.request(server)
            .post('/user')
            .send(anotherUser)
            .end( (err,res) => {
                res.should.have.status(200);

                User.find({name:anotherUser.name}).then(doc => {
                    expect(doc.length).to.be.a('number').equal(1)
                    expect(doc[0].name).to.be.a('string').equal(anotherUser.name)
                    _id2 = doc[0]._id // save id
                    done()
                }).catch(e => {
                    done(e)
                });
            })
    });

    it('Get all users', (done) => {

        chai.request(server)
            .get('/user')
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                assert.isAtLeast(res.body.length,1,'User count must be a least 1')
                done()
            })
    });

    it('Get single user', (done) => {

        chai.request(server)
            .get(`/user/${_id}`)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('doc');
                res.body.doc.should.have.property('_id').equal(_id);
                res.body.doc.should.have.property('name').equal(testUser.name);
                // res.body.doc._id.should.equal(_id)
                // res.body.doc.name.should.equal(testUser.name)
                done()
            })
    });

    it('Update a user', (done) => {

        testUser.name = "Derek"

        chai.request(server)
            .put(`/user/${_id}`)
            .send(testUser)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('doc');
                res.body.doc.should.have.property('_id').equal(_id);
                res.body.doc.should.have.property('name').equal(testUser.name);
                done()
            })
    });

    it('Remove a test user', (done) => {

        chai.request(server)
            .delete(`/user/${_id}`)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').equal('Item successfully deleted!');
                res.body.r.n.should.equal(1);
                res.body.r.should.have.property('ok').equal(1);

                done()
            })
    });

    it('Remove another test user', (done) => {

        chai.request(server)
            .delete(`/user/${_id2}`)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').equal('Item successfully deleted!');
                res.body.r.n.should.equal(1);
                res.body.r.should.have.property('ok').equal(1);

                done()
            })
    });

    it('Try to add user with invalid body data', (done) => {
        chai.request(server)
            .post('/user')
            .send(brokenUser)
            .end( (err,res) => {
                // Зачем-то можно вставить такой бойлерплейт-код
                if(err)
                    return done(err)

                res.should.have.status(206);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                expect(res.body.error).to.be.a('string');

                res.body.should.not.have.property('doc');
                should.not.exist(res.body.doc);

                // Можно вручную проверить наличие юзера в базе
                User.find({name:brokenUser.name}).then( docs => {
                    docs.should.be.a('array')
                    docs.length.should.equal(0)
                }).catch(e => done(e))
                ;

                done();
            })
    });

    /**
     * Кладём в базу тудушку, запрашиваем ее по апи и вручную удаляем
     */
    it('Get Todo test', done => {
        let id = Math.round( Math.random() * 100 );
        let todo = new Todo({
            id: id,
            // _id: new ObjectID(),
            completed: false,
            title: "New todo item " + id,
        });

        // Добавляем новую тудушку вручную
        // и запрашиваем её через АПИ
        todo.save().then( doc => {

                // Если убрать return, будет  Unhandled promise rejection
                return chai.request(server)
                    .get(`/todo/${doc._id}`)
                    .then( res => {

                        expect(res.body[0]).should.be.a('object');
                        res.body[0].should.have.property('id').equal(todo.id);
                        res.body[0].should.have.property('completedAt');
                        should.exist(res.body[0].completedAt);
                        res.body[0].completedAt.should.be.a('number'); // Проверяем, что по умолчанию в completedAt попала метка времени

                        // При желании можно пробросить _id
                        return doc._id
                    })
                     // Введение блока catch() приводит к double callback! - если вместо then() используем end()
                     // Если дальше в цепочке есть catch(), можно текущий кэтч опустить
                     // .catch(e=>{
                     //     throw e;
                     // });

                // Перенес внутрь  chai.request.get.then
                // return doc._id
            })
            .then( _id => {
                // Удаляем тестовую тудушку

                // Можно так:
                // return todo.remove({_id:_id}).then( res => {
                // А можно без указания _id, т.к. todo - это конкретный объект, связанный с базой
                todo.remove().then( res => {
                    done()
                });
            })
            .catch( e => {
                done(e)
            });
        }
    );

    /**
     * Тут присутсвует некоторая магия, т.к. мы отсылаем mockObjTodo с полем _id в виде объекта,
     * а при сохранении мы ожидаем строку. Т.е. где-то при отправке неявно выполняется toString()
     */
    it("Insert mock todo object with _id", done => {

        chai.request(server).post('/todo')
            .send(mockObjTodo)
            .then( res => {

                // console.log( typeof mockObjTodo._id ) // object
                // console.log( typeof mockObjTodo._id.toHexString() ) // string
                // console.log( typeof res.body.doc._id ) // string

                // console.log( typeof mockObjTodo._id ) // object
                // console.log( res.body.doc._id ) // string

                expect(mockObjTodo._id.toHexString()).equal(res.body.doc._id);

                done()
            })
            .catch( e => {
                done(e)
            });
    });

    it("Delete mock todo object by _id", done => {
        chai.request(server).delete(`/todo/${mockObjTodo._id.toHexString()}`)
            .send(mockObjTodo)
            .then( res => {
                res.should.have.status(200);
                res.body.message.should.equal('Item successfully deleted!')
                res.body.r.n.should.equal(1)
                res.body.r.ok.should.equal(1)

                done()
            })
            .catch( e => {
                done(e)
            });
    });

    /**
     * Попытка взять тудушку с валидным, но не существующим _id
     * Тест получился с некоторыми хаками
     */
    it('Should return 404 when todo not found', done => {
        let id = new ObjectID().toHexString();

        chai.request(server).get(`/todo/${id}`)
            .then( res => {
               // сюда не заходит
            }).catch( e => {

                try {
                    e.response.should.have.status(404);
                    e.response.body.error.should.equal(`Document [${id}] not found`);
                    done();
                } catch (err){
                    done(err)
                }

            });
    });

    /**
     * Попытка взять тудушку с невалидным _id
     */
    it('Should return 404 for non-object ids', done => {
        // OK
        // chai.request(server).get('/todo/125+')
        //     .then( res => {
        //         // сюда не заходит. Интересно, а как в supertest это будет
        //     }).catch( e => {
        //
        //         try {
        //             e.response.should.have.status(404);
        //             e.response.body.error.should.equal(`Id is invalid`);
        //
        //             done();
        //         } catch (err){
        //             done(err)
        //         }
        //
        // });

        // Можно использовать секцию end()
        chai.request(server).get('/todo/125+')
            .end( (err,res) => {
                err.status.should.equal(404)

                done()
            });
    });

});
