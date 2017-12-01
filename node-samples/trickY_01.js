/**
 * https://habrahabr.ru/company/ruvds/blog/340194/
 * node trickY_01.js
 */

const Rx = require('rxjs/Rx')

// Нерабочий код
// Выдает Index: 4, element: undefined
// Задача: сделатьл код рабочим
const arr = [10, 12, 15, 21];
for (var i = 0; i < arr.length; i++) {
  setTimeout(function () {
    console.log('Index: ' + i + ', element: ' + arr[i]);
  }, 3000);
}


// Мой вариант решения
(function () {
  const arr = [10, 12, 15, 21];


  var storageForI = function (i) {
    this.i = i
  }

  for (var i = 0; i < arr.length; i++) {
    // Здесь мы передаем i внутьрь функции через proxyObject

    var proxyObject = new storageForI(i)

    setTimeout(
      (function () {
        console.log('Index: ' + this.i + ', element: ' + arr[this.i]);
      })
        .bind(proxyObject),

      1000);
  }
})();

// Вариант с хабра, использующий bind()
for (var i = 0; i < arr.length; i++) {
  setTimeout(function (item, i) {
    console.log('bind_Index: ' + i + ', element: ' + item);
  }.bind(this, arr[i], i), 2000);
}

// Решение с хабра 1
for (var i = 0; i < arr.length; i++) {
  // Здесь передаем функции переменную i напрямую.
  // и испульзуем самовызываемую функцию
  // В результате, у каждой функции будет доступ к правильному значению индекса
  // [!] Получается, мы вкидываем i в замыкание и она там, как-бы, сохраняется (запоминается ее текущее значение)

  setTimeout(
    function (i_local) {
      return function () {
        console.log('The index of this number is: ' + i_local);
      }
    }(i),
    3000);
}

// Другой вариант - просто использовать let вместо var:
// for (var i = 0; i < arr.length; i++) { заменить на
// for (let i = 0; i < arr.length; i++) {

// Третий вариант - привлечение дополнительных параметров setTimeout
for (var i = 0; i < arr.length; i++) {
  setTimeout(function (i) {
    console.log('$Index: ' + i + ', element: ' + arr[i]);
  }, 4000, i);
}

// Еще вариант
arr.forEach(function (item, i) {
  setTimeout(function () {
    console.log('_Index: ' + i + ', element: ' + item);
  }, 5000);
});

// Еще модификация
for (var i = 0; i < arr.length; i++) {
  (function(i){
    setTimeout(function() {
      console.log(':Index: ' + i + ', element: ' + arr[i]);
    }, 6000);
  })(i)
}

// Более современный вариант
for (const [i, item] of arr.entries()) {
  setTimeout(console.log, 7000, `*Index: ${i}, element: ${item}`);
}

// "Интересное" решение (используется let)
// Также, цикл с let работает быстрее.
for (let i = 0; i < arr.length; i++) {
  setTimeout(function() {
    console.log('<Index: ' + i + ', element: ' + arr[i]);
  }, 8000);
}

//
arr.forEach((item, i) => setTimeout(_ => console.log('@Index: ' + i + ', element: ' + item), 9000));

// И с потоками
Rx.Observable.from([10, 12, 15, 21]).delay(10000).subscribe(
  t => {
    console.log(`& element: ${t}`)
  }
);


