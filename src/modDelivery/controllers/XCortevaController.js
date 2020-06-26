module.exports = function (app, cb) {

    var api = {};
    
    const logger    = app.config.logger;

    const utilsFMT  = app.src.utils.Formatador;
    const tmz       = app.src.utils.DataAtual;    
    
    const gdao      = app.src.modGlobal.dao.GenericDAO;

    const mdl       = app.src.modDelivery.models.APIModel;
    const cdao      = app.src.modDelivery.dao.ClienteDAO;
    const dao       = app.src.modDelivery.dao.DeliveryDAO;
    const ctvXLS    = app.src.modDelivery.controllers.CortevaXLSController;

    //-----------------------------------------------------------------------\\

    api.importaXLS = async function (req, res, next) {

        try { 
        
            logger.info('Importando arquivo XLS');

            var arRead = ctvXLS.readXLS(req, res, next);
            var ttReg  = arRead.length;
            var ttDone = 0;            

            var objConn = await gdao.controller.getConnection();

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            for (var objRead of arRead) {

                var blOK = false;

                if (objRead.stLibera == 'Open') {

                    objRead.SNLIBROT = 0;
                    objRead.STETAPA  = 15;

                } else {

                    objRead.SNLIBROT = 1;
                    objRead.STETAPA  = 0;

                }

                objRead.STULTETA = objRead.STETAPA;

                var objDelivery = Object.assign(objRead, api.getObjInit(objConn));

                objDelivery = await api.buscaDados(objDelivery, res, next);

                if (objDelivery.arOcorrencia.length == 0) {

                    var objVal = utilsFMT.checaEsquema(objDelivery, mdl.delivery.columns);
                    blOK = objVal.blOK;

                    if (blOK) 
                        await api.salvaDelivery(objDelivery, res, next);                        
                    else
                        objDelivery.arOcorrencia.push(2, 'CHECAGEM', objVal.strErro);

                }                 

                if (objDelivery.arOcorrencia.length == 0)
                    ttDone++;
                else                    
                    await api.insereOcorrencias(objDelivery, res, next);


                await objConn.close();

                break;
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var cdStatus = (ttReg == ttDone) ? 200 : 400;

            //await objConn.close();

            res.status(cdStatus).send({ ttReg, ttDone });

        } catch (err) {

            res.status(500).send(err);

        }

    }

    //-----------------------------------------------------------------------\\

    api.getObjInit = function (objConn) {

        var objInit = {};
            
        objInit.arOcorrencia = [];
        objInit.objConn = objConn;
                    
        objInit.IDS001   = 97;   // Sistema
        objInit.IDG014   = 81;   // A CONFIRMAR
        objInit.IDG005RE = 1076; // A CONFIRMAR            
        objInit.TPDELIVE = '2';  // Distribuição

        objInit.NREMBSEC = 0;    // Embalagens secundárias
        objInit.CDPRIORI = 5;    // Prioridade
        objInit.SNINDSEG = 'N';  // Produto Segregado
        objInit.STDELIVE = 'C';  // C = Create

        return objInit;

    }

    //-----------------------------------------------------------------------\\

    api.salvaDelivery = async function (objDelivery, res, next) {

        try {

            await gdao.controller.setConnection(objDelivery.objConn);
            var rs = await dao.buscarDelivery(objDelivery, res, next);

            if (rs.length == 0)  {

                objDelivery.DTLANCTO = tmz.dataAtualJS();    
                objDelivery.DTDELIVE = objDelivery.DTLANCTO;
                objDelivery.DTENTCON = objDelivery.DTLANCTO;
                objDelivery.DTFINCOL = objDelivery.DTLANCTO;

                var blOK = true;

            } else {

                objDelivery.IDG043   = rs[0].ID;
                objDelivery.STULTETA = rs[0].STETAPA;
                delete objDelivery.DTDELIVE;

                var blOK = [0,15].includes(rs[0].STETAPA);

            }

            if (blOK) 
                await this.salvaDH(objDelivery, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.salvaDH = async function (objDelivery, res, next) {

        try {

            var objDH = Object.assign({}, objDelivery);
            delete objDH.item;        
    
            var objDados = utilsFMT.setSchema(mdl.delivery, objDH);
    
            objDados.objConn = objDelivery.objConn;
            await gdao.controller.setConnection(objDados.objConn);
    
            if (objDelivery.hasOwnProperty('IDG043')) {

                var strAcao = 'alterado';
                var objResult = await gdao.alterar(objDados, res, next);

                await gdao.controller.setConnection(objDelivery.objConn);
                await dao.removeLotes(objDelivery, res, next);

                await gdao.controller.setConnection(objDelivery.objConn);
                await dao.removeItens(objDelivery, res, next);

            } else {

                var strAcao = 'inserido';
                var objResult = await gdao.inserir(objDados, res, next);
                objDelivery.IDG043 = objResult.id;    

            }
             
            logger.info(`Delivery ${objDelivery.CDDELIVE} - Header ${strAcao} - #${objDelivery.IDG043}`);
    
            await this.insereDI(objDelivery, res, next);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereDI = async function (objDelivery, res, next) {
        
        try {

            var objVal = utilsFMT.checaEsquema(objDelivery, mdl.delivery.columns);
            var arItem = objVal.value.item;
    
            for (var objItem of arItem) {
                
                objItem.IDG043 = objDelivery.IDG043;
                
                var objIns = { table: 'G045', key: ['IDG045'], objConn: objDelivery.objConn };
                objIns.vlFields = Object.assign({}, objItem);
                delete objIns.vlFields.lote;            
                
                await gdao.controller.setConnection(objIns.objConn);
                
                var objResult = await gdao.inserir(objIns, res, next);

                objItem.CDDELIVE = objDelivery.CDDELIVE;
                objItem.IDG045   = objResult.id;
                objItem.objConn  = objIns.objConn;
    
                logger.info(`Delivery ${objDelivery.CDDELIVE} - Item inserido - #${objItem.IDG045}`);
    
                await this.insereDL(objItem, res, next);
    
            }
    

        } catch (err) {

            throw err;

        }
    
    }

    //-----------------------------------------------------------------------\\

    api.insereDL = async function (objItem, res, next) {

        try {

            for (var objLote of objItem.lote) {
                
                objLote.IDG045 = objItem.IDG045;
                
                var objIns = { table: 'G050', key: ['IDG050'], objConn: objItem.objConn };
                objIns.vlFields = Object.assign({}, objLote);
                
                await gdao.controller.setConnection(objIns.objConn);
                
                var objResult  = await gdao.inserir(objIns, res, next);
                objLote.IDG050 = objResult.id;
    
                logger.info(`Delivery ${objItem.CDDELIVE} - Lote inserido - #${objLote.IDG050}`);
    
            }

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscaDados = async function (objDelivery, res, next) {

        try {

            objDelivery.CPENDERE = objDelivery.CPENDERE.replace(/(\.|\-)/g, '');

            objDelivery = await this.buscaUnPeso(objDelivery, res, next);
    
            if (objDelivery.arOcorrencia.length == 0) {
    
                objDelivery = await this.buscaDestinatario(objDelivery, res, next);

                if (objDelivery.arOcorrencia.length == 0) 
                    objDelivery = await this.buscaDadosItem(objDelivery, res, next);
    
            }
    
            return objDelivery;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscaDestinatario = async function (objPesq, res, next) {

        try {

            var nmCampo = 'IDG005DE';
    
            await gdao.controller.setConnection(objPesq.objConn);
            var rs = await cdao.buscaCliente(objPesq, res, next);            

            switch (rs.length) {

                case 0:
                    objPesq = await this.insereCliente(objPesq, res, next);
                    break

                case 1:
                    objPesq[nmCampo] = rs[0].ID;
                    break;

                default:
                    var strMsg = `${rs.length} ocorrências encontradas com o CNPJ ${objPesq.CJCLIENT}`;
                    objPesq.arOcorrencia.push(utilsFMT.gerarOcorrencia(3, nmCampo, strMsg));
                    break;

            }

            return objPesq;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereCliente = async function (objPesq, res, next) {

        try {

            objPesq = await this.buscaCidade(objPesq, res, next);

            if (objPesq.arOcorrencia.length == 0) {

                var nmCampo = 'IDG005DE';
                
                objPesq.TPPESSOA = (objPesq.CJCLIENT > 11) ? 'J':'F';

                objPesq.DSENDERE = 'RUA 1';
                objPesq.NRENDERE = '10';
                objPesq.BIENDERE = 'CENTRO';
                objPesq.DSCOMEND = '-';                            

                var objVal = utilsFMT.checaEsquema(objPesq, mdl.cliente.columns);

                if (objVal.blOK) {

                    var objIns = utilsFMT.setSchema(mdl.cliente, objVal.value);
                    
                    objIns.objConn = objCliente.objConn;
                    await gdao.controller.setConnection(objIns.objConn);

                    var objResult = await gdao.inserir(objIns, res, next);
                    objPesq[nmCampo] = objResult.id;

                } else {

                    objPesq.arOcorrencia.push(2, nmCampo, objVal.strErro);

                }

            } else {

                objPesq.arOcorrencia = objPesq.concat(objCliente.arOcorrencia);

            }

            return objPesq;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscaCidade = async function (objPesq, res, next) {

        var nmCampo = 'IDG003';
        var strMsg  = `Cidade: ${objPesq.NMCIDADE} / ${objPesq.CDESTADO}`;

        logger.info(`Buscando ${strMsg}`);

        await gdao.controller.setConnection(objPesq.objConn);
        var rs = await cdao.buscaCidade(objPesq, res, next).catch((err) => { throw err });

        if (rs.length == 0) 
            objPesq.arOcorrencia.push(utilsFMT.gerarOcorrencia(3, nmCampo, strMsg));
        else
            objPesq[nmCampo] = rs[0].IDG003;

        return objPesq;

    }

    //-----------------------------------------------------------------------\\

    api.buscaDadosItem = async function (objPesq, res, next) {

        for (var objItem of objPesq.item) {

            objItem.arOcorrencia = [];
            objItem.objConn  = objPesq.objConn;
            objItem.IDG014   = objPesq.IDG014;
            objItem.IDS001   = objPesq.IDS001;
            objItem.NRORDITE = parseInt(objItem.NRORDITE);
            objItem.IDG010   = 0;

            if (/^\d+$/.test(objItem.DSREFFAB)) objItem.DSREFFAB = String(parseInt(objItem.DSREFFAB));

            objItem = await this.buscaUnPeso(objItem, res, next).catch((err) => { throw err });

            if (objItem.arOcorrencia.length == 0) 
                objItem = await this.buscaUnMedida(objItem, res, next).catch((err) => { throw err });

            delete objItem.sql;

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            if (objItem.arOcorrencia.length > 0) {                    
                objPesq.arOcorrencia = objPesq.arOcorrencia.concat(objItem.arOcorrencia);
                break;
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        }


        return objPesq;

    }

    //-----------------------------------------------------------------------\\

    api.buscaUnMedida = async function (objPesq, res, next) {

        var parm = { objConn: objPesq.objConn, cdPesq: objPesq.UNMEDIDA, nmCampo: 'IDG009UM' };    

        var objRet = await this.buscaUnidade(parm, res, next).catch((err) => { throw err });

        if (objRet.arOcorrencia.length == 0) 
            objPesq[parm.nmCampo] = objRet[parm.nmCampo];
        else
            objPesq.arOcorrencia = objPesq.arOcorrencia.concat(objRet.arOcorrencia);        

        return objPesq;

    }

    //-----------------------------------------------------------------------\\
    
    api.buscaUnPeso = async function (objPesq, res, next) {

        var parm = { objConn: objPesq.objConn, cdPesq: objPesq.UNPESO, nmCampo: 'IDG009PS' };    

        var objRet = await this.buscaUnidade(parm, res, next).catch((err) => { throw err });

        if (objRet.arOcorrencia.length == 0) 
            objPesq[parm.nmCampo] = objRet[parm.nmCampo];
        else
            objPesq.arOcorrencia = objPesq.arOcorrencia.concat(objRet.arOcorrencia);        

        return objPesq;

    }

    //-----------------------------------------------------------------------\\
    
    api.buscaUnidade = async function (parm, res, next) {

        var strMsg = `unidade: ${parm.cdPesq} (${parm.nmCampo})`;
        logger.info(`Buscando ${strMsg}`);

        var objRet = { arOcorrencia: [] };

        await gdao.controller.setConnection(parm.objConn);
        var rs = await dao.buscarUnidade(parm, res, next).catch((err) => { throw err });

        if (rs.length == 0)             
            objRet.arOcorrencia.push(utilsFMT.gerarOcorrencia(3, parm.nmCampo, strMsg));
        else 
            objRet[parm.nmCampo] = rs[0].ID;
        
        return objRet;

    }

    //-----------------------------------------------------------------------\\

    api.removeOcorrencias = async function (objDelivery, res, next) {

        var nmCampo = 'CDDELIVE';

        logger.info(`Removendo ocorrências - Delivery: ${objDelivery[nmCampo]}`);

        var objOcorrencia = utilsFMT.setSchema(mdl.ocorrencia, objDelivery);

        objOcorrencia.objConn        = objDelivery.objConn;
        objOcorrencia.key            = [nmCampo];
        objOcorrencia.vlFields       = { SNDELETE: 1 };
        objOcorrencia.vlKey[nmCampo] = [`'${objDelivery[nmCampo]}'`];
        
        await gdao.controller.setConnection(objOcorrencia.objConn);

        await gdao.alterar(objOcorrencia, res, next).catch((err) => { throw (err) });
    }

    //-----------------------------------------------------------------------\\

    api.insereOcorrencias = async function (objDelivery, res, next) {        

        try {

            await this.removeOcorrencias(objDelivery, res, next);

            logger.info(`Inserindo ocorrências - Delivery: ${objDelivery.CDDELIVE}`);
    
            for (var o of objDelivery.arOcorrencia) {
    
                o.CDDELIVE = objDelivery.CDDELIVE;
                o.DTCADAST = tmz.dataAtualJS();
    
                var objVal = utilsFMT.checaEsquema(o, mdl.ocorrencia.columns);
    
                if (objVal.blOK) {
    
                    var objO = utilsFMT.setSchema(mdl.ocorrencia, o);
                    objO.objConn = objDelivery.objConn;
                    
                    await gdao.controller.setConnection(objO.objConn);
                    await gdao.inserir(objO, res, next);
    
                }
                
            }    

        } catch (err) {

            throw err;

        }


    }

    //-----------------------------------------------------------------------\\

    return api;

}
