/**
 * Тестрование через jasmine-node
 * npl run jasmine-node
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