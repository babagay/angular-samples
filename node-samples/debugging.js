/**
 * Запуск в режиме дебаггера
 * node inspect node-samples/debugging
 * n - next line
 * c - continue
 * repl - переход в консоль repl
 * В этом режиме можно вбить имя переменной и будет выведено её содержимое. Напр, testObj, testObj.id
 * Также можно манипулировать переменными - менять их значения
 *
 * @type {{id: number, title: string, flag: boolean}}
 *
 * Выход: ^-C 2 раза
 */

var testObj = {
    id: 1,
    title: 'Note 1',
    flag: false
}

testObj.id = 23

//console.log(testObj)

testObj.id = 123

// [?] что дает это слово
// Мы нажимаем С - прыгаем на строку 29, затем жмем С еще раз и прыгаем в конец программы или на следующий debugger
debugger;

testObj .id = 62

//throw new Error("Err")

debugger;

console.log(testObj)//

/**
 * Отладка с хромом
 * node --inspect-brk node-samples/debugging
 * D:\projects\angular-starter\node_modules\.bin\nodemon  --inspect-brk D:\projects\angular-starter\node-samples/debugging.js
 */
