/**
 * Передача аргументов командной строки
 * node node-samples/argv customArg_1 customArg_2
 *
 * node node-samples/argv customArg_3 --key="some string"
 * node node-samples/argv customArg_4 --key "some string"
 */

const _ = require('lodash');

console.log( _.nth(process.argv, 2) )
console.log( process.argv[3] )
console.log( process.argv )


/**
 * А теперь с использованием yargs
 * @type {any}
 */
const yargs = require('yargs')

const argv = yargs.argv




/**
 * node node-samples/argv arg_1 arg_2 --key "some string" --another_key "asd"
 * node node-samples/argv arg_1 arg_2 --key "some string" --another_key="asd"
 */
// console.log( argv )
console.log( argv.key ) // some string
console.log( argv.another_key ) // asd
console.log( argv._ ) // [ 'arg_1', 'arg_2' ]
console.log( _.nth( argv._, 0 ) ) // arg_1


/**
 * Вернуть последний консольный аргумент
 */
var getLastArg =  function () {

    console.log('--------------', argv.key)


    return _.last(argv._);
}

var getFirstArg = function () {
    return _.first(argv._)
}

var getAtrByName = function (argName) {
    return argv[argName]
}

// Аналог функции getFirstArg()
var getCommand = function () {
    return argv._[0]
}



/**
 * Вызов консольной справки
 * [!] Здесь можно добавлять кучу опций, а также обработчики каждой команды, но как это делать не понятно, т.к. даже на сайте yargs на данный момент дока не актуальная
 */
var getHelp = function () {
    yargs
        .options({
            a: {
                alias: "addNote",
                describe: "add a new note object {title, description}",
                // string: true,
                demand:false
            }
        })


        .alias('d', 'dropNote')
        .describe('d', 'remove a new note object {title, description}')

        .usage("$0 operation [addNote|dropNote] --title='' --desc='' ")
        .help('help')
        .alias('help', 'h')
        .argv
}

/**
 * @type {{getLastArg: getLastArg, getAtrByName: getAtrByName}}
 *
 * Аналогично записис
 * {
 *   getLastArg: getLastArg,
 *   getAtrByName: getAtrByName
 * }
 */
module.exports = {
    getFirstArg,
    getLastArg,
    getAtrByName,
    getCommand,
    getHelp
}