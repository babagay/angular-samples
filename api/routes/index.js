const noteRoutes = require('./routes');

module.exports = function(app, db) {

    noteRoutes(app, db);

    // Тут, позже, будут и другие обработчики маршрутов

};