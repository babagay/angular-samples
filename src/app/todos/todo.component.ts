import {todoItemInterface} from "../shared/todoItemInterface";
import {Component, OnInit} from "@angular/core";
import {TodoService} from "../shared/todo.service";
import {Subscription} from "rxjs/Subscription";
import {MessageService} from "../shared/message.service";

@Component({
    selector: 'todo',
    moduleId: 'foo', //module.id,
    styleUrls: [
        './todo.component.css'
    ],
    templateUrl: './todo.component.html'
})
export class TodoComponent implements OnInit{

    public toDoItemSet:todoItemInterface[] // = [        {id:303,completed:false, title:'Test action'}    ] - инициализация перенесена в конструктор


    message: any;
    subscription: Subscription;

    ngOnInit(): void {
        // [?] можно ли сделать, чтобы метод todoService.getToDos() сначала вытягивал данные с сервера, а потом их возвращал,
        // что давало бы возможность писать так:
        // this.todoItemsArr = this.todoService.getToDos()

        this.toDoItemSet  = [        {id:303,completed:false, title:'Test action'},  {id:304,completed:false, title:'Test action 2'}    ]

        this.todoService.getToDos()
            .do( list => console.log(list) )
            .subscribe(
                list => {
                    // this.toDoItemSet = list

                    this.toDoItemSet = list.map( item => {
                         return   {
                             id: item["_id"],
                             completed: item.completed === true ? true : false,
                             title: item.title
                            }
                        }
                     );

                    // [???] правильно ли это: заполнять поддерживаемый сервисом массив из компонента - конечно, нет. Решилось добавлением map( t => this.todoItems = t )
                    // this.todoService.setToDos(list);
                },
                err => { console.log(err,'error') }
            );
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    constructor(private todoService: TodoService, private messageService: MessageService){
        this.toDoItemSet = []

        // Расчитываем на то, что message - это объект todoItemInterface
        // Можно вставить проверку, что message удовлетворяет данному контракту
        this.subscription = this.messageService.getMessage().subscribe(message => {

            //console.log('Captured',  message)

            let action = message.operation || ''
            let obj = message.item || false

            if( obj === false )
                return;

            switch (action){
                case 'create':
                    this.addNewItem(obj)
                    break;
                case 'delete':
                    this.deleteItem(obj)
                    break;
                case 'toggle':
                    this.toggleItem(obj)
                    break;
            }
        });
    }

    /**
     * @param $event
     */
    addNewItem(obj:todoItemInterface){

        console.log("TodoComponent :: addNewItem()",obj)

        let title = obj.title

        this.todoService.add({
            id: 0,
            title:title,
            completed:false
        }).subscribe(
            res => {
                //todo Добавить айтем в шаблоне

                // let id = 0

                // if( typeof todoObject == "undefined" )
                //         return id;

                // try {
                //     id = this.todoItems[this.todoItems.length - 1].id
                // } catch (e){
                //     id = 0;
                // }

                // todoObject.id = ++id

                this.toDoItemSet.push({
                    id: res._id,
                    completed: res.completed,
                    title:res.title
                })

                //return id

                // console.log('Item with id ['+ newId +'] created')
            },
            err => {}
        );
    }

    deleteItem(todoItem: todoItemInterface){

        console.log("TodoComponent :: deleteItem()")

        // Дропнуть на сервере
        this.todoService.drop(todoItem).subscribe(
            res => {

                console.log('Remove obj from view.')

                // Удалить в шаблоне
                let index = this.toDoItemSet.indexOf(todoItem);

                if(index > -1){
                    this.toDoItemSet.splice(index,1)
                }

            },
            err => {
                console.log('Error in deleteItem()',err)
            }
        );
    }

    toggleItem(todoItem: todoItemInterface){

        console.log("TodoComponent :: toggle()")

        let fakeObj = {
            id: todoItem.id,
            title: todoItem.title,
            completed: !todoItem.completed
        }

        // Обновить на сервере
        this.todoService.toggleItem(fakeObj).subscribe(
            res => {

                // Изменить в шаблоне
                let index = this.toDoItemSet.indexOf(todoItem)

                try {
                    this.toDoItemSet[index].completed = !this.toDoItemSet[index].completed
                } catch (e){}
            },
            err => {
                console.log('Error in toggleItem()',err)
            }
        );
    }

}


































