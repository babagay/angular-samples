// TODO чему равен typeof null
console.log( typeof null ); // object

// TODO будет bar. Но почему, ведь, омя bar будет доступно, а значение, я думал, нет
(function foo() {
  'use strict';
  console.log( bar() );
  function bar() { return 'bar'} ;
})()


