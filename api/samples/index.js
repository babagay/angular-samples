
module.exports = function(app, Rx) {

    var posts = []

    /**
     * взяь массив постов, которые прилетели и отображены на странице в текущий момент
     * Как только в одном из постов меняется флаг hasBeenJustUpdated на true, наблюдатель срабатывает
     * @returns {*}
     */
    function getAllPosts() {

        posts = [
            { id: 1, title: "Post 1", hasBeenJustUpdated: false },
            { id: 12, title: "Post 2", hasBeenJustUpdated: false },
            { id: 13, title: "Post 3", hasBeenJustUpdated: false },
            { id: 14, title: "Post 4", hasBeenJustUpdated: false },
        ]

        return posts
    }

    /**
     *  Создаем поток всех постов
     *
     * @returns {*}
     */
    function createStreamFromPosts() /*: Observable<post[]> */ {
        return Rx.Observable.from( getAllPosts() );
    }

    function updatePosts(post){

        console.log('update post ', post)

        // todo: delete post from posts arr

        posts.push(post)

        console.log(posts)
    }

    fetchPost = function (id, callback) {
        console.log('fetch post')

        callback()
    }


    renderPost = function (id) {
        console.log('Render post ' + id)
    }
        /**
     * запросить конкретный пост и перерисовать его view
     */
    var doSomeAction = Rx.Observer.create(
        post => {
            // Всё Ок, пост получен

            fetchPost(post.id, function(){
                // перерисовать пост
                renderPost(post.id)

                // сбрость флаг обновления
                post.hasBeenJustUpdated = 0

                // обновить данный пост в массиве posts
                updatePosts(post)
            })
        },
        error => {
            var mesg = error.message || 'что-то пошло не так'
            console.log(mesg);
        },
        () => {
            console.log('onCompleted is Done');
        }
    );


    /**
     * Наконец, клиентский код:
     * В потоке постов ищем обновленный айтем и применяем к нему действие
     * Предполагается, что поток генерирует объекты типа post
     */
    createStreamFromPosts().where( post => post.hasBeenJustUpdated === true ).subscribe( doSomeAction )


};