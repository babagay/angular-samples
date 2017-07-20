/**
 * Тестирование http-запросов
 *
 * Использованы пакеты:
 * mocha(?)
 * supertest
 * expect
 *
 * @see https://github.com/visionmedia/supertest
 * @see https://github.com/mjackson/expect
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
 * @type {any}
 */

const request = require('supertest')
const app = require('../weather-api').app
const expect = require('expect')


// describe - для группировки и структурирования тестов
describe('GET html', function() {
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

describe('GET json', function() {
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
                .end(done)
            ;
        });
    });
});

var validateErrorResponseStructure = res => {
    if( !('error' in res.body) )
        throw new Error("The 'error' key is missing")
}

// Здесь expect - это функция из библиотки expect
var validateErrorResponseContent = res => {

    // Использование внутреннего экспекта вместо конструкции
    // if( res.body.error != 'Not found' )
    //     return done( new Error('Should be the message "Not found" but [' + res.body.error + '] got') )
    // [!] Нужно выполнить подключение:
    // const expect = require('expect')
    // Сигатура: expect(object).toInclude(value, [comparator], [message])
    expect(res.body).toInclude({
        error: 'Not found'
    }, 'Should be the message "Not found" but [' + res.body.error + '] got');
}