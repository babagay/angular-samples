/**
 * Тестирование http-запросов
 *
 * Использованы пакеты:
 * mocha
 * supertest - для генерации запросов к тестовому приложению
 * expect - в качестве assertion library для дополнительных проверок полученного в ответ объекта
 *
 * @see https://github.com/visionmedia/supertest
 * @see https://github.com/mjackson/expect
 * @see https://mochajs.org
 *
 * [!] Запускать сервер (команда: node weather-api) не нужно - supertest (или mocha) запускают его самостоятельно, а потом гасят
 * Если сервер был запущен, мока ругается: "Error: listen EADDRINUSE :::8081"
 *
 * [usage]
 * npm run testing-watch
 * Пишем апишки (эндпоинты)
 * Добавляем тесты
 * Наблюдаем результат в реальном времени (триггер для ребилдинга - Ctrl+S либо клик в Терминал)
 *
 * [!] Запуск тестов: Alt-Shift-R
 *
 * [!] Использовать xit() вместо it() - отключить тест
 *
 * Тестировать 404-ю через supertest удобнее, чем через chai
 *
 * [!] В package.json в скрипте testing можно писать EXPORT NODE_ENV=test || SET NODE_ENV=test && mocha utils/test.js
 */

process.env.NODE_ENV = 'test'; // Можно устанавливать окруженеи вручную

const request = require('supertest')
// const app = require('../weather-api').app // OK
const {app} = require('../weather-api')
const {app:todoApp} = require('../node-samples/mongo-api/server') // fixme: почему-то не работает с файлом server.test.js
const expect = require('expect')
const {ObjectID} = require('mongodb')
const {Todo} = require('../node-samples/mongo-api/models/todo.js')

var mockTodo = new Todo({
    _id: new ObjectID(),
    id: 777,
    title: "mock TODO item",
    completed: true,
    completedAt: null,
    _creator: '59b02bf23b6a8927e8b944df'
});

var mockObjId = mockTodo._id

describe('hooks', function() {

    before(function() {
        // runs before all tests in this block
        // [!] Объект не сохраняется при запуске тестов из консоли - по какой-то причине не отрабатывает блок before
        // Сюда заходит только при использовании запуска через сущность, созданную в инструменте Run -> Mocka с юзер-интерфейсом qunit
        // @see http://mochajs.org/#interfaces


        mockTodo.save().then( doc => {

        }).catch( e => {
            console.log("before hooks error triggered: ",e.message)
        } );
    });

    after(function() {
        // runs after all tests in this block
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    // test cases
});

// describe - для группировки и структурирования тестов
describe('Http testing', function() {
    it('should return a test help page with html', (done) => {

        // Метод request() выполняет функцию createServer()
        request(app)
            .get('/help')
            .set('Accept', 'application/html')
            .expect('Content-Type', /html/)
            .expect(200, done);
    });

    it('should return a simple text', (done) => {
        request(app)
            .get('/plain-text-test')
            .set('Accept', 'application/html')
            .expect('Content-Type', /html/)
            .expect(200)
            .expect('Hello world!')
            // Можно заканчивать и так
            .end(done)
        ;
    });


    it('should return a test help page with callback', (done) => {
        request(app)
            .get('/help')
            .set('Accept', 'application/html')
            .expect('Content-Type', /html/)
            .expect(200)
            // Можно указать ожидаемую строку, если она короткая
            // .expect('Hello world')
            .end((err,res) => {
                if (err)
                    return done(err);

                // Ответ сервера
                // console.log(res.text)

                done()
            })
        ;
    });
});

describe('Http json testing', function() {
    describe('Simple json test', () => {
        it('should return a json', (done) => {
            request(app)
                .get('/json-test')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe('Test with validation', () => {
        it('should return a test json with validation', (done) => {
            request(app)
                .get('/json-test')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err,res) => {

                    if( typeof res.body.foo == 'undefined' )
                        return done( new Error("Response should contain a [foo] key") );

                    let validFooValue = 'hello'
                    if( res.body.foo !== validFooValue )
                        return done( new Error(`Foo should be [${validFooValue}] but [${res.body.foo}] gotten`) );

                    if (err)
                        return done(err);

                    done();
                })
            ;
        });
    });

    // Здесь один expect помещен внутри другого
    describe('Error testing', () => {
        // Вариант, когда валидация перенесена из end() в expect()
        // и разделена на 2 этапа
        // [!] Здесь expect - это функция  из библиотки supertest
        it('should return an error', (done) => {
            request(app)
                .get('/plain-text-test-not-found')
                .set('Accept', 'application/html')
                .expect('Content-Type', /json/)
                .expect( 404 )
                .expect( validateErrorResponseStructure )
                .expect( validateErrorResponseContent )
                .expect( res => {
                    expect( res.body.error ).toBe('Not found')
                    expect( res.headers['x-powered-by'] ).toBe('Express')
                })
                .end(done)
            ;
        });
    });
});



// describe('Todo api testing', () => {
    // [!] тесты перенесены в user.crud.test
    // it('should return 404 with message "id is invalid"', done => {
    //
    //    let wrongId = "asd"
    //
    //    request( todoApp )
    //        .get( `/todo/${wrongId}` )
    //        .set('x-auth','')
    //        .expect( 404 )
    //        .expect( res => {
    //             expect( res.body.error ).toBe( 'Id is invalid' )
    //        })
    //        .end( done );
    // });
    //
    // it('should return 404 with "Not found" message', done => {
    //
    //    let wrongId = new ObjectID()
    //
    //    request( todoApp )
    //        .get( `/todo/${wrongId}` )
    //        .expect( 404 )
    //        .expect( res => {
    //             expect( res.body.error ).toBe( `Document [${wrongId}] not found` )
    //        })
    //        .end( done );
    // });

    // it('Should update todo (PATCH: todo)', done => {
    //
    //    let title = "Changed title"
    //
    //    let changedTodo = Object.create(mockTodo)
    //
    //     changedTodo.title = title
    //     changedTodo._id = mockObjId
    //     changedTodo._creator = '59b03ff49b0c0e125002e172'
    //
    //    request( todoApp )
    //        .patch( `/todo/` )
    //        .send(changedTodo)
    //        .expect( 200 )
    //        .expect( res => {
    //            expect( res.body.doc.title ).toBe( title )
    //            expect( res.body.doc.completedAt ).toBeA( 'number' )
    //        })
    //        .end( done );
    // });
    //
    // it('should not update todo with invalid _id', done => {
    //
    //    let title = "Changed title+"
    //
    //    let changedTodo = Object.create({title:'ASD'}) // [?] когда тут стояло mockTodo, отваливался следующий тест
    //
    //     changedTodo._id = '598d72566306ff10b410be59+'
    //
    //     changedTodo.title = title
    //
    //    request( todoApp )
    //        .patch( `/todo/` )
    //        .send(changedTodo)
    //        .expect( 400 )
    //        .expect( res => {
    //
    //        })
    //        .end( done );
    // });

    // Перенесены в user.crud.test
    // it('should delete todo and return 200', done => {
    //
    //    // let id = mockTodo._id.toHexString() // not work
    //    let id = mockTodo._id
    //
    //    request( todoApp )
    //        .del( `/todo/${id}` )
    //        .expect( 200 )
    //        .expect( res => {
    //            expect( res.body.message ).toBe( `Item successfully deleted!` )
    //        })
    //        .end( done );
    // });

    // it('should return 404 if todo not found', done => {
    //
    //    let id = new ObjectID()
    //
    //    request( todoApp )
    //        .del( `/todo/${id}` )
    //        .expect( 404 )
    //        .expect( res => {
    //            expect( res.body.message ).toBe( `Todo item was not deleted!` )
    //        })
    //        .end( done );
    // });
// });

var validateErrorResponseStructure = res => {
    if( !('error' in res.body) )
        throw new Error("The 'error' key is missing")
}

// Здесь expect - это функция из библиотки expect
var validateErrorResponseContent = res => {

    let validErrorMess = 'Not found'

    // Использование внутреннего экспекта вместо конструкции
    // if( res.body.error != 'Not found' )
    //     return done( new Error('Should be the message "Not found" but [' + res.body.error + '] got') )
    // [!] Нужно выполнить подключение:
    // const expect = require('expect')
    // Сигатура: expect(object).toInclude(value, [comparator], [message])
    expect(res.body).toInclude({
        error: validErrorMess
    }, `Should be the message [${validErrorMess}] but [${res.body.error}] got`);
}
