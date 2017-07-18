module.exports = function (app,pug) {

    app.get('/api-test', (req, res) => {
        console.log("Hello")

        // res.send('Hello')
        // res.send('<b>Hello</b>')
        res.send({
            name: 'Hello'
        })
    });

    app.get('/', (req, res) => {

        // Так (без колбэка) тоже работает
        res.render('home',{
            pageTitle: "Home Page",
            currYear: new Date().getFullYear()
        })
    });

    /**
     * Рендеринг через handlebars
     * [?] Что за next()
     */
    app.get('/about', (req, res, next) => {

        res.render('about',
            {
                name: 'Alex',
                email: 'won@yo.com',
                showList: true,
                list: ["First", "Second"],
                currYear: new Date().getFullYear()
            },
            // Добавление этого колбэка помогло выявить ошибку, т.к. error , похоже, содержала Error, если возникала ошибка
            (error, template) => {
                res.send( template )
            }
        );

        // [!] После проб и ошибок перенёс res.send() в колбэк
        // Подозреваю, что такое поведение не зависит от шаблонизатора
        // res.send(html)
    });

    /**
     * Использование шаблонизатора Pug
     * Форматирование шаблона происходит ОТСТУПАМИ
     */
    app.get('/help', (req, res) => {

        // Рендер отдельной строки
        // var html = pug.render('p Hello world!') // Ok

        // [?] Как правильно указывать пути к шаблонам (сконфигурировать templatesDir глобально)
        var html = pug.renderFile('weather-api/templates/help.pug', {
            name: "Alex",
            foo: true,
            bar: function (a,b) { return a + b; }
        });

        res.send(html)
    });

    app.get('/plain-text-test', (req, res) => {

        res
            .send(
            'Hello world!'
            )
    });

    app.get('/plain-text-test-not-found', (req, res) => {

        res
            .status(404)
            .send({
                error: 'Not found'
            })
    });

    app.get('/json-test', (req, res) => {

        res.send(
            {foo:"hello", bar: "world"}
            )
    });
};