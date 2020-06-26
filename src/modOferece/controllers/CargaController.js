module.exports = function (app, cb) {

    var api = {};

    const tmz   = app.src.utils.DataAtual;
    const utils = app.src.utils.Formatador;
    const ctl   = app.src.modGlobal.controllers.GenericController;
    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const dao   = app.src.modOferece.dao.CargaDAO;
    const mdl   = app.src.modOferece.models.CargaModel;

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

    api.alteraDataColeta = async function (req, res, next) {
        
        req.objModel = mdl['G046_COL'];

        if (req.body.DTCOLATU !== undefined)
            req.body.DTCOLATU = tmz.retornaData(req.body.DTCOLATU, 'DD/MM/YYYY');

        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.cabecalho = async function (req, res, next) {

        await dao.listarCabecalho(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\    

    api.lista3PL = async function (req, res, next) {

        var ar3PLRegra = await dao.listar3PLRegra(req, res, next);
        var arFiltro   = await dao.listar3PLSpot(req, res, next);

        if (ar3PLRegra.length > 0) {

            var arKeys    = [...new Set(ar3PLRegra.map(uk => uk.IDG024))];
            var ar3PLSpot = [];

            arFiltro.forEach(objSpot => {
                var blOK = true;

                arKeys.forEach(id => {
                    if (objSpot.IDG024 == id) blOK = false;
                });

                if (blOK) ar3PLSpot.push(objSpot);
            });

        } else {

            var ar3PLSpot = arFiltro;
        }

        var arJoin = ar3PLRegra.concat(ar3PLSpot);

        res.status(200).send(arJoin);
    }

    //-----------------------------------------------------------------------\\    
    
    api.listaEtapa = async function (req, res, next) {

        await dao.listarEtapa(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }

    //-----------------------------------------------------------------------\\        

    api.roteiriza = async function (req, res, next) {

        var arOcorre = [];

        var objConn = await gdao.controller.getConnection();
        req.objConn = objConn;

        var objRemove = utils.setSchema(mdl['O005_DEL'], req.body);

        await gdao.controller.setConnection(objConn);
        objRemove.objConn = objConn;

        await gdao.remover(objRemove, res, next)
        .then(async (result) => {

            var objCarga = utils.setSchema(mdl['G046'], req.body);
            objCarga.vlFields.STCARGA = 'R';

            if (utils.validateSchema(objCarga)) {
                
                await gdao.controller.setConnection(objConn);
                objCarga.objConn = objConn;
                
                await gdao.alterar(objCarga, res, next)
                .then(async (result) => {                        

                    var params = { 
                            IDG046:     req.body.IDG046
                        ,   IDG030:     req.body.IDG030
                        ,   IDO009:     req.body.IDO009
                        ,   IDG024:     parseInt(objCarga.vlFields.IDG024)
                        ,   IDS001OF:   parseInt(req.body.IDS001)
                        ,   STOFEREC:   objCarga.vlFields.STCARGA
                        ,   DTOFEREC:   tmz.dataAtualJS()
                    }

                    var objOferece = utils.setSchema(mdl['O005'], params);

                    if (utils.validateSchema(objOferece)) {

                        await gdao.controller.setConnection(objConn);
                        objOferece.objConn = objConn;

                        await gdao.inserir(objOferece, res, next)
                        .catch((err) => {
                            arOcorre.push('Erro na inserção dos dados do Oferecimento');
                        });    
                        
                    } else {
                        arOcorre.push('Objeto Oferecimento inválido');
                    }                
                })

                .catch((err) => {                        
                    arOcorre.push('Erro na alteração dos dados da Carga');
                });

            } else {
                arOcorre.push('Objeto Carga inválido');
            }
        })

        .catch((err) => {
            arOcorre.push('Erro na remoção do Oferecimento prévio');
        });


        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) 
            await objConn.close();
        else 
            await objConn.closeRollback();

        return arOcorre;        
    }

    //-----------------------------------------------------------------------\\ 

    api.spot = async function (req, res, next) {

        var arOcorre = await api.roteiriza(req, res, next);

        var cdStatus = (arOcorre.length == 0) ? 200:500;

        res.status(cdStatus).send({ arOcorre });
    }

    //-----------------------------------------------------------------------\\ 

    api.recusa = async function (req, res, next) {

        req.objModel = mdl['O005_RECUSA'];
        req.body.STOFEREC = 'X';

        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }    

    //-----------------------------------------------------------------------\\ 

    api.alteraTPV = async function (req, res, next) {

        req.objModel = mdl['G046_TPV'];

        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }    

    //-----------------------------------------------------------------------\\     

    api.historico = async function (req, res, next) {
        
        await dao.listarHistOferec(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }    

    //-----------------------------------------------------------------------\\

    api.listaTPV = async function (req, res, next) {

        req.body.PSCARGA = utils.currencyToFloat(req.body.PSCARGA);
        
        await dao.listarTPV(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }    

    //-----------------------------------------------------------------------\\    

    api.listaTipoCarga = async function (req, res, next) {
        
        await dao.listarTipoCarga(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });
    }    

    //-----------------------------------------------------------------------\\      

    api.distribuiCargas = async function (req, res, next) {

        var arDist = await api.calculoDistribuicao(req, res, next);

        var ttReg    = arDist.length;
        var ttCommit = 0;
        var arOcorre = [];

        if (ttReg > 0) {

            for (var objCarga of arDist) {                
                arOcorre = await api.roteiriza({ body: objCarga }, res, next);
                if (arOcorre.length > 0) break; else ttCommit++;
            }

        } else {
            arOcorre.push('Nenhuma regra foi encontrada');
        }

        //-=-=-=-=-=-=-=-=-=-=\\   

        var cdStatus = (arOcorre.length == 0) ? 200:500;

        res.status(cdStatus).send({ ttReg, ttCommit, arOcorre });        
    }

    //-----------------------------------------------------------------------\\     

    api.calculoDistribuicao = async function (req, res, next) {

        var arOferece = [];

        // Array resultado busca
        var arBusca = await dao.listarCargasDist(req, res, next);
        
        if (arBusca.length > 0) {

            // Array de distribuição por regra
            var arDist = [];

            // Cargas oferecidas
            var arTotalOferece = await dao.listarTotalOferec(req, res, next);

            // ID das Cargas a serem distrbuídas
            var arIdCargas = [...new Set(arBusca.map(uk => uk.IDG046))];            
            
            arIdCargas.forEach(id => {

                var arFiltroCarga = arBusca.filter((arr) => { return (arr.IDG046 == id); }); 

                if (arFiltroCarga.length > 1) {

                    var arFiltroCliente = arFiltroCarga.filter((arr) => { return (arr.IDG005 == arr.IDCLIENTE); }); 

                    if (arFiltroCliente.length == 0) {

                        var arFiltroCidade = arFiltroCarga.filter((arr) => { return (arr.IDG003 == arr.IDCIDADE); }); 
                        arDist = (arFiltroCidade.length > 0) ? arDist.concat(arFiltroCidade) : arDist.concat(arFiltroCarga);

                    } else {
                        arDist = arDist.concat(arFiltroCliente);
                    }

                } else {
                    arDist = arDist.concat(arFiltroCarga);
                }
            });

            //-=-=-=-=-=-=-=-=-=-=\\
            // Distribuição por regra

            var arRegras = [...new Set(arDist.map(uk => uk.IDO008))];

            for (var regra of arRegras) {

                var ttCargas = 0;

                //Cargas que foram oferecidas na regra
                var arOfereceRegra = arTotalOferece.filter((arr) => {
                    return (arr.IDO008 == regra);
                });    

                for (var a of arOfereceRegra) 
                    ttCargas += a.TTOFEREC;                        

                //Cargas novas por regra
                var arCargasNovas = arDist.filter((arr) => {  return (arr.IDO008 == regra); });                

                //Distribuição de cargas por 3PL na regra
                var arAtende = [];
                var arTransp = [...new Set(arCargasNovas.map(uk => uk.IDG024))];
                
                for (var idTransp of arTransp) {
                    var arCargas = arCargasNovas.filter((arr) => {  return (arr.IDG024 == idTransp); });

                    var arOferec3PL = arOfereceRegra.filter((arr) => { return (arr.IDO009 == arCargas[0].IDO009); });    

                    var qtOferece   = (arOferec3PL.length == 0) ? 0 : arOferec3PL[0].TTOFEREC;

                    var qtNova      = Math.ceil((ttCargas + arCargas.length) * (arCargas[0].PCATENDE * 0.01)) - qtOferece;

                    if (qtNova > 0) {
                        var objAtende   = 
                            {
                                    IDG024:     arCargas[0].IDG024
                                ,   IDO009:     arCargas[0].IDO009
                                ,   PCATENDE:   arCargas[0].PCATENDE
                                ,   QTNOVA:     qtNova
                            };
                        
                        arAtende.push(objAtende);
                    }
                }

                //-=-=-=-=-=-=-=-=-=-=\\            

                var ttSoma = 0;

                for (var carga of arCargas) {

                    if (arAtende.length > 0) {

                        var objOferece = 
                            {
                                    IDG046:     carga.IDG046
                                ,   IDG030:     carga.IDG030
                                ,   IDS001:     parseInt(req.body.IDS001)
                                ,   IDO009:     arAtende[0].IDO009
                                ,   IDG024:     arAtende[0].IDG024
                            };

                        arOferece.push(objOferece);
                        ttSoma++;

                        if (ttSoma == arAtende[0].QTNOVA) {
                            ttSoma = 0;
                            arAtende.shift();
                        }
                    }
                }
            }

        }

        return arOferece;
    }

    //-----------------------------------------------------------------------\\    

    return api;
}