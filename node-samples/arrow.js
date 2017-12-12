var square = x => x * x;

// console.log( square(4) )

// [!] вызов здесь:  Cannot read property 'sayHi' of undefined
// console.log( user.sayHi() )
const _ = require('lodash')


var user = {
  name: 'Alex',
  sayHi: function () {
    console.log(`Hi, ${this.name}`)
  },
  // сокращенный синтаксис
  sayHiAlt: function () {
    // console.log(arguments)
    console.log(`Hi, ${this.name}`)
  }
}

// user.sayHiAlt()


// -------------------custom object search  ---------------------
let setOfObjects = [
  {
    id: "O-1",
    group: "Fake group",
    media: {
      url: '/',
      caption: 'caption',
      credit: '',
    },
    start_date: {
      month: '1',
      day: '1',
      year: '2018',
      hour: '1',
      minute: '1'
    },
    text: {
      headline: 'head',
      text: ''
    }
  },
  {
    id: "O-2",
    group: "Fake group",
    grp: [
      "Fake group"
    ],
    media: {
      url: '/',
      caption: 'caption',
      credit: '',
    },
    start_date: {
      month: '1',
      day: '1',
      year: '2015',
      hour: '1',
      minute: '1'
    },
    text: {
      headline: 'head',
      text: ''
    }
  }
];


//-------------------------
let etalonObj = {
  id: "etalon",
  group: "Fake group",
  grp: [
    "Fake group"
  ],
  media: {
    url: '/',
    caption: 'caption',
    credit: '',
  },
  start_date: {
    month: '1',
    day: '1',
    year: '2015',
    hour: '1',
    minute: '1'
  },
  text: {
    headline: 'head',
    text: ''
  }
};

// field list we are searching for in other objects
var significantFields = ["grp", "group", "media", "start_date", "text"]



/**
 * Iterates the fields of the needle and looks for them in the obj
 */
function _find(obj, needle) {

  var fields = []
  var field = ""
  var _type
  var fastQuit = false
  var isFound = false

  if (_.isArray(arguments[2]))
    fields = arguments[2]

  _.forIn(needle, function (value, key) {

    if (fields.length)
      if (fields.indexOf(key) < 0)
        return;

    field = key

    _type = typeof value

    if (typeof obj[field] !== _type) {
      fastQuit = true;
      return;
    }

    if (_.isArray(value)) {
      isFound = _find(obj[field], value)
    }

    else if (_.isObject(value)) {
      isFound = _find(obj[field], value)
    }

    else {
      // Other types
      if (obj[field] === needle[field]) {
        // OK - go ahead
        isFound = true
      } else {
        fastQuit = true;
        return;
      }
    }
  });

  if (fastQuit === true)
    isFound = false

  return isFound
}

/**
 * Finds needle in the stackArray
 */
function isObjectInStack(stackArray, needle) {

  var inStack = false;

  try {
    _.forEach(stackArray, function (obj) {
      if (_find(obj, needle, significantFields) === true) {
        // Object found - early exit
        throw "found";
      }
    })
  } catch (e) {
    if( e === "found" )
      inStack = true;
    else
      throw e
  }

  return inStack
}

var res = isObjectInStack(setOfObjects, etalonObj)

console.log("\n\n\n Found: " + res)




















