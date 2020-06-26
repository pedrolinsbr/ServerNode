module.exports = function (app, cb) {

    var api = {};

    const tmz = app.src.utils.DataAtual;
    const ctl = app.src.modGlobal.controllers.GenericController;
    const mdl = app.src.modOferece.models.MotivoModel;

    var objModel = mdl['O004'];

    //-----------------------------------------------------------------------\\

    api.lista = async function (req, res, next) {
        
        req.objModel = objModel;
        
        await ctl.lista(req, res, next)    
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res, next) {

        req.objModel = objModel;
        
        await ctl.edita(req, res, next)    
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\    

    api.insere = async function (req, res, next) {

        req.objModel = objModel;
        req.body.DTCADAST = tmz.dataAtualJS();

        await ctl.insere(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
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
