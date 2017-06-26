import {Http, Response, Headers, RequestOptions} from "@angular/http"; // Чтобы такой импорт стал возможен, надо сначала заимпортить модуль Http в app.module.ts
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {todoItemInterface} from "./todoItemInterface";
import {type} from "os";

// [?] зачем нужна эта аннотация - чтобы в этом сервисе использовтаь другие сервисы
@Injectable()
export class TodoService {

    /**
     * @deprecated - перенесли хранение массива тудушек в компонент todo
     * @type {[{id: number; completed: boolean; title: string}]}
     */
    public todoItems:todoItemInterface[] = [
        {id:303,completed:false, title:'Test action'}
    ]

    private testUrl:string =  'http://localhost:8000/todo'  //'http://demo9293294.mockable.io/todo'

    constructor(private http:Http){
    }

    private handleError (error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private extractData(res: Response){

        let body = res.json()

        // Видимо, в стандартном ответе результат вкладывается в поле data, а тут, при использовании тестового апи этого поля нет
        // return body.data || {}

        return body || {}
    }

    /**
     * @returns {Observable<R>}
     * Observable<todoItemInterface[]> заменил на Observable<any[]>
     */
    public getToDos():Observable<any[]>{
        return this.http
            .get( this.testUrl )
            .map( this.extractData )
            //.map( t => this.todoItems = t )
            .catch( this.handleError );
    }

    public setToDos(toDos:todoItemInterface[]){
        this.todoItems = toDos
    }

    // Заново вытащить тудушки и обновить локальный массив
    updateToDos(){

        this.getToDos()
            .do( list => console.log(list) )
            .subscribe(
                list => {
                    this.todoItems = list;
                },
                err => { console.log(err,'error') }
                );
    }

    getItems():todoItemInterface[]{
        return this.todoItems
    }

    add(todoObject:todoItemInterface):Observable<any>{

        let headers = new Headers({'Content-type': 'application/json; charset=utf-8'})
        let options = new RequestOptions({ headers })

        return this.http.post(this.testUrl, todoObject, options)
            .map( res =>
                res.json() as todoItemInterface
            )
            .catch( this.handleError );

    }


    drop(obj:todoItemInterface):Observable<any>{

        console.log('drop() in TodoService')

        let headers = new Headers({'Content-type': 'application/json'})
        let options = new RequestOptions({ headers })

        return this.http.delete(this.testUrl + '/' + obj.id, options)
            .map( res => res.json().data as todoItemInterface )
            .catch( this.handleError );
    }


    public toggleItem(obj: todoItemInterface):Observable<any>{

        let headers = new Headers({'Content-type': 'application/json'})
        let options = new RequestOptions({ headers })

        return this.http.put(this.testUrl + '/' + obj.id, obj, options)
            .map( res => res.json().data as todoItemInterface )
            .catch( this.handleError );


    }
}






















