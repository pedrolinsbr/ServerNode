module.exports = function (app) {

    var api = {};
    var dao = app.src.modConnectionTest.dao.TesteDAO;

    api.testeConnection = async function (req, res, next) {
        try {
            await dao.testeConnection(req, res, next)
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    next(err);
                })
        } catch (error) {
            res.status(500).send({ message: 'Não foi possivel cadastrar a cidade' });
        }
    }

    return api;
}