/**
 * Тесты шпионов
 *
 * [usage]
 * Положить тесты в папку utils
 * Выполнить шоткат: npm run testing-watch
 *
 * @type {any}
 *
 * todo Разобраться, зачем нужны шпионы
 */

const expect = require('expect')

const foo = require('../spies/app')

const rewire = require('rewire')

var app = rewire('../spies/app')
// app.__set__ [?]

var mockObject = {
    name: 'Alex',
    age: 37,
    email: 'user@on.ua',
    pass: 'secret'
}

describe('Spy testing', () => {

    var db = {
        saveUser: expect.createSpy()
    };

    app.__set__('db',db)

    it('Should call the spy correctly', () => {
        var spy = expect.createSpy();

        // Если вызвать шпиона с параметрами:  spy(mockObject.name, mockObject.pass),
        // получим: spy was never called with [ 'Alex', 37 ]
        spy(mockObject.name, mockObject.age);

        expect(spy).toHaveBeenCalledWith(mockObject.name, mockObject.age);
    });

    // todo
    it('Should simulate saving user', () => {
        var spy = expect.createSpy();

        var spyichik = expect.spyOn(foo, 'handleSignup')

        foo.handleSignup(mockObject.email, mockObject.pass)

        spyichik.restore()

    });

    it('Should call saveUser with user obj', () => {

        var email = mockObject.email
        var pass = mockObject.pass

        var wrongPass = 'terces'

        app.handleSignup(email, pass);

        // Чтобы завалить тест, нужно:
        // expect(db.saveUser).toHaveBeenCalledWith({email, wrongPass})
        // Тогда будет ошибка:
        // spy was never called with [ { email: 'user@on.ua', wrongPass: 'terces' } ]
        expect(db.saveUser).toHaveBeenCalledWith({email, pass})
    });
});