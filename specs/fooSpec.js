/**
 * Тестрование через jasmine-node
 * или через jasmine
 *
 * Под мокой запускается, если подключить экспект:
 * let expect = require('expect')
 * или жасмин
 * let {jasmine,jasmineUnderTest} = require('jasmine-node')
 *
 * npm run jasmine-node
 * npm run testing-jasmine
 *
 * Выглядит не очень наглядно (нету подсветки). Однако, если запускать из консоли, подсветка появляется (у jasmine-node более наглядно).
 *
 * Прогоняет все файлы по шаблону specs/*Spec.js
 *
 * https://github.com/jasmine/jasmine
 */

const {multiply} = require('../utils/utils')

describe('Simple tests', () => {
    it('Primiteve test', () => {
        expect(1).toBe(1,"Test that 1 = 1")
    });

    it('Multiply Func test', () => {
        expect(multiply(2,4)).toEqual(8)
    });
})