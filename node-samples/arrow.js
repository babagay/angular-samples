var square = x => x * x;

// console.log( square(4) )

// [!] вызов здесь:  Cannot read property 'sayHi' of undefined
// console.log( user.sayHi() )

var  user = {
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

 user.sayHiAlt()

