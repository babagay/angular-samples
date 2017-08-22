/**
 * Задача с https://www.hackerrank.com/
 * Создать двусвязный список
 * Метод insert() вставляет элемент в начало списка
 *
 * [!] Запуск в режиме отладки через хром
 * node --inspect-brk node-samples/linked-list_2.js
 * После этого открыть в хроме chrome://inspect/#devices и кликнуть inspect на нужном дивайсе
 * Breakpoint ставится в коде командой debugger;
 *
 * @param data
 * @constructor
 */




    // Node is defined as
var Node = function(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
        this.setPrev = (node) => {
            this.prev = node
        };
        this.setNext = (node) => {
            this.next = node
        };
    }

var list = []

// This is a "method-only" submission.
// You only need to complete this method.
function insert(head, data) {

    if( (data * 1) !== data )
        throw new Error("data type error")

    if ( data == undefined
        || data === null )
        throw new Error("error")

    let node = new Node(data)
    let getHead = () => {
        return list[0] || null
    }

    if(list.length === 0){
        list.push(node)
    } else {
        let first = list[0]
        node.setNext(first)

        let newList = []
        newList.push(node)

        for(let i = 0; i < list.length; i++){
            // let newListIndex = i + 1
            let elem = list[i]
            try {
                if( i == 0 )
                    elem.setPrev( node )
                else
                    elem.setPrev( list[i-1] )

                if( i == (list.length-1) )
                    elem.setNext( null )
                else
                    elem.setNext( list[i+1] )
            } catch (e){}
            newList.push( elem )
        }

        list = newList
    }

    return getHead()
}


let el;
el = insert(null, 4)
el = insert(null, 3)
el = insert(null, 2)
el = insert(null, 1)

/**
 * Список превращается в [1,2,3,4]
 */
try {
    console.log(list[0].next.data, "A") // 2
    console.log(list[1].next.data, "B") // 3
    console.log(list[2].next.data, "C") // 4
    console.log(list[3].prev.data, "D") // 3 - previous
} catch (e){}