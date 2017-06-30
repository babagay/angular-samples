console.log('Exports demo')

const notes = []

module.exports.age = 37
module.exports.notes = notes

module.exports.addNote = (note) => {
    notes.push(note)
}

// console.log(module)



/**
 * Шаблон "модуль" использует
 * Замыкание - функция (или объект) вкупе с её (его) лексическим окружением
 * Или некая интерфейсная функция, которая дает доступ к своему окружению
 *
 * @type {{addNote, getNotes}}
 */
const combiner = (function () {
    var  notes = []

    return {
        addNote: function (note) {
            notes.push(note)
        },
        getNotes: function () {
            return notes
        }
    }

})();

module.exports.combiner = combiner