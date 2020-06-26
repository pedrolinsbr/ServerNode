module.exports = function (app, cb) {

    var api = {};

    const log   = app.config.logger;
    const tmz   = app.src.utils.DataAtual;
    const utils = app.src.utils.Formatador;    
    const ctl   = app.src.modGlobal.controllers.GenericController;
    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const dao   = app.src.modOferece.dao.OtimizadorDAO;
    const mdl   = app.src.modOferece.models.OtimizadorModel;    

    //-----------------------------------------------------------------------\\    

    api.lista = async function (req, res ,next) {

        req.objModel = mdl['O006'];

        await ctl.lista(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }
    
    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res ,next) {

        req.objModel = mdl['O006'];

        await ctl.edita(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }
    
    //-----------------------------------------------------------------------\\

    api.insere = async function (req, res ,next) {

        req.objModel = mdl['O006'];
        req.body.DTCADAST = tmz.dataAtualJS();

        await ctl.insere(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }
    
    //-----------------------------------------------------------------------\\    

    api.altera = async function (req, res ,next) {

        req.objModel = mdl['O006'];
        
        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }
    
    //-----------------------------------------------------------------------\\

    api.exclui = async function (req, res ,next) {

        req.objModel = mdl['O006'];

        await ctl.exclui(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }
    
    //-----------------------------------------------------------------------\\       

    api.listaTPV = async function (req, res, next) {

        await dao.listarTPV(req.params.id, res, next)
        .then((result) => {
            res.status(200).send(result);
        });     
    }

    //-----------------------------------------------------------------------\\  

    api.listaTPVCad = async function (req, res, next) {

        await dao.listarTPVCad(req.params.id, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });        
    }

    //-----------------------------------------------------------------------\\      

    api.removeTPV = async function (req, res, next) {

        req.objModel = mdl['O007'];

        await ctl.remove(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });    
    }

    //-----------------------------------------------------------------------\\    

    api.insereTPV = async function (req, res, next) {

        var arOcorre = [];
        var arID     = [];
        var arTPV    = req.body;
        var objConn  = await gdao.controller.getConnection();

        if ((Array.isArray(arTPV)) && (arTPV.length > 0)) {

            await gdao.controller.setConnection(objConn);

            var objRemove = utils.setSchema(mdl['O007_DEL'], arTPV[0]);
            objRemove.objConn = objConn;

            await gdao.remover(objRemove, res, next)
            .then(async (result) => {

                for (var objTPV of arTPV) {

                    var objTipo = utils.setSchema(mdl['O007'], objTPV);
                    objTipo.vlFields.DTCADAST = tmz.dataAtualJS();

                    if (utils.validateSchema(objTipo)) {                            
                                
                        await gdao.controller.setConnection(objConn);
                        objTipo.objConn = objConn;

                        await gdao.inserir(objTipo, res, next)
                        .then((result) => {
                            arID.push(result);
                        })
                        .catch((err) => {                            
                            arOcorre.push('Erro na inserção de dados');
                        });
    
                    } else {
                        arOcorre.push('Objeto inválido');                    
                        break;                    
                    }                
                }
                
            })

            .catch((err) => {
                arOcorre.push('Erro na remoção dos dados');
            });


        } else {
            arOcorre.push('Array inválido');            
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ arID, arOcorre });
    }

    //-----------------------------------------------------------------------\\

    return api;
}
