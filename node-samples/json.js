// var  obj = {
//     name: "Alexandro",
//     married: true
// };

// var strobj = JSON.stringify(obj)

// console.log( strobj )

// var str = '{"name":"Alexandro","married":true}';
// console.log( JSON.parse(str).name ) // Alexandro
// console.log( typeof JSON.parse(str) ) // object

const fs = require('fs')
const _ = require('lodash')

// var originalItem = {
//     title: 'Hello',
//     body: 'hello Body'
// };


// fs.writeFileSync('notes.json', JSON.stringify(originalItem) )

//var restoreditem = fs.readFileSync('notes.json')

//console.log( JSON.parse(restoreditem).title ) // Hello

// ----------------------------------------------------
module.exports =  (function(){

    var _notes = []

    var _saveNotes = function () {
        fs.writeFileSync('./notes.json', JSON.stringify(_notes) )
    }

    var _readNotes = function () {
        try {
            _notes = JSON.parse(fs.readFileSync('./notes.json'))
        } catch (e){}
    }

    var _isNoteUnique = function (note) {
        // Если уже есть записка с данным   note.title, note.desc,  то note НЕ уникальна; return false
        var index =_.findIndex(_notes, obj =>
            obj.title == note.title && obj.description == note.description
        )

        return !(index > -1)
    }

    var _isNoteValid = function (note) {
        var valid = true

        if(typeof note.title == "undefined")
            valid = false

        if(typeof note.description == "undefined")
            valid = false

        return valid
    }

    return {
        addNote: noteObj => {

            if( _isNoteValid(noteObj) === false ){
                console.log('note is invalid')
                return null;
            }

            _readNotes()

            if( !_isNoteUnique(noteObj) ){
                console.log('note already exists')
                return null;
            }

            _notes.push( noteObj )
            _saveNotes()

            console.log('note saved')
        },
        removeNote: note => {
            _readNotes()

            try {
                var l1 = _notes.length

                _notes = _.reject(_notes, obj => {
                    return obj.title == note.title && obj.description == note.description
                })

                if(l1 != _notes.length)
                    return true
                    // console.log('Note was rejected')
                else
                    return false
                    // console.log('Note was NOT rejected')

            } catch (e){}

            /**
             * [!] this здесь указывает на текущий объект
             * Поэтому, если писать this._saveNotes(), метод _saveNotes() будет undefined (если он обявлен в лексическом окружении, а не в текущем объекте)
             */
            _saveNotes()
        }
    }
})();















