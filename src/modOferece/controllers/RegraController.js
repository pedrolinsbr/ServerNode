module.exports = function (app, cb) {

    var api = {};

    const tmz   = app.src.utils.DataAtual;   
    const utils = app.src.utils.Formatador;     
    const ctl   = app.src.modGlobal.controllers.GenericController;    
    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const dao   = app.src.modOferece.dao.RegraDAO;
    const mdl   = app.src.modOferece.models.RegraModel;

    //-----------------------------------------------------------------------\\    

    api.lista = async function (req, res ,next) {

        try {

            var rs = await dao.listaGrid(req, res, next);
            res.send(rs);

        } catch (err) {

            res.status(500).send({ erro: err.message });

        }

    }
    
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

    api.exclui = async function (req, res, next) {

        req.objModel = mdl.O008;

        await ctl.exclui(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });        
    }

    //-----------------------------------------------------------------------\\

    api.remove = async function (req, res ,next) {
     
        var arOcorre = [];        

        var objConn = await gdao.controller.getConnection();
        
        await gdao.controller.setConnection(objConn);
        req.objConn = objConn;

        await dao.removerRTPV(req, res, next)
        .then(async (result) => {

            var objR3PL = mdl.O009_DEL;
            objR3PL.vlKey[objR3PL.key[0]] = req.params.id;

            await gdao.controller.setConnection(objConn);
            objR3PL.objConn = objConn;

            await gdao.remover(objR3PL, res, next) 
            .then(async (result) => {

                var objRegra   = mdl.O008;
                objRegra.vlKey = objR3PL.vlKey;
        
                await gdao.controller.setConnection(objConn);
                objRegra.objConn = objConn;

                await gdao.remover(objRegra, res, next) 
                .catch((err) => {
                    arOcorre.push('Erro ao remover regra');
                });
            })

            .catch((err) => {
                arOcorre.push('Erro na remoção das 3PLs na regra');
            });    
        })

        .catch((err) => {
            arOcorre.push('Erro na remoção das restrições de tipo de veículo');
        });
        

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }
 
        res.status(cdStatus).send({ arOcorre });
    }
    
    //-----------------------------------------------------------------------\\       

    api.insere = async function (req, res, next) {

        req.body.DTCADAST = tmz.dataAtualJS();

        var arOcorre = [];
        var objRet   = { id: null };
        var objVal   = utils.checaEsquema(req.body, mdl.O008.columns);

        if (objVal.blOK) {

            var rs = await dao.searchUK(objVal.value, res, next);

            if (rs.length == 0) {

                var objDados = {};

                objDados.vlFields = objVal.value;
                objDados.table    = mdl.O008.table;
                objDados.key      = mdl.O008.key;

                var objRet = await gdao.inserir(objDados, res, next)      
                .catch((err) => {
                    arOcorre.push('Erro na inserção de dados');
                });

            } else {
                arOcorre.push(`A regra #${rs[0].IDO008} - '${rs[0].DSREGRA}' já está cadastrada com as mesmas características`);                
            }

        } else {
            arOcorre.push('Objeto inválido');
        }

        var cdStatus = (arOcorre.length == 0) ? 200:500;
        res.status(cdStatus).send({ arOcorre, id: objRet.id });
    }

    //-----------------------------------------------------------------------\\

    api.altera = async function (req, res, next) {

        var arOcorre = [];
        var rs = await dao.searchUK(req.body, res, next);

        if (rs.length == 0) {

            req.objModel = mdl.O008;
            var objRet = await ctl.altera(req, res, next);
            res.send(objRet);

        } else {
            arOcorre.push(`A regra #${rs[0].IDO008} - '${rs[0].DSREGRA}' já está cadastrada com as mesmas características`);
            res.status(500).send({arOcorre});
        }
    }

    //-----------------------------------------------------------------------\\

    api.listaR3PL = async function (req, res, next) {

        await dao.listarR3PL(req.params.id, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.listaR3PLCad = async function (req, res, next) {

        await dao.listarR3PLCad(req.params.id, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.insereR3PL = async function (req, res, next) {

        var arOcorre = [];
        var arID     = [];
        var arDados  = req.body;
        var ttCommit = 0;

        var objConn  = await gdao.controller.getConnection();

        if ((Array.isArray(arDados)) && (arDados.length > 0)) {

            for (var objDados of arDados) {

                var objSchema = utils.setSchema(mdl.O009, objDados);
                objSchema.vlFields.DTCADAST = tmz.dataAtualJS();

                if (utils.validateSchema(objSchema)) { 

                    await gdao.controller.setConnection(objConn);
                    objSchema.objConn = objConn;
                    
                    await gdao.inserir(objSchema, res, next)
                    .then((result) => {
                        arID.push(result.id);
                        ttCommit++;
                    })

                    .catch((err) => {
                        arOcorre.push('Erro na inserção de dados');
                    });
  
                } else {
                    arOcorre.push('Objeto inválido');
                    break;
                }    
            }            

        } else {
            arOcorre.push('Array inválido');
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ arOcorre, arID, ttCommit, ttReg: arDados.length });
    }

    //-----------------------------------------------------------------------\\    

    api.removeR3PL = async function (req, res, next) {

        var arOcorre = [];        

        var objConn = await gdao.controller.getConnection();

        await gdao.controller.setConnection(objConn);
        req.objConn = objConn;

        await dao.removerRTPV(req, res, next)

        .then(async (result) => {

            var objRegra = mdl.O009_DEL;
            objRegra.vlKey[objRegra.key[0]] = req.params.id;

            await gdao.controller.setConnection(objConn);
            objRegra.objConn = objConn;
    
            await gdao.remover(objRegra, res, next)
            .catch((err) => {
                arOcorre.push('Erro ao remover regras prévias');
            });

        })

        .catch((err) => {
            arOcorre.push('Erro ao remover restrições de veículos prévias');
        });


        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ arOcorre });        

    }

    //-----------------------------------------------------------------------\\        

    api.listaRTPV = async function (req, res, next) {

        req.tpJoin = 'LEFT';

        await dao.listarRTPV(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.listaRTPVCad = async function (req, res, next) {

        req.tpJoin = 'INNER';

        await dao.listarRTPV(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\
    
    api.insereRTPV = async function (req, res, next) {

        var arOcorre = [];        
        var objBody  = req.body;
        var ttCommit = 0;
        var ttReg    = 0;

        var objConn  = await gdao.controller.getConnection();

        if (Array.isArray(objBody.IDG030)) {

            ttReg = objBody.IDG030.length;

            var objDados = 
                { 
                        IDO009:     objBody.IDO009
                    ,   IDS001:     objBody.IDS001
                    ,   DTCADAST:   tmz.dataAtualJS()
                };    

            var objRemove = utils.setSchema(mdl.O010_DEL, objDados);

            if (utils.validateSchema(objRemove)) {

                await gdao.controller.setConnection(objConn);
                objRemove.objConn = objConn;
                
                await gdao.remover(objRemove, res, next)
                .then(async (result) => {

                    for (idTPV of objBody.IDG030) {

                        objDados.IDG030 = parseInt(idTPV);
                        var objSchema = utils.setSchema(mdl.O010, objDados);                        
        
                        if (utils.validateSchema(objSchema)) {
                            
                            await gdao.controller.setConnection(objConn);
                            objSchema.objConn = objConn;
        
                            await gdao.inserir(objSchema, res, next) 
                            .then((result) => {
                                ttCommit++;    
                            })
        
                            .catch((err) => {
                                arOcorre.push('Erro ao inserir restrição');
                            });
        
                        } else {
                            arOcorre.push('Objeto TPV inválido');
                        }    
                    }
                })

                .catch((err) => {
                    arOcorre.push('Objeto inválido');
                });
            }

        } else {
            arOcorre.push('Array inválido');
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ ttReg, ttCommit, arOcorre }); 
    }

    //-----------------------------------------------------------------------\\    

    api.removeRTPV = async function (req, res, next) {

        req.objModel = mdl.O010;

        await ctl.remove(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });    
    }

    //-----------------------------------------------------------------------\\

    api.listaArmazem = async function (req, res, next) {
        
        await dao.listarArmazem(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });                
    }

    //-----------------------------------------------------------------------\\

    api.busca = async function (req, res, next) {

        await dao.buscar(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\

    return api;
}
