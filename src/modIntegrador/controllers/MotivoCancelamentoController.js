module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modIntegrador.dao.MotivoCancelamentoDAO;

    api.listar = async function (req, res, next) {
        await dao.listar(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.buscar = async function (req, res, next) {
        await dao.buscar(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
      };

    api.inserir = async function (req, res, next) {
        await dao.inserir(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };

    api.atualizar = async function (req, res, next) {
        await dao.atualizar(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };

    api.remover = async function (req, res, next) {
        try {
            await dao.remover(req, res, next)
            res.status(200).send({message: 'OK'});
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    };
    
return api;
}