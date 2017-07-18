var foo = (a,b) => {
    return a + b
}

/**
 *

// [Ok]
// module.exports.sum  = (a,b) => a + b


    // [!] Не работает
    function () {


            return function sum(a,b){
                a + b
            }

    }

    // [Ok]
    {
        sum: foo
    }

    // [Ok]
    {
        sum: function (a, b) {
            return a + b
        }
    }

    // [Ok]
    (() => {

        var sum = (a,b) => a + b

        return {
            sum: sum
        }

    })();

 */

// Пример асинхронной функции с задержкой
var asyncFunction = (a,b,callback) => {

    setTimeout(()=>{
        callback(a + b)
    },19);
}



/**
 * Вообще, тут шаблон "модуль" не нужен, т.к. переменные как asyncFunction все-равно существуют исключительно в
 * рамках данного модуля и не видны глобально
 *
 * @type {{sum, square, errorGenerator, setName, asyncFunc, asyncFuncSquare}}
 */
module.exports = (() => {

    var _summ = (a,b) => a + b;

    var _square = (a) => a * a;

    var _setName = (user,name) => {
        var names = name.split(' ')
        user.firstName = names[0]
        user.lastName = names[1]
        return user
    };

    var _errorGenerator = () => {
        // throw 'error';
        throw new Error("error")
    };

    var _asyncFuncSquare = (num, func) => {
        setTimeout(() => {
            func( num * num )
        }, 19)
    };

    return {
        sum: _summ,
        square: _square,
        errorGenerator: _errorGenerator,
        setName: _setName,
        asyncFunc: asyncFunction,
        asyncFuncSquare: _asyncFuncSquare,
    }
})();