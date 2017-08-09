/**
 * Тестирование http-запросов
 * Использован: chai
 * @see http://chaijs.com/plugins/chai-http/
 */
let {mongoose} = require('../node-samples/mongo-api/connection');

let {User,addUser,dropUser,updateUser,getUser,getAll:getAllUsers} = require('../node-samples/mongo-api/models/user');

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
});
