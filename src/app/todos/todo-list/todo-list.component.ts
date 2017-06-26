import {Component, ViewEncapsulation, Input, OnInit} from "@angular/core";
import {todoItemInterface} from "../../shared/todoItemInterface";
import {TodoService} from "../../shared/todo.service";
import {MessageService} from "../../shared/message.service";


// import {TodoService}
@Component({
    // moduleId: 'todoList',
    selector: 'todo-list',
    templateUrl: 'todo-list.component.html',
    encapsulation: ViewEncapsulation.Native,
    styleUrls: [
        'todo-list.component.css'
    ],
})
export class TodoListComponent implements OnInit {

    // забрасываем массив тудушек из шаблона в текущий компонент
    @Input()
    public todoItemsArr:todoItemInterface[]

    prnt:TodoListComponent = this;

    private TodoService: TodoService;

    // Пример внедрения зависимости
    // Если слово private опустить. нужно будет создать поле и вручную сделать присваивание
    constructor(private todoService: TodoService, private messageService: MessageService){

        // Такое присваивание в конструкторе делать НЕ рекомендуется
        // this.todoItemsArr = todoService.getToDos()

        // this.todoItemsArr = this.todoService.todoItems
        //this.todoItemsArr = []
    }

    ngOnInit(){

        try {
            if (this.todoItemsArr.length < 1) {
            }
        } catch (e) {
            this.todoItemsArr = []
        }

        //this.todoItemsArr = this.todoService.getItems()
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
     * В учебных целях объект пробрасывается сперва сюда, а затем компоненту, который управляет удалением
     *
     * Здесь можно вызвать конкретный сервис, который умеет удалять объект:
     * this.todoService.drop(obj)
     *
     * Но, если логика удаления находится в каком-то компоненте, используем отправку сообщения наблюдателям
     *
     * @param obj
     */
    public removeItemFromList(obj:todoItemInterface){

        console.log('TodoListComponent.removeItemFromList()')

        this.sendMessage({
            operation:"delete",
            item: obj
        })
    }
}






















