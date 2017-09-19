/**
 * Тестирование http-запросов (в основном , эндпоинтов, юзающих mongoose)
 * Использован: chai в качестве assertion-либы
 * expect и assert - тоже изнутри chai
 * @see http://chaijs.com/plugins/chai-http/
 *
 * [?] если в одном тесте юзер создается,
 * а в другом, этот юзер выгребается - насколько это грамотно?
 * Получается, что последовательность тестов имеет значение!
 * Видимо, юзеров для тестов надо создавать вручную.
 *
 * [!] Запускать тесты выборочно (по одному) можно в InetlliJ
 */
let {mongoose} = require('../node-samples/mongo-api/connection');
let _ = require('lodash')

let {User,addUser,dropUser,updateUser,getUser,getAll:getAllUsers} = require('../node-samples/mongo-api/models/user');
let {Todo} = require('../node-samples/mongo-api/models/todo');

let {ObjectID} = require('mongodb')

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Подключаем dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');

// сделано отдельное приложение, чтобы тестить, когда основное запущено
// Однако, можно в этом файле выставлять process.env.NODE_ENV и, тогда, в файле server.js ее проверять, и менять порт
let server = require('../node-samples/mongo-api/server.test');

let expect = chai.expect;
let should = chai.should();
let assert = chai.assert;

chai.use(chaiHttp);

let email = "user@asd.com"

let testUser = {
    name: "Basco da Brama",
    email: "basco@da.brama"
}

let anotherUser = {
    name: "Betchoven",
    email: "Betchoven@in.Venice",
    password: "asd123"
}

let shortEmailUser = {
    name: "Saljeri",
    email: "s@co"
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

let userMeTest_token;
let anotherUser_token;
let userMeTest_id;

// Выполнить перед каждым тестом
// beforeEach(done => {
//     User.remove({name:anotherUser.name}).then( () => done() );
// });

describe('Mongoose CRUD User testing',() => {
    it('Create a user', (done) => {
        chai.request(server)
            .post('/user')
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200);
                should.exist(res.headers['x-auth']);

                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('doc');
                res.body.doc.should.have.property('_id'); // аналог toExist()
                res.body.doc.should.have.property('tokens');
                res.body.doc.tokens.should.have.key(0);
                res.body.doc.tokens[0].should.have.property('token');

                userMeTest_token = res.body.doc.tokens[0].token;
                userMeTest_id = res.body.doc._id;

                expect(res.body.doc._id).to.be.a('string');
                expect(res.body.doc.email).eq(testUser.email);

                _id = res.body.doc._id // save id

                should.not.exist(err);

                res.body.doc.name.should.equal(testUser.name)

                done()
            })
    });

    // Другой вариант проверки - непосредственно смотрим в базе
    // [!] Вообще, лучше, вероятно, класть юзера руками, а потом делать GET-запрос тестовый
    //     и наоборот, добавлять через тестовый запрос, а потом проверять прямым доступом к базе.
    //     Иначе, если и класть , и проверять через АПИ, то тесты будут зависеть один от другого, что, скорее всего, не очень хорошо
    //     Так, например, если отвалился тест, создающий юзера (и юзер не был создан), то за ним отвалится тест, который проверяет его наличие
    it('Should create a user: ' + anotherUser.name + '<' + anotherUser.email + '>', (done) => {

        let user = _.clone(anotherUser)

        // Добавляем знак !, чтобы указать системе на факт передачи plain-text пароля, чтоб она его захешировала
        user.password += "!"

        chai.request(server)
            .post('/user')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);

                // OK
                User.find({name: anotherUser.name}).then(doc => {
                    expect(doc.length).to.be.a('number').equal(1) // User д.б. один
                    expect(doc[0].name).to.be.a('string').equal(anotherUser.name)
                    _id2 = doc[0]._id // save id to remove the user below
                    done()
                }).catch(e => {
                    done(e)
                });

                // По идее, можно так, но так отваливается тест, удаляющий этого юзера
                // User.findOne({"email":anotherUser.email}).then( doc => {
                //   should.exist( doc.name )
                //   doc.name.should.eq( anotherUser.name )
                //   done()
                // });
            })
    });

    // todo
    // Уникальность имейла не работает
    xit('Should not create user if email is already used', (done) => {
        chai.request(server)
            .post('/user')
            .send(anotherUser)
            .end((err, res) => {
                res.should.have.status(404);

            })
    });

    it('Should not create user if there are validation errors', (done) => {
        chai.request(server)
            .post('/user')
            .send(shortEmailUser)
            .end((err, res) => {
                res.should.have.status(206);
                done()
            })
    });

    it('Should not create user without name', (done) => {
        chai.request(server)
            .post('/user')
            .send({email})
            .end((err, res) => {
                res.should.have.status(206);
                done()
            })
    });


    // Проверить статус и наличие токена в заголовке ответа
    it('Should login a user and verify auth token', (done) => {

        let user = _.pick(anotherUser, ['email', 'password'])

        chai.request(server)
            .post('/user/login')
            .send(user)
            .end((err, res) => {
                should.exist(res.headers['x-auth']);
                // res.header.should.have.key('x-auth') // не работает

                res.headers['x-auth'].should.be.a('string')
                res.should.have.status(202);

                anotherUser_token = res.headers['x-auth']

                // Проверяем явно, в базе
                User.findOne({email: anotherUser.email}).then(doc => {
                    doc.should.have.property('tokens')

                    doc.tokens.should.be.a('array')         // doc.tokens.should.greater.than(0) можно проверить
                    doc.tokens.should.have.property(0)
                    doc.tokens[0].should.be.a('object');
                    doc.tokens[0].should.have.property('access')
                    doc.tokens[0].should.have.property('token')

                    doc.tokens[0].token.should.eq(res.headers['x-auth']) // Сравниваем полученный от сервера токен с тем, что лежит в базе
                    expect(doc.tokens[0].token).to.be.a('string').equal(res.headers['x-auth']) // аналог

                    doc.password.should.not.eq(anotherUser.password) // Проверяем, что пароль захеширован

                    done()
                }).catch(e => {
                    // [!] Если блока catch не будет, при возникновении исключения тест зафейлится с ошибкой Timeout of 2000ms exceeded
                    done(e)
                });
            })
    });

    it('Should get 403 and no token (POST user/login) after using wrong email ', (done) => {

        let user = _.pick(anotherUser, ['email', 'password'])
        user.email += "foo"

        chai.request(server)
            .post('/user/login')
            .send(user)
            .end((err, res) => {
                should.not.exist(res.headers['x-auth']);
                res.should.have.status(403);
                done()
            })
    });


    it('Should get 403 (POST user/login) without password ', (done) => {

        let user = _.pick(anotherUser, ['email'])

        chai.request(server)
            .post('/user/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(403);
                done()
            })
    });

    // сохраненный после теста логина x-auth токен использовн его в тесте GET user/me. Хотя, это опять связанность тестов.
    it('Should get userinfo (GET user/me) by auth token given after login test', (done) => {

        chai.request(server)
            .get('/user/me')
            .set('x-auth', anotherUser_token)
            .end((err, res) => {
                res.should.have.status(200);

                res.body.should.have.property('User')
                res.body.User.should.have.property('email')
                res.body.User.email.should.eq(anotherUser.email)

                done()
            })
    });


    // Проверяем сброс токена, если при логине был введен не верный пароль
    // Опять-таки, проявляется связанность тестов. Данный тест должен идти после 'Should get userinfo (GET user/me) by auth token given after login test'
    it('Should get 403 and reset old token (POST user/login) after using wrong password ', (done) => {

        let user = _.pick(anotherUser, ['email', 'password'])
        user.password += "foo"

        chai.request(server)
            .post('/user/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(403);

                User.findOne({email: user.email}).then(doc => {
                    doc.tokens.length.should.eq(0); // Проверяем, что токен обнулился

                    done()
                }).catch(e =>
                    done()
                );
            })
    });

    // сейчас решил объект юзера не возвращать, т.к. юзается метод монгуса, который апдейтид, но не отдает новый объект
    // Так как после предыдущих тестов токен обнулился из-за неудачного  логина, надо снова залогиниться
    // [!] Fixme: тест отваливается по непонятной схеме
    it('Should remove auth token on logout of user ' + anotherUser.name, (done) => {

        let user = _.pick(anotherUser, ['email', 'password'])
        let userToLogout = _.pick(anotherUser, ['email'])

        // Сначала логиним юзера
        chai.request(server)
            .post('/user/login')
            .send( user )
            .end((err, res) => {

                if (err)
                    return done(err);

                // Потом разлогиниваем
                chai.request(server)
                    .delete('/user/me')
                    .set('x-auth', anotherUser_token)
                    .send(user)
                    .end((err, res) => {

                        if (err)
                            return done(err);

                        res.should.have.status(200);
                        res.body.should.have.property('message');
                        res.body.message.should.eq('Ok');

                        // Проверяем в базе
                        User.findOne({email: userToLogout.email})
                            .then(doc => {
                                doc.should.have.property('tokens');
                                doc.should.have.property('_id');
                                expect(doc.tokens).to.be.a('array');
                                expect(doc.tokens.length).equal(0); // массив tokens пустой

                                // expect(doc._id).equal( _id2  ); // не работает

                                doc.tokens.length.should.eq(0);
                                done();
                            })
                            .catch(e => {
                                done(e)
                            });
                    });
            });
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

    // [!] Если мы сравнимаем два объекта, нужно использовать equal() вместо toBe()
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

    it('Get user/me', (done) => {

        let token = userMeTest_token

        chai.request(server)
            .get(`/user/me`)
            .set('x-auth',token)
            .end( (err,res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('User');
                // res.body.should.have.property('doc');
                // res.body.doc.should.have.property('_id').equal(_id);
                // res.body.doc.should.have.property('name').equal(testUser.name);
                // res.body.doc._id.should.equal(_id)
                res.body.User._id.should.equal(userMeTest_id)
                done()
            })
    });

    it('Should return 401 from GET user/me', (done) => {

        let token = userMeTest_token + "invalid token"

        chai.request(server)
            .get(`/user/me`)
            .set('x-auth',token)
            .end( (err,res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.error.should.equal('Token is invalid')
                done()
            })
    });

    it('Should return 401 (GET user/me) if token is not set', (done) => {

        let token = userMeTest_token + "invalid token"

        chai.request(server)
            .get(`/user/me`)
            .end( (err,res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.error.should.equal("A valid token must be set in x-auth header!")
                done()
            })
    });

    it('Should return 404 (GET user/me) if not authenticated', (done) => {

        // Так не катит - токен будет невалидный!
        // let token = userMeTest_token.substring(0,-1) + "z" // Token is valid but not authorized

        // Лучше взять настоящий токен
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWE5OGRiNDc5Y2RkODJkNWNhMzM3MTUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTA0Mjg0MDg0fQ.VQMGsm0-_Wnn3nwE6vyXQuPd3yvLpOatDCyr4uoP7b8"

        chai.request(server)
            .get(`/user/me`)
            .set('x-auth',token)
            .end( (err,res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.error.should.equal('The given token is unauthorized (no such user)')
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

    // Не должен быть добавлен юзер без имейла
    it('Should return 206 (POST user) if user is invalid', (done) => {
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
