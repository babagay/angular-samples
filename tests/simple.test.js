/**
 * Копия файла utils/utils.test.js, но данный экземпляр запускается через карму
 *
 * [!] запуск http-тестов через карму не прошёл
 */

const expect = require('expect')

const utils = require('../utils/utils')

describe('Simple tests', () => {


    it('Should summ two nums+',
        () => {
            let realVal = utils.sum(3, 17);

            const expectedVal = 20

            expect(realVal).toBe(expectedVal, `Expected [${expectedVal}] but [${realVal}] gotten`)
                .toBeA('number')

            // if( res !== 20 )
            //     throw new Error(`Expected [20] but [${res}] gotten`)
        }
    );

// Тест без использования expect()
    it('Should x * x',
        () => {
            let res = utils.square(3);
            if (res !== 9)
                throw new Error(`Expected [9] but [${res}] gotten`)
        }
    );

    it('toNotBe() testing',
        () => {

            const basicVal = 1
            const testVal = 4

            expect(basicVal).toNotBe(testVal, `basicVal ${basicVal} should not be equal another val ${testVal}, but it is!`)
        }
    );

    it('equal testing',
        () => {

            const basicVal = {name: "Alex"}
            const testVal = {name: 'alex'}

            expect(basicVal).toNotEqual(testVal, `basicVal ${JSON.stringify(basicVal)} is equal to ${JSON.stringify(testVal)} but should not`)
        }
    );

    it('array include testing',
        () => {

            const basicVal = [2, 3, 4, 5]
            const testVal = 4
            const testVal2 = 43

            const basicObject = {
                name: "Alex",
                age: 45
            }

            expect(basicVal).toInclude(testVal, `basicVal ${JSON.stringify(basicVal)} does not contain a ${JSON.stringify(testVal)} but should do`)
            expect(basicVal).toExclude(testVal2, `basicVal ${JSON.stringify(basicVal)} does contain a ${JSON.stringify(testVal)} but should not`)
            expect(basicObject).toInclude({name: "Alex"}, "basicObject should include field NAME valued to ALEX")
        }
    );

    it('First and last names testing. Assert it includes firstName and lastName with proper vals',
        () => {

            let user = {location: 'Odesza'}
            let res = utils.setName(user, "Vasilij Pupkin")

            expect(res)
                .toInclude({firstName: "Vasilij"}, "First name error")
                .toInclude({lastName: "Pupkin"}, "Last name error");

            expect(user).toEqual(res)
        }
    );

    it('to be a particular type testing',
        () => {
            expect(new String("")).toBeA(String, "Given object must be String")
        }
    );

// Не работает
// it('Error testing',
//     () => {
//        expect( utils.errorGenerator() ).toThrowError(Error)
//     }
// );

// Пример теста с хедержкой - юзаем done()
// Mocha будет ждать, пока текущий тест не выдаст результат. До того момента она дальше не пойдет
    it('Should add 2 nums asyncronously',
        (done) => {
            utils.asyncFunc(2, 4, (sum) => {
                expect(sum).toBe(6).toBeA('number')
                done();
            });
        }
    );

    /**
     * Передача параметра done говорит моке о том, что она имеет дело с асинхронным запросом
     */
    it('Should square a num asyncronously',
        (done) => {
            let expected = 400;

            utils.asyncFuncSquare(20, (sum) => {
                expect(sum).toBe(expected, `Expected [${expected}] but calculated [${sum}]`).toBeA('number')
                done();
            });
        }
    );


});

































