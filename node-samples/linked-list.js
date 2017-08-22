/**
 * Создать двусвязный список
 * Метод insert() вставляет элемент в конец списка
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
        let last = list[list.length - 1]
        last.setNext(node)
        node.setPrev(last)

        list.push(node)
    }

    return getHead()
}


let el;
el = insert(null, 2)
el = insert(null, 3)
el = insert(null, "null")


console.log( list[1].prev.data )
console.log( list[1].next.data )

