module.exports = function (app, cb) {

    var api = {};

    const tmz   = app.src.utils.DataAtual;    
    const utils = app.src.utils.Formatador;    
    const mdl   = app.src.modOferece.models.AceiteModel;
    const dao   = app.src.modOferece.dao.AceiteDAO;
    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const ctl   = app.src.modGlobal.controllers.GenericController;

    //-----------------------------------------------------------------------\\

    api.lista = async function (req, res, next) {

        await dao.listar(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\

    api.lista3PL = async function (req, res, next) {

        req.objModel = mdl['G024'];

        await ctl.lista(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        });    
    }

    //-----------------------------------------------------------------------\\

    api.listaTomador = async function (req, res, next) {

        //IDG046 = {IDG046: req.params.id};

        await dao.listarTomador(req, res, next) 
        .then(async (result) => {

            //Carga 3PL
            if(result.length == 0){

                await dao.listarTomador3PL(req, res, next) 
                .then((result2) => {
                    res.status(200).send(result2);
                })
                .catch((err) => {
                    next(err);
                })  

            } else { // Carga 4PL
                res.status(200).send(result);
            }

        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\

    api.listaTomadorDescarga = async function (req, res, next) {

        await dao.listarTomadorDescarga(req, res, next) 
        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        })        
    }

    //-----------------------------------------------------------------------\\

    api.listaAgenda = async function (req, res, next) {

        try {

            var arRS = await dao.listarAgenda(req, res, next);

            if (arRS.data.length > 0) {

                for (var a of arRS.data) {

                    var arIdTomado = a.IDTOMADO.split(',');
                    var arNmTomado = a.NMTOMADO.split(',');                
                    a.arTomador    = [];

                    //formar objetos para o front dinâmico - Everton
                    a.IDG028 = { id: a.IDG028, text: a.NMARMAZE };
                    a.IDG030 = { id: a.IDG030, text: a.DSTIPVEI };
                    a.IDG024 = { id: a.IDG024, text: a.NMTRANSP };
                    a.IDH002 = { id: a.TPCARGA, text: a.DSTIPCAR };

                    for (var i in arIdTomado) {

                        var objTomado = { id: arIdTomado[i], text: arNmTomado[i] };
                        a.arTomador.push(objTomado);

                    }

                }

            }

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\    

    api.alteraDataEntrega = async function (req, res, next) {        

        req.objModel = mdl['G048'];

        if (req.body.DTPREATU !== undefined)
            req.body.DTPREATU = tmz.retornaData(req.body.DTPREATU, 'DD/MM/YYYY');

        await ctl.altera(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.listaID = async function (req, res, next) {
        
        var rs = await dao.listarID(req, res, next);

        var id = (rs.length > 0) ? rs[0].IDO005 : null;

        res.status(200).send({ id });                
    }

    //-----------------------------------------------------------------------\\

    api.altera = async function (req, res ,next) {

        var arOcorre = [];        
        var arDados  = req.body;
        var ttCommit = 0;
        var ttReg    = (Array.isArray(arDados)) ? arDados.length : 0;

        var objConn  = await gdao.controller.getConnection();

        if (ttReg > 0) {

            for (var objDados of arDados) {

                var objAceite = utils.setSchema(mdl['O005'], objDados);                
                objAceite.vlFields.DTRESOFE = tmz.dataAtualJS();

                if (utils.validateSchema(objAceite)) { 
                    
                    await gdao.controller.setConnection(objConn);
                    objAceite.objConn = objConn;

                    await gdao.alterar(objAceite, res, next)
                    .then(async (result) => {

                        var objCarga = utils.setSchema(mdl['G046'], objDados);
                        //objCarga.vlFields.IDS001 = objAceite.vlFields.IDS001RE;
                        objCarga.vlFields.STCARGA = objAceite.vlFields.STOFEREC;
    
                        if (utils.validateSchema(objCarga)) { 
                                                        
                            await gdao.controller.setConnection(objConn);
                            objCarga.objConn = objConn;

                            await gdao.alterar(objCarga, res, next)
                            .then((result) => {
                                ttCommit += result.nrRows;
                            })

                            .catch((err) => {
                                arOcorre.push('Erro na alteração do Carga');
                            });
    
                        } else {
                            arOcorre.push('Objeto Carga inválido');
                        }    

                    })

                    .catch((err) => {
                        arOcorre.push('Erro na alteração do Oferecimento');
                    });                    
    
                } else {
                    arOcorre.push('Objeto Aceite inválido');
                    break;
                }    
            }            

        } else {
            arOcorre.push('Array inválido');
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if ((arOcorre.length == 0) && (ttCommit == ttReg)) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ arOcorre, ttCommit, ttReg });

    }

    //-----------------------------------------------------------------------\\    

    return api;
}
