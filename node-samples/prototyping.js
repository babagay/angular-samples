/**
 * What does the fox say?
 */

function Fox(age) {
  this.age = age || 100;
}

Fox.prototype.say = function (num) {
  console.log(this.age || 20 + Math.floor(Math.PI) * num);
}

var f = new Fox(10);

f.say.call({}, 5); // метод say() вызват ьв контектсте пустого объекта с аргументом 5

// 35

