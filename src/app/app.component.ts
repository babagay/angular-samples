/**
 * Angular 2 decorators and services
 */

import {
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {AppState} from './app.service';
import {Http} from '@angular/http';
import {error} from "util";

// Здесь директиву можно не импортить - импортить в app.module.ts (корневой компонент)
// import {TodoFormComponent} from './todo-form/todo-form.component';

import {todoItemInterface} from "./shared/todoItemInterface";


const todos: todoItemInterface[] = [
    {
        id: 101,
        title: 'Изучить JS',
        completed: true,
    },
    {
        id: 102,
        title: 'Изучить ангулар 2',
        completed: false,
    },
    {
        id: 103,
        title: 'Make App',
        completed: false,
    }
];

/**
 * App Component
 * Top Level Component, который используется в качестве загрузочного
 */
@Component({
    //moduleId: module.id,
    selector: 'app',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './app.component.css'
    ],
    templateUrl: './app.components.html'
})
export class AppComponent implements OnInit {
    public angularclassLogo = 'assets/img/angularclass-avatar.png';
    public name = 'Angular 2 Webpack Starter';
    public url = 'https://twitter.com/AngularClass';

    titleIndex = 'Index';
    titleHome = 'Home';
    titleDetail = 'Detail';

    // Использовалось, до того, как тудушки стали браться через апи
    // toDoItemSet:todoItemInterface[] = todos;

    // test
    // public toDoItemSet:todoItemInterface[] = [{id:222,completed:true,title:'-'}]

    myData: Array<any>;

    constructor(private http: Http,
                public appState: AppState) {
    }

    public ngOnInit() {
        console.log('Initial App State', this.appState.state);

        // загрузить тестовые картиннки
        this.http.get('https://jsonplaceholder.typicode.com/photos')
            .map(response => response.json())
            .subscribe(res => this.myData = res);
    }

    /**
     * Так можно кидать события от другого компонента этому
     * @param $event
     */
    public everyFiveSecondsHandler($event:any){
        // Сюда попадает строка, сгенерированная в конструкторе TodoFormComponent'a: this.every5sec.emit('event')
        // console.log('everyFiveSecondsHandler',$event)
    }

    // Старый вариант - когда массивв тудушек хранился в текущем компоненте
    // public addNewItem(newItem:todoItemInterface){
    //
    //     if( typeof newItem == "undefined" )
    //         return false;
    //
    //     this.toDoItemSet.push(newItem)
    // }


}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
