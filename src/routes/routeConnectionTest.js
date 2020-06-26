module.exports = function(app) {

    var api = app.src.modConnectionTest.controllers.TesteController;

    app.post('/api/connection/teste', api.testeConnection);
};