module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modTransportation.dao.ValidacaoMaloteDAO;

    api.listChadocs = async function (req, res, next) {
        await dao.listChadocs(req, res, next)
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            })
    }

    api.createValidation = async function (req, res, next) {
        await dao.createValidation(req, res, next)
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            })
    }

    return api;
}