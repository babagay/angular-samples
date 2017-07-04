const Rx = require('rxjs/Rx')
const request = require('request')

/**
 * Observable, базовый пример
 */
Rx.Observable.from([1,2,3]).subscribe(
    (t) => {
        // console.log(t)
    }
);

/**
 * Вариант http-запроса с использованием библиотеки rx-http-request
 */
const RxHttpRequest = require('rx-http-request').RxHttpRequest

var encodedAddress = encodeURIComponent("Харьков, Украина")

RxHttpRequest.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI`)
             .subscribe(
               data => {
                   if (data.response.statusCode === 200) {
                       //console.log(data.body);
                   }
               },
                 (err) => console.error(err)
             );

/**
 * Observable
 * Example 1
 *
 * [!?] почему в функцию create() тоже передается observer, если мы и так указываем наблюдателя в subscribe()
 */
var source = Rx.Observable.create(
    observer => {

        var i = 20;

        /**
         * Здесь дёргаем любое количество раз любую из 3х функций
         * Имеет смысл дергать много раз только функцию next()
         */
        observer.next(++i); // сработает
        observer.next(++i); // сработает

        setTimeout( () => {
            observer.next(1234)
        }, 400)

        var id = setInterval( () => {

            try {
                throw 'error thrown'
                console.log(++i)
                //observer.next(++i);
            } catch (e){
                // fixme не кидает ошибку
                observer.error(e)
            }

        }, 500)

        // [!] вызов error() равносилен бросанию исключения
        // observer.error("Err") // сработает. При этом complete() уже НЕ будет вызван
        // observer.error("Err 2") // НЕ сработает! (улетает только первая ошибка)

        // [!] Сработает только ОДИН раз
        observer.complete();
        observer.complete();
        observer.complete();

        // Работает как finally
        return function () {
            // Удаление
            console.log('Disposal called')
             clearInterval(id)
        }
    }
)

var sub = source.subscribe(
    data => {
        console.log(data)
    },
    err => {
        console.log('Error caught: ', err)
    },
    () => {
        console.log("DONE")
    }
);

// Error
// setTimeout(function () {
//     sub.dispose()
// }, 300)

/**
 * Example 2 (рабочий) - бесконечный цикл
 * @type {*}
 */
/*
var src = Rx.Observable.create( observer =>
    {
        var i = 1;

        setInterval( () => {

            if( i > 4 )
                observer.error('Limit found')
            else
                observer.next(++i)

        },340)

        console.log('Obs started')
    });

src.forEach(
    x => {
        console.log(x)
    }

)
*/

//     .subscribe(
//     t => {
//         console.log('Sub' + t)
//     },
//     err => {
//         console.log( 'Err' + err )
//     }
// )

/**
 * Example 3 - custom http request wrapping
 * [?] Как обработать ошибку
 */
var srcHttp = Rx.Observable.create( observer =>
{
    // Вариант А - инкремент (рабочий)
    // var i = 1;
    //
    // var id = setInterval( () => {
    //
    //     if( i > 4 ) {
    //         observer.error('Limit found')
    //         // Удалить [интервальный ресурс], чтобы программа остановилась, а не висела
    //         clearInterval(id)
    //     } else
    //         observer.next(++i)
    //
    // },340)

    var counter = 1

    // Вариант с бесконечным циклом запросов
    // Время 4400 должно быть больше, чем длится запрос
    // Если вызвать observer.complete(), запросы будут продолжать отправляться, но поток будет остановлен!
    var id = setInterval( () => {

        request(
            {
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI`,
                json: true
            },
            (error, result, body) => {

                try {
                    if (!error && result.statusCode === 200) {
                        observer.next(result.body)
                    } else {
                        observer.error(error)
                        clearInterval(id)
                    }
                } catch (e){
                    observer.error( e )
                    clearInterval(id)
                }

                // Ограничить поток четырьмя запросами
                if( ++counter > 4 )
                    observer.complete()
            }
        );

    },400);

    console.log('Observer Http started')

    // Функция srcHttpDispose(), которая должна, по идее, дёргаться через dispose()
    return () => {
        // Отработает в самом-самом конце
        console.log("Dispose (srcHttpSubscriber) called")
        clearInterval(id)
    };
});


// используем forEach (рабочий)
// srcHttp.forEach(
//     x => {
//         console.log(x.body)
//     }
// ).catch(
//     // Здесь ловится ошибка, если урл неправильный: maps.googleapiscom
//     // Здесь НЕ ловится исключение, поэтому, я его перехватываю и вызываю  observer.error()
//     err => {
//         console.log('Example 3 error caught. ', err)
//     }
// );

// Используем обычного наблюдателя
var srcHttpSubscriber = srcHttp

    // [!] если использовать reduce(), то сперва мы дождемся завершения потока, потом произведем редукцию
    // и потом перейдем в subscribe()
    // Для того, чтоб это работало, надо использовтаь observer.complete()
    // Все агрегаты здесь: https://github.com/Reactive-Extensions/RxJS/blob/master/doc/libraries/main/rx.aggregates.md
    // .reduce( (acc, x, idx, source) => {
    //
    //     var str = x.results[0].formatted_address
    //
    //     return acc + "[" + str + "] "
    // }, ""
    // )

    // Больше операторов здесь: https://github.com/Reactive-Extensions/RxJS/blob/master/doc/libraries/main/rx.complete.md
    // fixme НЕ работает
    // .select( (x, idx, obs) => {
    //     console.log(x)
    //     console.log(idx)
    //     console.log(obs)
    // })

    // Просто выполняет промежуточное действие и пробрасывает объект потока дальше
    .do(
        data => {
            console.log(data.results[0].formatted_address, '--')
        },
        err => {
            console.log('Error of srcHttpSubscriber is caught: ', err)
        },
        () => {
            // Отработает по завершении потока
            console.log("srcHttpSubscriber DO is DONE")
        }
    )

    .subscribe(
        data => {
            console.log(data)
        },
        err => {
            console.log('Error of srcHttpSubscriber is caught: ', err)
        },
        () => {
            // Отработает по завершении потока
            console.log("srcHttpSubscriber (subscribe) is DONE")
        }
    )
    ;

// var fooHttpDisposable = srcHttp.forEach(
//     x => {
//         console.log(x)
//     }
// );

// Пример использования dispose()
// [!] fixme: По идее, эта функция должна останавливать поток через вызов srcHttpDispose() по прошествии 6ти секунд
// Но выдает ошибку: fooHttpDisposable.dispose is not a function
// https://egghead.io/lessons/rxjs-rxjs-observables-vs-promises
// setTimeout( () => {
//     fooHttpDisposable.dispose()
// }, 6000 );




















