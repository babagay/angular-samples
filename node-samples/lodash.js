const _ = require('lodash');

console.log( 'lodash test ', _.isArray( {} ) );
console.log( 'lodash test ', _.isString( 'sdc' ) );

/**
 * Тестирование lodash
 */
console.log( _.uniq([1,2,3,3,4,5,6,7,8,9,1,1,2]) )

// Array test
let foo = [
  {
    appointmentId: {
      event: "1 event",
      mess: "1 mess",
      value: "1 value"
    }
  },
  {
    remoteAppointment: {
      event: "row 2 event",
      mess: "row 2 mess",
      value: "row 2 value"
    }
  },
  {
    personId: {
      event: "row 3 event",
      mess: "row 3 mess",
      value: "row 3 value"
    }
  },
];

for( let i in foo ){
  console.dir( foo[i] )
}
