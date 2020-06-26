module.exports = function (app, cb) {

    var api = {};

    const tmz   = app.src.utils.DataAtual;    
    const utils = app.src.utils.Formatador;    
    const mdl   = app.src.modOferece.models.ContatoModel;
    const dao   = app.src.modOferece.dao.ContatoDAO;
    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const ctl   = app.src.modGlobal.controllers.GenericController;
    
   //-----------------------------------------------------------------------\\

    api.insere = async function (req, res, next) {
        
        var arOcorre = [];

        req.body.DTCADAST = tmz.dataAtualJS();

        if (req.body.DTNASCIM !== undefined)
            req.body.DTNASCIM = tmz.retornaData(req.body.DTNASCIM, 'DD/MM/YYYY');
    
        var objConn = await gdao.controller.getConnection();        
        
        var objContato = utils.setSchema(mdl['G007'], req.body);

        if (utils.validateSchema(objContato)) {

            await gdao.controller.setConnection(objConn);
            objContato.objConn = objConn;
            
            await gdao.inserir(objContato, res, next)
            .then(async (result) => {

                objContato.vlFields[objContato.key[0]] = result.id;

                var objRef = utils.setSchema(mdl['G025'], req.body);
                objRef.vlFields[objContato.key[0]] = objContato.vlFields[objContato.key[0]];

                if (utils.validateSchema(objRef)) {

                    await gdao.controller.setConnection(objConn);
                    objRef.objConn = objConn;

                    await gdao.inserir(objRef, res, next)                    
                    .catch((err) => {
                        arOcorre.push('Erro na inserção de referência');
                    })

                } else {
                    arOcorre.push('Objeto Referência inválido');
                }
            })

            .catch((err) => {
                arOcorre.push('Erro na inserção do Contato');
            });

        } else {
            arOcorre.push('Objeto Contato inválido');
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            var id = objContato.vlFields[objContato.key[0]];
            await objConn.close();            

        } else {
            var cdStatus = 500;
            var id = null;
            await objConn.closeRollback();            
        }

        res.status(cdStatus).send({ arOcorre, id });
    }

    //-----------------------------------------------------------------------\\

    api.altera = async function (req, res, next) {
        
        req.objModel = mdl['G007'];
        
        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\    

    api.exclui = async function (req, res, next) {
        
        req.objModel = mdl['G007'];
        
        await ctl.exclui(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\   
    
    api.insereTipo = async function (req, res, next) {
        
        req.objModel = mdl['G008'];
        req.body.DTCADAST = tmz.dataAtualJS();
        
        await ctl.insere(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\      

    api.alteraTipo = async function (req, res, next) {
        
        req.objModel = mdl['G008'];
        
        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\      
    
    api.excluiTipo = async function (req, res, next) {
        
        req.objModel = mdl['G008'];
        
        await ctl.exclui(req, res, next)
        .then((result) => {
            res.status(200).send(result);
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

    api.edita = async function (req, res, next) {

        await dao.editar(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\  
    
    api.editaTipo = async function (req, res, next) {

        await dao.editarTipo(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\       

    api.listaTipo = async function (req, res, next) {

        await dao.listarTipo(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\

    api.listaCargo = async function (req, res, next) {

        await dao.listarCargo(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\    

    api.listaSetor = async function (req, res, next) {

        await dao.listarSetor(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\    

    return api;
}