/**
 * Тест CRUD-операций с базой
 * Если коллекции нет, она будет создана
 *
 * @see https://github.com/mongodb/node-mongodb-native
 * @see https://docs.mongodb.com/manual/reference/method/db.collection.deleteMany/#db.collection.deleteMany
 */

// var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');



// const request = require('supertest')
const expect = require('expect')


const collectionName = 'todo';

// Connection URL
var url = `mongodb://localhost:27017/${collectionName}`;

/**
 * Деструктурирующее присваивание
 * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
 * @type {string}
 */
var ads = "A"
var zxc = "B"
var qwe = "C"
var lkj = "D"
var foo = [qwe,zxc]
var [A,B] = foo;

// обмен значениями
[A,B] = [B,A];

/**
 *  Объекты, пример 1
 */
({a, b, c, d} = {a:1, b:2, c:3, d:4});

/**
 *  Объекты, пример 2
 *
 * @type {{name: string, age: number, description: string}}
 */
var obj = {name:"alex", age:23, description:"Human"};

// Превращаем поля объекта в переменные
var {age, name} = obj;

// Создаём новые переменные
var {age: newAge, name: name2} = obj;

// console.log(age,name); // 23 'alex'
// console.log(newAge,name2); // 23 'alex'

/**
 * Аналог
 * var MongoClient = require('mongodb').MongoClient;
 * Берём объект mongodb и вытягиваем из него поле MongoClient,
 * после чего вкидываем его значение в переменную MongoClient.
 */
var { MongoClient, ObjectID } = require('mongodb');

var id = new ObjectID(); // id: 596f8bf9887a990eb86bb057



describe('MongoDB tests',() => {

    it('Connection test', (done) => {
        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {

            assert.equal(null, err);
            // console.log("Connected correctly to server");

            expect(err).toBe(null,`Expected than error is null but [${JSON.stringify(err)}] given`)

            db.close();

            done();
        });
    });

    var insertDocuments = (db, callback) => {
        // Get the documents collection
        var collection = db.collection(collectionName);

        // Вставить один документ
        // collection.insertOne({id: 1001, completed: true, title: "test item 1"})

        // Insert some documents
        collection.insertMany([
            {id: 1001, completed: true, title: "test item 1"},
            {id: 1002, completed: true, title: "test item 2"},
            {id: 1003, completed: true, title: "test item 3"},
            {id: 1006, completed: true, title: "test item 6"},
            {id: 1007, completed: true, title: "test item 7"}
        ], (err, result) => {

            // [A]
            // проверки дублируются в [Б]
            // [!] Результат приходит в массиве result.ops
            // console.log( result.ops[0]._id ), где _id - специальный объект-идентификатор
            // console.log( result.ops[0]._id.getTimestamp() )
            assert.equal(err, null);
            assert.equal(5, result.result.n);
            assert.equal(5, result.ops.length);

            // console.log("Inserted 3 documents into the document collection");
            callback(err,result);
        });
    }


    it('Insertion test', (done) => {

        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            // console.log("Connected correctly to server");

            insertDocuments(db, (err,res) => {

                // [Б]
                // проверки дублируются в [А]
                // Нормально работает в обоих местах проверка
                expect(err).toBe(null);
                expect(res.result.n).toBe(5).toBeA('number');
                expect(res.ops.length).toBe(5).toBeA('number');

                db.close();
                done();
            });
        });

    });

    var someId = null;

    it('Fetch documents',(  done  ) => {
        MongoClient.connect(url,(error,db) => {
            // [A]
            // db.collection('todo').find().toArray((err,items) => {  console.log(items);  });

            // [B] аналог А
            db.collection(collectionName).find({}).toArray().then( documents => {
                expect(documents.length).toBeGreaterThan(2); // Выше мы добавляем 3 элемента

                // Сохраняем _id одного из вновь добавленных объектов
                documents.filter(doc => doc.id == 1001 ).forEach(i => {
                    someId = i._id;
                });

            }).catch( err => {
                console.log(err, 'ERR')
            })
            // [!] Можно передать сюда done и выполнить done()
            // Иначе, код будет выполняться асинхронно и следующий тест начнётся раньше, чем закончится фильтрация массива documents!
            .then(() => {
                done()
            })
            ;

            // [?] не нужно
            // db.close();
        });
    });

    // var updateDocument = (db, callback) => {
    //
    // };

    /**
     * @see https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/
     *
     * [!] Пока не добавил done() внутрь then, данный тест вообще не отрабатывал
     *
     * [?] findOneAndUpdate() vs findOneAndReplace()
     * По идее, один из методов допускает не передавать весь новый объект {id: 1001, completed: false, title: "test item 1"},
     * а только те поля, что надо поменять. Однако, оба метода ЗАТИРАЛИ старый объект и подсовывали новый.
     * Соответсвенно, если передать только нужное поле {completed: false}, то такоей урезанный объект и оставался в базе.
     *
     * Только метод updateOne() позволил передать ему только одно, к примеру, поле и сохранил структуру объекта,
     * В то время, как методы findOneAndUpdate() vs findOneAndReplace() работали аналогично - убивали старый объект и клали на его место новый.
     * Соответсвенно, если опустить некоторые поля, их в новом объекте просто не будет
     */
    it("Update document",( done ) => {

        MongoClient.connect(url,(error,db) => {

            // [!] Если у метода findOneAndUpdate() опущен второй аргумент (колбэк), он возвращает промис
            // db.collection(collectionName)
            //     .findOneAndUpdate(
            //         {_id: {$eq: new ObjectID(someId)} },
            //         {id: 1001, completed: false, title: "test item 1"},
            //         {returnNewDocument: true, upsert: true}
            //     )
            //     .then( doc => {
            //         console.log(doc);
            //         done();
            //     })
            // ;

            // OK
            // db.collection(collectionName).updateOne(
            //     { _id: {$eq: new ObjectID(someId)} },
            //     { $set:
            //         {
            //             completed: false,
            //             // Можно добавлять новые поля
            //             // details: { model: "14Q3", make: "xyz" },
            //             // tags: [ "coats", "outerwear", "clothing" ]
            //         }
            //     },
            //     // Через колбэк сработало нормально
            //     (err,res) => {
            //         expect(err).toBe(null);
            //         expect(res.result.ok).toBe(1);
            //         expect(res.result.nModified).toBe(1);
            //         done();
            //     }
            // )

                // Через then не удалось толково сделать тест.
                // Если тест не пройден, выдаёт:
                // Update document:  Unhandled promise rejection (rejection id: 1): Error: Expected 1 to be 2
                // MongoDB tests Update document: Timeout of 2000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
                // Хотя, тест 'Fetch documents' работает нормально, даже в случае провала.
                /*
                .then( doc => {
                    // console.log(doc.result, "DOC res"); // result: { n: 1, nModified: 1, ok: 1 },
                    // [!] Поля вроде nModified меняются о тметода к методу
                    expect(doc.result.ok).toBe(2);
                    expect(doc.result.nModified).toBe(1);
                    done();
                 })
                // Можно воткнуть done() в catch(), но тогда mocha не обрабатывает провал теста и считает, что он пройден.
                // Потмоу, чт оей нужен эксепшн. Но, если он произойдет, будет сообщенеи о необработанном промисе.
                .catch( err => {
                    // console.log(err, 'ERR')
                    done()
                    // Если раскоментить любую строку, будет UnhandledPromiseRejectionWarning
                    // err.promise.resolve('asd')
                    // throw new Error(err)
                });
                */

            // [!] вот решение, как тестить через then. Секрет в использовании done()
            db.collection(collectionName).findOneAndUpdate(
                { _id: {$eq: new ObjectID(someId)} },
                { $set:
                    {
                        completed: false,
                        // Можно добавлять новые поля
                        // details: { model: "14Q3", make: "xyz" },
                        // tags: [ "coats", "outerwear", "clothing" ]
                    }
                },
                {
                    returnOriginal: false // Если false, то в [Get updated obj] будет новый объект
                }
            ).then( res => {
                // console.log(res) // [Get updated obj]
                // Здесь - для findOneAndUpdate() - возвращается сокращенный варианта объекта res, не портянка
                expect(res.ok).toBe(1)
                done()
            }).catch( err => {
                done(err)
            });


        });
    });

    // Увеличение id на единицу
    it('Update with increment',( done ) => {

        MongoClient.connect(url,(error,db) => {
            db.collection(collectionName).findOneAndUpdate(
                { id: 1007 },
                {
                    $set: { title: "New Title" },
                    $inc: { id: 1 }
                },
                {
                    returnOriginal: false
                }
            ).then( res => {
                expect(res.value.id).toBe(1008)
                expect(res.ok).toBe(1)
                done()
            }).catch( err => {
                done(err)
            });
        });
    });


    // [!] Удаление в RoboMongo:
    //   по одной записис: db.todo.deleteOne({id: 1003})
    //   несколько: db.todo.deleteMany({"id": {$gt: 1} })
    // После чего вернется объект с полем deleteCount
    // Ещё есть deleteOne() и findOneAndDelete()
    // Также можно присоединять к ним then()
    var deleteDocument = (db, callback) => {

        var collection = db.collection(collectionName);

        // Удалить по простому критерию: deleteOne({ id: 1003 }

        // Удалить несколько записей
        collection.deleteMany({ $or: [
            {id: 1001},
            {id: 1002},
            {id: 1003}
        ]}, function(err, result) {
            assert.equal(err, null);
            assert.equal(3, result.result.n);
            callback(err,result);
        });
    };

    it('Removing test', (done) => {
        MongoClient.connect(url, (err, db) => {
            assert.equal(null, err);

            deleteDocument(db, (err,res) => {
                expect(res.deletedCount).toBe(3)

                db.close();
                done();
            });

        });
    });

    // Вставка и удаление через колбэк
    it('Create and delete test', (done) => {
        MongoClient.connect(url, (err, db) => {
             db.collection(collectionName).insertOne(
                 {id: 10010, completed: true, title: "test item 4"},
                 (err,res) => {

                     // console.log(res.ops[0]._id)
                     // console.log(res.insertedId)

                     expect(err).toBe(null, 'There is en error');
                     expect(res.result.ok).toBe(1, 'Result is not ok');
                     expect(res.result.n).toBe(1, 'Inserted docs count is not 1');
                     expect(res.insertedCount).toBe(1, 'Inserted docs count must be 1');

                     // Есть метод deleteOne()
                     db.collection(collectionName).findOneAndDelete(
                         {id: 10010},
                         (err,res) => {
                             // console.log(res);
                             expect(res.ok).toBe(1)

                             db.close();
                             done(); //
                         }
                     );

                 }
             );
        });
    });

    var insertAndDelete = ( done ) => {
        return new Promise((resolve,reject) => {

          return  MongoClient.connect(url, (err, db) => {

                db.collection(collectionName)
                    .insertOne( {id: 10020, completed: true, title: "test item 5"} )
                    .then( doc => {

                        expect(doc.insertedCount).toBe(1); // Для генерации ошибки нужно изменить аргумент в toBe()

                        return doc.insertedId;
                    })
                    .then( _id => {
                        // [!] Если добавить return, вложенный catch не потребуется
                        return db.collection(collectionName)
                            .findOneAndDelete({_id: new ObjectID(_id)})
                            .then( res => {

                              expect(res.ok).toBe(1)

                              done(); // Если пробрасывать done в функцию, можно вызвать его здесь

                            })
                            // .catch(err => {
                            //     var mess = err.message || "Error"
                            //     //done()
                            //     rej({done, mess})
                            // })
                        ;
                    })
                    .catch(err => {
                        var mess = err.message || "Error in insertAndDelete()"

                        resolve({error:true,mess:mess});
                        //done( new Error(mess) ) // [DONE with error in func] можно вызывать done() здесь
                });
                ;
            });
        });
    }

    // Попытка совмещения вставки и удаления с использованием промисов
    // Свести обработку исключений к обычному способу (посредством async/await) не удалось
    // Пришлось пошаманить с вызовом done()
    it('Create and delete in promise style', (done) => {

        try {

            var proxy =   (func) => {
                 return insertAndDelete(done).then((r) => func(r) )
            };

            async function proxy2() {
                await proxy((t) => {
                    if(t.error === true) {
                        done( new Error(t.mess) ) // [DONE + err]
                    }
                    // done() // не прошло
                }).catch(e => {
                    // console.log("catch", e)
                    // [P]
                    // throw new Error("Error from promise");
                });
            }

            proxy2()

            // Все-таки, для корректной работы пришлось разделить вызовы done():
            // когда все ок, оно вызывается в insertAndDelete(),
            // в случае исключения - здесь.
            // done()

            // [!] Если бросать исключенеи отсюда, все ок. Если же из промиса [P], возникает варнинг о необработанном исключении
            // А для того, чтобы мока увидела, что тест завален, надо кинуть исключение
            // Вылечено тем, что в строке [DONE + err] вызывается непустая done().
            // Её можно вызывать и здесь: [DONE with error in func], но проброс done в функцию видится не фэншуйным.

            // Тест обычного исключения (не из промиса)
            // throw new Error("Error")

        } catch (e){
            // [!] Здесь try ... catch не работает; висит просто для примера
            // Если кинуть обычное (не промисное) исключение, оно будет перехвачено здесь и корректно обработано

            // Любой из трех вариантов действует

            // done( new Error(e) )
            // done( e )
            // throw new Error(e)

            done(e);
        }


        // MongoClient.connect(url, (err, db) => {
        //      db.collection(collectionName)
        //          .insertOne( {id: 10020, completed: true, title: "test item 5"} )
        //          .then( doc => {
        //
        //              expect(doc.insertedCount).toBe(13);
        //
        //              return doc.insertedId;
        //          })
        //          .then( _id => {
        //              db.collection(collectionName)
        //                  .findOneAndDelete({_id: new ObjectID(_id)})
        //                  .then( res => {
        //
        //                      expect(res.ok).toBe(1)
        //                      db.close()
        //                      done()
        //                  });
        //          }).catch(err => {
        //              // console.log(err.message)
        //              done()
        //              throw err.message
        //      });
        //      ;
        // });
    });

    // [!] Вынести коллекцию полностью: db.todo2.drop()

    it('Delete-one test', (    done   ) => {

        MongoClient.connect(url, (err, db) => {
            var collection = db.collection(collectionName);

            collection.deleteOne({id: 1008},

                // assert.equal(1, result.result.n);
                (err, res) => {
                    assert.equal(err, null);
                    assert.equal(res.deletedCount, 1);
                    assert.equal(res.result.n, 1);

                    done()
                }
            );
        });
    });

    it('Find-One-And-Delete test', (    done   ) => {

        // [!] Можно смело заменить на deleteOne, но, тогда, придется проверять res.result.ok
        MongoClient.connect(url, (err, db) => {
            db.collection(collectionName).findOneAndDelete({id:1006}).then(res => {
                // Здесь объект res отличается от аналогичного объекта в колбэке deleteOne()

                // [!] Здесь эта проверка бесполезна, если не вызывать done()
                // Но, если его юзать, то нужен и catch
                expect(res.ok).toBe(1)

                done()

            }).catch(e => {
                done(e)
            });
        });

    });

}); // describe end