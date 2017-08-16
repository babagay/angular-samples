
// Object destructuring example
let {mongoose} = require('./connection');

// var Todo = require('./models/todo'); - можно так
let {Todo,add:addTodo,getAll:getAllTodos,getOne:getOneTodo,drop:deleteTodo,updateObject:upTodo,up:upTodoById} = require('./models/todo'); // создаст переменную Todo со значением из поля Todo подключаемого объекта

let {User,addUser,dropUser,updateUser,getUser,getUserMe,getAll:getAllUsers} = require('./models/user');

const {authenticate:authUser} = require('./../../utils/auth')



module.exports = (app) => {

    // GET todos
    app.get('/todo',   (req, res) =>
        getAllTodos(req,res)
    );

    app.get('/todo/:id',   (req, res) => {
            getOneTodo(req,res)
        }
    );

    /**
     * В постмане выставить Raw во вкладке Body
     * И выбрать в выпадающем списке JSON(application/json)
     * [example]
     *  {
     *       "id": 4,
     *       "title": "Fourth",
     *       "completedAt": null
     *  }
     *
     *  Также, можожно использовать x-www-form-urlencoded
     */
    app.post('/todo', (req,res) =>
        addTodo(req,res)
    );

    app.delete('/todo/:id', (req,res) =>
        deleteTodo(req,res)
    );

    app.put('/todo/:id', (req,res) =>
        upTodoById(req,res)
    );

    app.patch('/todo', (req,res) =>
            upTodo(req, res)
    );

    // GET Users
    app.get('/user', (req, res) =>
        getAllUsers(req,res)
    );

    // OK
    // app.get('/user/me', (req, res) =>
    //     getUserMe(req,res)
    // );

    // Using middleware
    app.get('/user/me', authUser, (req, res) =>
        getUserMe(req,res)
    );

    app.get('/user/:id', (req,res) =>
        getUser(req,res)
    );

    app.post('/user', (req,res) =>
        addUser(req, res)
    );

    app.delete('/user/:id', (req,res) =>
        dropUser(req,res)
    );

    app.put('/user/:id', (req,res) =>
        updateUser(req,res)
    );

    // [!] метод view не сработал

};

