
const subNotes = require('./sub-notes')

const argv = require('./argv')

const json = require('./json')

// console.log(`Yor age is ${subNotes.age}`)


/**
 * При обычном присваивании переменная передается по ссылке
 * Демонстрация внизу:
 */
var _notes = subNotes.notes

console.log('_notes: ',_notes)

subNotes.addNote({
    id: 1,
    title: 'Note 1',
    flag: false
})

console.log('_notes after addNote: ',_notes)

// _notes = null

// console.log( 'subNotes.notes after addNote local _notes = null: ', subNotes.notes) // [ { id: 1, title: 'Note 1', flag: false } ]

subNotes.notes = null

console.log('subNotes.notes: ', subNotes.notes) // null
console.log('_notes: ', _notes) // [ { id: 1, title: 'Note 1', flag: false } ]


/**
 * Но при использовании паттерна "модуль" все инкапсулировано в combiner:
 */
// К массиву notes доступа нет
// console.log(subNotes.combiner.notes) // undefined

console.log(subNotes.combiner.getNotes())

console.log(subNotes.combiner.addNote({
    id: 1,
    title: 'Note 1',
    flag: false
}))

var __Notes = subNotes.combiner.getNotes()

console.log(__Notes) // [ { id: 1, title: 'Note 1', flag: false } ]

subNotes.combiner.addNote({
    id: 2,
    title: 'Note 2',
    flag: false
})

console.log(__Notes) // [ { id: 1, title: 'Note 1', flag: false },{ id: 2, title: 'Note 2', flag: false } ]

__Notes = null

console.log( subNotes.combiner.getNotes() ) //  [ { id: 1, title: 'Note 1', flag: false },{ id: 2, title: 'Note 2', flag: false } ]
console.log( __Notes ) // null


/**
 * Вывод последнего аргумента, переданного в консоли
 * node node-samples/notes arg_1 arg_2 --key "some string" --another_key="asd"
 * // arg_2
 */
// console.log( argv.getLastArg() )

/**
 * Вывод аргумента по имени
 * node node-samples/notes arg_1 arg_2 --key "some string" --another_key="asd"
 * // some string
 */
// console.log( argv.getAtrByName('title') )

// Построить объект note из аргументов консоли
var getNote = function () {
    var note = {}
    try {
         note.title = argv.getAtrByName('title')
         note.description = argv.getAtrByName('desc')
    } catch (err){
    }

    return note
}

/**
 * Код управления заметками
 * Заметки создаются из командной строки
 * node node-samples/notes addNote --title=TITLE --desc="new description"
 * node node-samples/notes dropNote --title=TITLE --desc="new description"
 *
 * node node-samples/notes -h
 */

switch( argv.getFirstArg() ){
    case 'addNote':
        json.addNote( getNote() )
        break;

    case 'dropNote':
        json.removeNote( getNote() )
        break;
}


argv.getHelp()















