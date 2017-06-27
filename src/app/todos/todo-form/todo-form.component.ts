import {Component, Input, EventEmitter, Output, OnInit} from "@angular/core";
import construct = Reflect.construct;

import {todoItemInterface} from "../../shared/todoItemInterface";
import {TodoService} from "../../shared/todo.service";
import {MessageService} from "../../shared/message.service";


/**
 * @see https://www.typescriptlang.org/docs/handbook/decorators.html
 * @param info
 * @returns {(target:any, propertyKey:string, descriptor:PropertyDescriptor)=>undefined}
 * Чтобы все работало, функция должна возвращать дескриптор: return descriptor;
 */
function newDecorator(info?: string){

    return (target:any, propertyKey:string, descriptor:PropertyDescriptor) => {
        // console.log("decorator customDecorator called")
        // console.log(target) // {create: function, constructor: function} - объект (или функция, на котором декоратор вызван)
        // console.log(propertyKey) // create - имя метода, на котором декоратор вызван
        // console.log(descriptor) // еще некий объект: {configurable: true,  enumerable: true, value:  function (),  writable: true}
        // descriptor.value = info
        console.log( descriptor )

        return descriptor;
    }
}

/**
 * Декоратор, оборачивающий метод в try ... catch
 * @param target
 * @param propertyKey
 * @param descriptor
 * @returns {TypedPropertyDescriptor<any>}
 * Сигнатура:
 * declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
 */
function safe(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {

    // Сохраняем исходную функцию
    var original = descriptor.value

    // подменяем её на обёртку
    descriptor.value = function () {
        try {
            // вызываем исходный метод
            original.apply(this, arguments)
        } catch (e){
            // console.error(e)
        }
    }

    // обновляем дескриптор
    return descriptor
}

/**
 *
 * @param target - метод (в данном контексте класс), для которого применяется декоратор.
 *        target === TodoFormComponent.prototype
 *          {
 *           create:function (),
 *           foo: function (val),
 *           constructor: function TodoFormComponent(),
 *           __proto__: Object
 *          }
 * @param key - имя этого метода. key === "create"
 * @param descriptor - дескриптор данного свойства (property descriptor),
 *                      если оно существует в рамках объекта, иначе undefined.
 *                      Получить дескриптор можно при помощи метода Object.getOwnPropertyDescriptor().
 *        descriptor === Object.getOwnPropertyDescriptor(TodoFormComponent.prototype, "create")
 *        {
 *          configurable:true,
 *          enumerable:true,
 *          value:function (),
 *          writable:true
 *        }
 * @returns {{value: ((...args:any[])=>any)}}
 *
 * [пример]
 * Вызов this.foo('bar')
 * Создаст вывод: Call: foo("bar") => true
 *
 * После декорирования метод foo продолжит работать как обычно,
 * но его вызовы будут также запускать дополнительную функциональность логирования, добавленную в декораторе customLog
 */
function customLog(target: Object, key: string, descriptor: any){

    // Код сработает в момент компиляции
    // console.log('test 1')

    return {
        value: function (...args:any[]) {

            // Код сработает в момент вызова метода, к которому прицеплена аннотация
            // console.log('test 2')

            // конвертируем список аргументов, переданных в метод foo, в строку
            var a = args.map(a => JSON.stringify(a)).join('_')

            // вызываем foo() и получаем его результат
            var result = descriptor.value.apply(this, args)

            // переводим результат в строку
            var r = JSON.stringify(result)

            // Отображаем информацию о вызове метода в консоли
            console.log(`Call: ${key}(${a}) => ${r}`)

            // возвращаем результат выполнения foo
            return result;
        }
    };
}

function customDecorator<T extends {new(...args:any[]):{}}>(constructor?: T){

    return new class extends constructor {
        newProperty = "new property";
        hello = "override";
    }
}

/**
 * Кастомный компонент TodoFormComponent
 * Для минимальной работы нужно подтянуть класс Component + интерфейс todoItemInterface
 * А также, подключить TodoFormComponent в аннотации @NgModule корневого модуля \app\app.module.ts
 *
 * Сюда пробрасывается массив 'тудушек' - в переменную toDoItems. Для этого используется аннотация @Input,
 * а в шаблоне корневого компонента: [toDoItems]="toDos" (полная конструкция: <todo-form [toDoItems]="toDos" ></todo-form>)
 * Это позволяет переменную корневого компонента toDos запихнуть в переменную текущего компонента toDoItems, точнее, передать ссылку на массив в компонент TodoFormComponent
 */
@Component({
    selector: 'todo-form',
    templateUrl: 'todo-form.component.html',
    styleUrls: [
        'todo-form.component.css'
    ],
})
// @customDecorator
export class TodoFormComponent implements OnInit {

    test:boolean = false;

    // пробросить что-то в компонент
    @Input()
    toDoItems:todoItemInterface[]

    // из компонента наружу
    @Output()
    every5sec = new EventEmitter();

    @Output()
    createItem: EventEmitter<todoItemInterface>

    newTodoTitle:string = ''

    constructor (private todoService: TodoService, private messageService: MessageService){

        // тестовое событие
        this.createItem = new EventEmitter()
        setInterval( () => {this.every5sec.emit('event');}, 5000 );
    }

    ngOnInit(){

        //this.toDoItems = this.todoService.getItems()

        try {
            if( this.toDoItems.length > 0 ){}
        } catch (e){
            this.toDoItems = []
        }

    }

    sendMessage(value:any): void {
        // send message to subscribers via observable subject
        this.messageService.sendMessage(value);
    }

    clearMessage(): void {
        // clear message
        this.messageService.clearMessage();
    }

    /**
     * В данном коде, когда TodoFormComponent является вспомогательной директивой,
     * Декоратор вызывается после отработки app.components.ts и до вызова app.module.ts
     * Можно вызывать , опустив пустые скобки, но ts ругается
     * [!] Если вызвать @safe(), то target, propertyKey и descriptor будут undefined
     *
     */
    //@safe
    @customLog
    public create(){

        let title = this.newTodoTitle

        if( title == '' )
            throw new Error('Bad value')

        // Вариант 5 - отправка через Наблюдателя
        this.sendMessage({
            operation:"create",
            item: {
                id: 0,
                title: title,
                completed: false
            }
        })

        // Вариант 4 - Передаем объект сервису. Сервис посылает его на сервер. Если объект принят, добавляем его в шаблоне (логика добавления реализована здесь)
        // let newId = this.todoService.add({
        //         id: this.getId(),
        //         title:title,
        //         completed:false
        //     }).subscribe(
        //         (res:todoItemInterface) => {
        //
        //             this.toDoItems.push( res )
        //
        //             console.log('New Item was created', res)
        //         },
        //     err => {
        //             console.log("Error in TodoFormComponent.create()")
        //         console.error(err)
        //     }
        // );




        /*
        // Вариант 1 - сохраняем прямо здесь
        // try {
        if( typeof this.toDoItems[this.toDoItems.length - 1] == "undefined")
            lastId = 0
        else
            lastId = this.toDoItems[this.toDoItems.length - 1].id
        // } catch (err){
        //     lastId = 1
        // }

        let newTodoItem:todoItemInterface = {
            id: ++lastId,
            title:title,
            completed:false
        }

        this.toDoItems.push(newTodoItem)

        this.newTodoTitle = ''
        */

        // Вариант 2 - пробрасываем вновь созданный объект наверх, где он будет сохранен
        // При таком способе нет нужды пробрасывать логику обработки массива тудушек в дочерние компоненты
        // this.createItem.emit({
        //     id: 0,
        //     title:title,
        //     completed:false
        // });

        // Вариант 3 - передаем новый объект сервису
        // this.todoService.add(newTodoItem)

    }

    private getId():number{

        let id = 0

        // if( typeof todoObject == "undefined" )
        //         return id;

        try {
            id = this.toDoItems[this.toDoItems.length - 1].id
        } catch (e){
            id = 0;
        }

        return ++id
    }

    @customLog
    public foo (val: string): boolean {
        return val.length > 0;
    }
}
































