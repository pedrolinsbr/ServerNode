module.exports = function (app, cb) {

    var api = {};

    const tmz = app.src.utils.DataAtual;
    const ctl = app.src.modGlobal.controllers.GenericController;
    const mdl = app.src.modOferece.models.TransportadoraModel;
    const dao = app.src.modOferece.dao.TransportadoraDAO;

    var objModel = mdl['G024'];

    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res, next) {

        await dao.editar(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.lista = async function (req, res, next) {

        await dao.listar(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\
    
    api.listaPCAtende = async function (req, res, next) {

        await dao.listarPCAtende(req, res, next)
        .then((result) => {
            res.status(200).send(result)
        })
        
        .catch((err) => {
            next(err);
        })
    }

    //-----------------------------------------------------------------------\\

    api.listaGTP = async function (req, res, next) {

        await dao.listarGTP(req, res, next)
        .then((result) => {
            res.status(200).send(result)
        })
        
        .catch((err) => {
            next(err);
        })
    }

    //-----------------------------------------------------------------------\\    

    api.insere = async function (req, res, next) {

        req.objModel = objModel;
        req.body.DTCADAST = tmz.dataAtualJS();

        await ctl.insere(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            next(err);
        })
    }

    //-----------------------------------------------------------------------\\

    api.altera = async function (req, res, next) {

        req.objModel = objModel;

        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\    

    api.exclui = async function (req, res, next) {

        req.objModel = objModel;

        await ctl.exclui(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.remove = async function (req, res, next) {
        
        req.objModel = objModel;

        await ctl.remove(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    return api;
}
