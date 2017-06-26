import {Component, Input, Output, EventEmitter} from "@angular/core";
import {todoItemInterface} from "../../shared/todoItemInterface";
import {TodoListComponent} from "../todo-list/todo-list.component";
import {TodoService} from "../../shared/todo.service";
import {MessageService} from "../../shared/message.service";


@Component({
    selector:'todo-item',
    // moduleId:'todoItem',
    styleUrls:[
        'todo-item.component.css'
    ],
    templateUrl: 'todo-item.component.html'
})
export class TodoItemComponent {

    /**
     *
     * [?] Как пробросить сюда айтем - сделал через контейнирование, т.е.
     * вместо того, чтобы писать в шаблоне TodoList
     * <todo-item  *ngFor="let todo of todoItemsArr" ...,
     * я написал
     * <div *ngFor="let todo of todoItemsArr" >
     *          <todo-item  [todoItem]="todo" [parentCmp]="prnt"></todo-item>
     * </div>
     *
     *
     * [?] Как пробросить сюда массив тудушек - реализовал через явную передачу ссылки на другой (родительский) компонент.
     * Также можно сделать через инъекцию в конструкторе:
     *  constructor(@Inject(ParentComponent) private parent: ParentComponent){}
     * Для этого понадобится заимпортить сам Inject.
     */

    // Исходящие данные
    @Output("deleteThisItem") // можем прописать алиас
    del:EventEmitter<todoItemInterface>

    // Входящие данные - мы из шаблона пробросили данные в переменную todoItem
    // В контроллере todoItem не используется, зато используется в шаблоне
    @Input()
    todoItem:todoItemInterface   // = {id:1, title:'', completed:false};

    @Input()
    parentCmp:TodoListComponent

    constructor (private todoService:TodoService, private messageService: MessageService){
        this.del = new EventEmitter();

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
     * Перенес методы mtoggle и delete сюда, но они продолжают работать со сквозным массивом  todoItemsArr,
     * который мы берем из компонента TodoListComponent
     * @param obj
     *
     * [?] Как использовать статические методы
     */
    public /* static */  mtoggle(/*obj: todoItemInterface*/) {

        // Старый рабочий вариант (использовался до декмпозиции, когда эта логика была в родительском компоненте)
        // obj.completed = !obj.completed

        // вариант , возможный после вынесения логики в отдельный компонент
        // Теперь нет необходимости передавать сюда объект, как было раньше: mtoggle(todoItem)
        // this.todoItem.completed = !this.todoItem.completed

        // вариант с сервисом
        // this.todoService.toggleItem(obj)


        // вариант с наблюдателем.
        // Оправляем сообщение непосредственно отсюда, без всяких пробрасываний наверх
        // Минус в необходимости копировать методы sendMessage и clearMessage
        this.sendMessage({
            operation:"toggle",
            item: this.todoItem //obj
        })
    }

    /**
     * Первый вариант реализации логики удаления - пробросить сюда ссылку на родительский компонент и через нее получить доступ к массиву тудшек.
     * Другой вариант - кинуть событие тому же родителю, чтобы он произвел удаление самостоятельно
     *
     * Можно отсюда сразу послать сообщение сервису ,но в учебных целях сначала пробрасываем событие на один уровень вверх
     * @param obj
     */
    public delete(/*obj: todoItemInterface*/){

        console.log('Delete() is fired in TodoItemComponent')

        // Вариант 2 - пробросить объект другому компоненту
        this.del.emit(/*obj*/ this.todoItem)
        // this.del.emit(this.todoItem) // или так

        // Вариант 1 - удалить здесь
        // let index = this.parentCmp.todoItemsArr.indexOf(obj);
        //
        // if(index > -1){
        //     this.parentCmp.todoItemsArr.splice(index,1)
        // }
    }



}