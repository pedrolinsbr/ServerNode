/**
 * @module modDelivery/controllers/InsereDelivery
 * 
 * @requires modDelivery/models/APIModel
 * @requires modGlobal/dao/GenericDAO
 * @requires utils/Formatador
*/
module.exports = function (app, cb) {

    const gdao      = app.src.modGlobal.dao.GenericDAO;
    const cdao      = app.src.modDelivery.dao.ClienteDAO;
    const dao       = app.src.modDelivery.dao.DeliveryDAO;
    const nxt       = app.src.modDocSyn.dao.NextIdDAO;

    const mdl       = app.src.modDelivery.models.APIModel;
    const utilsFMT  = app.src.utils.Formatador;
    const utilsCA   = app.src.utils.ConversorArquivos;
    const tmz       = app.src.utils.DataAtual;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.buscaDados = async function (objDados, res, next) {

        objDados.IDG005RE = await this.buscaRemetente(objDados, res, next).catch((err) => { throw err });

        if (objDados.IDG005RE) { 

            objDados.IDG005DE = await this.buscaDestinatario(objDados, res, next).catch((err) => { throw err });

            if (objDados.IDG005DE) {

                objDados.IDG005TO = await this.buscaTomador(objDados, res, next).catch((err) => { throw err });

                if (objDados.IDG005TO) {

                    for (var item of objDados.item) {
                        
                        item.objConn  = objDados.objConn;
                        item.IDG014   = objDados.IDG014;
                        item.IDG010   = await this.buscaProduto(item, res, next).catch((err) => { 
                            throw err });
                        
                        if (item.IDG010) {

                            item.IDG009PS = await this.buscaPeso(item, res, next).catch((err) => { 
                                throw err });

                            if (item.IDG009PS) { 
                                objDados.IDG009PS = item.IDG009PS;
                                item.IDG009UM = await this.buscaMedida(item, res, next).catch((err) => { 
                                    throw err });
                            }

                        }

                        delete item.objConn;
                        delete item.IDG005RE;
                        delete item.DSUNIPES;
                        delete item.DSUNIDAD;
                        delete item.DSREFFAB;
                        //delete item.DSPRODUT;                        
                        //delete item.PSBRUTO;

                    }

                }

            }
        
        }

        return objDados;

    }

    //-----------------------------------------------------------------------\\

    api.buscaPeso = async function (req, res, next) {
     
        var parm = { objConn: req.objConn, cdPesq: req.DSUNIPES };

        await gdao.controller.setConnection(parm.objConn);
        var rs = await dao.buscarUnidade(parm, res, next).catch((err) => { throw err });

        var id = (rs.length == 0) ? null : rs[0].ID;

        return id;

    }

    //-----------------------------------------------------------------------\\

    api.buscaMedida = async function (req, res, next) {
     
        var parm = { objConn: req.objConn, cdPesq: req.DSUNIDAD };

        await gdao.controller.setConnection(parm.objConn);
        var rs = await dao.buscarUnidade(parm, res, next).catch((err) => { throw err });

        var id = (rs.length == 0) ? null : rs[0].ID;

        return id;

    }

    //-----------------------------------------------------------------------\\    

    api.buscaProduto = async function (req, res, next) {

        var parm = { objConn: req.objConn, DSREFFAB: req.DSREFFAB, IDG014: req.IDG014 };

        await gdao.controller.setConnection(parm.objConn);
        var rs = await dao.buscarProduto(parm, res, next).catch((err) => { throw err });

        var id = (rs.length == 0) ? null : rs[0].ID;

        return id;
    }

    //-----------------------------------------------------------------------\\

    api.buscaRemetente = async function (req, res, next) {

        var parm = { objConn: req.objConn, CJCLIENT: req.CJREMETE, IECLIENT: req.IEREMETE, CDMUNICI: req.CIREMETE, CPENDERE: req.CPREMETE  };
        return await this.buscaCliente(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.buscaDestinatario = async function (req, res, next) {

        var parm = { objConn: req.objConn, CJCLIENT: req.CJDESTIN, IECLIENT: req.IEDESTIN, CDMUNICI: req.CIDESTIN, CPENDERE: req.CPENDERE };
        return await this.buscaCliente(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\    

    api.buscaTomador = async function (req, res, next) {

        var parm = { objConn: req.objConn, CJCLIENT: req.CJPAGADO, IECLIENT: req.IEPAGADO };
        return await this.buscaCliente(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\    

    api.buscaCliente = async function (req, res, next) {

        await gdao.controller.setConnection(req.objConn);

        var rs = await cdao.buscaCliente(req, res, next).catch((err) => { throw err });
        var id = (rs.length == 0) ? null : rs[0].ID;        

        return id;

    }

    //-----------------------------------------------------------------------\\   
    
    api.preencheCampos = async function (objDados, res, next) {

        var objValida = utilsFMT.checaEsquema(objDados, mdl.AG);

        if (objValida.blOK) 
            objDados = await api.buscaDados(objDados, res, next).catch((err) => { throw err });

        return objDados;
    }

    //-----------------------------------------------------------------------\\   

    api.novaDelivery = async function (objDados, res, next) {

        try {

            var parm = { objConn: objDados.objConn };
            parm.sequence = 'NEXTIDREFUSAL';
    
            var cdDelivery = await nxt.getMessageID(parm, res, next);
            objDados.CDDELIVE = 'D'+ utilsCA.LPad(cdDelivery, '0', 10);

            return objDados;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    api.insereDelivery = async function (req, res, next) {
        
        try {
            
            var objConn  = await gdao.controller.getConnection();
            var objDados = req.body;
                                    
            if (objDados.hasOwnProperty('TPDELIVE')) {

                objDados.objConn = objConn;

                switch (parseInt(objDados.TPDELIVE)) {

                    case 4: //Recusa
                        objDados = await api.novaDelivery(objDados, res, next);
                        break;

                    case 5: //AG
                        objDados = await api.preencheCampos(objDados, res, next);
                        break;

                }

            }            
            
            var objValida = utilsFMT.checaEsquema(objDados, mdl.delivery.columns);    

            if (objValida.blOK) {

                var cdStatus         = 200;
                var objDelivery      = {};

                objDelivery.vlFields = objValida.value;
                objDelivery.table    = mdl.delivery.table;
                objDelivery.key      = mdl.delivery.key;
                objDelivery.objConn  = objConn;

                var objResult = await api.insereDH(objDelivery, res, next);

            } else {

                var cdStatus  = 400;
                var objResult = {};                

            }

            objResult = Object.assign(objResult, objValida);

            res.status(cdStatus).send(objResult);

            await objConn.close();

        } catch (err) {
            await objConn.closeRollback();
            res.status(500).send(err);

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereDH = async function (objDelivery, res, next) {

        var objTmp = Object.assign({}, objDelivery.vlFields);
        
        objTmp.DTDELIVE = tmz.validaData(objTmp.DTDELIVE);
        objTmp.DTENTCON = tmz.validaData(objTmp.DTENTCON);
        objTmp.DTFINCOL = tmz.validaData(objTmp.DTFINCOL);
        objTmp.DTLANCTO = tmz.validaData(objTmp.DTLANCTO);

        if (!objTmp.DTLANCTO) objTmp.DTLANCTO = tmz.dataAtualJS();

        delete objTmp.item;

        var objDados = 
            {
                objConn:  objDelivery.objConn,
                table:    objDelivery.table,
                key:      objDelivery.key,
                vlFields: objTmp,
            };
        
        await gdao.controller.setConnection(objDelivery.objConn);

        await gdao.inserir(objDados, res, next)
        
        .then(async (result) => {            
            objDelivery.vlFields.IDG043 = result.id;            
            await this.insereDI(objDelivery, res, next).catch((err) => { throw (err) });
            await objDelivery.objConn.close(); 
        }) 

        .catch(async (err) => { 
            await objDelivery.objConn.closeRollback();
            throw (err);
        });        

        return { id: objDelivery.vlFields.IDG043 };
    }

    //-----------------------------------------------------------------------\\

    api.insereDI = async function (objDelivery, res, next) {

        var objConn = await gdao.controller.getConnection(objDelivery.objConn);

        var objDados = 
            {
                objConn: objConn,
                table:  'G045',
                key:    ['IDG045'],
            }

        for (var objItem of objDelivery.vlFields.item) {

            await gdao.controller.setConnection(objConn);
            
            objItem.IDG043    = objDelivery.vlFields.IDG043;
            objDados.vlFields = Object.assign({}, objItem);

            delete objDados.vlFields.lote;

            await gdao.inserir(objDados, res, next).catch((err) => { throw (err) })

            .then(async (result) => { 
                objItem.objConn = objConn;
                objItem.IDG045 = result.id;
                await this.insereDL(objItem, res, next).catch((err) => { throw (err) });
            });
        }

    }

    //-----------------------------------------------------------------------\\

    api.insereDL = async function (objDI, res, next) {

        var objConn = await gdao.controller.getConnection(objDI.objConn);

        var objDados = 
            {
                objConn: objConn,
                table:  'G050',
                key:    ['IDG050'],
            }

        for (var objLote of objDI.lote) {
            
            await gdao.controller.setConnection(objConn);

            objLote.IDG045    = objDI.IDG045;
            objDados.vlFields = Object.assign({}, objLote);

            await gdao.inserir(objDados, res, next).catch((err) => { throw (err) });
            
        }

    }

    //-----------------------------------------------------------------------\\    

    return api;

}
