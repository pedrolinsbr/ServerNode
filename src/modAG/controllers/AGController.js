module.exports = function (app, cb) {

    const axios       = require('axios');
    const moment      = require('moment');
    const logger      = app.config.logger;
    const dao         = app.src.modAG.dao.AGDAO;
    const cdao        = app.src.modDelivery.dao.ClienteDAO;
    const ddao 	      = app.src.modDelivery.dao.DeliveryDAO;
    const utilFMT     = app.src.utils.Formatador;
    const mdl         = app.src.modAG.models.AGModel;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.listaVendaAG = async function (req, res, next) {

        try {

            var objResult = await api.montaObjCarga(req, res , next);

            res.status(200).send(objResult);

        } catch (err) {

            res.status(500).send(err);

        }

    }

    //-----------------------------------------------------------------------\\

    api.postAGList = async function (req, res, next) {

        try {
            res.setTimeout(1800000)
            var cdStatus  = 400;
            var objCarga  = await api.montaObjCarga(req, res, next);
            var result    = null;

            logger.info('Buscando registros de Retorno de AG');

            if (objCarga.Carga.length > 0) {

                var optPost = 
                    {
                        method: 'post',
                        url: process.env.WEBAGIL_URL_CARGA,
                        data: objCarga
                    }

                var objResult = await axios(optPost);

                if (objResult.data.operationSuccess) {
                    logger.info('Iniciando...');
                    for (var i = 0; i<objResult.data.data.length; i++) {
                        req.delivery = objResult.data.data[i];
                        result = await dao.marcarVendaAG(req, res, next).catch((err) => { throw err });
                    }

                    cdStatus = 200;  
                    logger.info(`${objCarga.Carga.length} registros de Retorno de AG foram postados com sucesso`);

                } else {

                    logger.error('Erro ao postar informações de Retorno de AG');

                }

            } else {

                logger.info('Nenhum registro de Retorno de AG foi encontrado');
                var objResult = { data: objCarga };

            }

            if (req.headers)
                res.status(cdStatus).send(objResult.data);  
            
            return objCarga;            
            

        } catch (err) {

            if (req.headers)
                res.status(500).send(err);
            
            return;
            
        }

    }

    //-----------------------------------------------------------------------\\    

    api.montaObjCarga = async function (req, res, next) {

        var objResult = {};
        var arCarga   = [];

        var rs = await dao.buscaVendaAG(req, res, next).catch((err) => { throw err });

        while (rs.length > 0) {

            var objCarga = {};
            var ttFrete  = 0;
            var idCTe    = 0;

            objCarga.DtAgp    = rs[0].DTAGP;
            objCarga.DtAcp    = rs[0].DTACP;

            objCarga.NmTransp = rs[0].NMTRANSP;
            objCarga.RsTransp = rs[0].RSTRANSP;
            objCarga.TpPessoa = rs[0].TPPESSOA;
            objCarga.CjTransp = rs[0].CJTRANSP
            objCarga.IeTransp = rs[0].IETRANSP
            objCarga.DsEndere = rs[0].DSENDERE;
            objCarga.NrEndere = rs[0].NRENDERE;
            objCarga.DsComend = rs[0].DSCOMEND;
            objCarga.BiEndere = rs[0].BIENDERE;
            objCarga.CpEndere = rs[0].CPENDERE;

            objCarga.NmContat = rs[0].NMCONTAT;
            objCarga.EmTransp = rs[0].EMTRANSP;
            objCarga.TlTransp = rs[0].TLTRANSP;

            objCarga.CdMunici = rs[0].CDMUNICI;

            objCarga.CdRota   = rs[0].IDG046;
            objCarga.StCarga  = rs[0].STCARGA;
            objCarga.DtRoteir = rs[0].DTCARGA;
            objCarga.TpVeicul = rs[0].DSTIPVEI;
            objCarga.TpCarga  = rs[0].SNCARPAR;
            objCarga.KmTotal  = rs[0].QTDISTOT;
            objCarga.Shipment = utilFMT.formataShipment({idCarga: rs[0].IDG046});

            var arEtapa    = [];

            while ((rs.length > 0) && (objCarga.CdRota == rs[0].IDG046)) {

                var arDelivery = [];
                var objEtapa   = {};
                var idEtapa    = rs[0].IDG048; 
                var frete      = null;               

                objEtapa.KmParada = rs[0].QTDISETA;
                objEtapa.SeqParad = rs[0].NRSEQETA;
                objEtapa.DtEad    = rs[0].DTEAD;

                while ((rs.length > 0) && (idEtapa == rs[0].IDG048)) {

                    frete = rs[0].VRTOTFRE != null ? parseFloat(rs[0].VRTOTFRE.toFixed(2)) : null;

                    var objDelivery = { CdDelivery: rs[0].CDDELIVE, DtAad: rs[0].DTAAD, VlFrete: frete, StEtapa: rs[0].STETAPA, CdRastre: rs[0].CDRASTRE};

                    arDelivery.push(objDelivery);

                    if ((rs[0].IDG051) && (rs[0].IDG051 != idCTe)) { 

                        idCTe = rs[0].IDG051;
                        ttFrete = parseFloat(ttFrete.toFixed(2)) + parseFloat(rs[0].VRTOTFRE.toFixed(2));

                    }
                    
                    rs.shift();

                }

                objEtapa.Delivery = arDelivery;
                arEtapa.push(objEtapa);

            }

            // if (ttFrete) {
            //     ttFrete = parseFloat(ttFrete.toFixed(2));
            // }
            objCarga.Vlfrete = ttFrete;
            objCarga.Parada  = arEtapa;

            arCarga.push(objCarga);

        }

        objResult.Carga = arCarga;

        return objResult;

    }

    //-----------------------------------------------------------------------\\

    api.cancelaDeliveryAG = async function (req, res, next) {

        try {

            var strErro  = null;            
            var cdStatus = 400;
            var blOK     = false;
            var parm     = {};

            var objVal   = utilFMT.validaEsquema(req.body, mdl.cancelaDelivery.columns);

            if (objVal.blOK) {

                parm.objConn = await dao.controller.getConnection();
                
                for (var objDelivery of req.body.delivery) {

                    parm.CDDELIVE = objDelivery.CDDELIVE;

                    var rs = await dao.consultaDelivery(parm, res, next);

                    if (rs.length == 1) {

                        parm.IDG043 = rs[0].IDG043;
    
                        if ((Array.isArray(req.body.NRORDITE)) && (req.body.NRORDITE.length > 0)) {
    
                            parm.NRORDITE = req.body.NRORDITE;
                            await dao.cancelaItemDelivery(parm, res, next);
    
                        } else {
    
                            await dao.cancelaDelivery(parm, res, next);
    
                        }
    
                    } else {
    
                        strErro = `Delivery ${parm.CDDELIVE} não disponível para cancelamento`;
                    }

                    if (strErro != null) break;

                }

                if (strErro == null) {

                    var cdStatus = 200;
                    var blOK = true;
                    await parm.objConn.close();
    
                 } else { 
    
                    await parm.objConn.closeRollback();
    
                 }                 

            } else {

                strErro = objVal.strErro;

            }

            res.status(cdStatus).send({ blOK, strErro });

        } catch (err) {

            res.status(500).send(err);

        }

    }

    //-----------------------------------------------------------------------\\


    
    //-----------------------------------------------------------------------\\ 
    /**
    * @description Calcula o dia da entrega contratada 
    *
    * @function calcularSLAWebAgil
    * 
    * @param  {Object} objDados     Contém dados da delivery
    * @param  {Number} IDG003RE     Cidade do Remetente
    * @param  {Number} IDG003DE     Cidade do Destinatário
    * @param  {Number} IDG014       ID da Operação
    * 
    * @throws {Object} Objeto contendo os detalhes do erro
    * 
    * @returns {Object} Retorna o objeto Delivery preenchido
    * 
    * @author Brenda Cássia Silva de Oliveira
    * @since 18/01/2019
    */
    //-----------------------------------------------------------------------\\       
    
    api.calcularSLA = async function (req, res, next) {

        try {

            logger.debug('Calculando data de entrega contratada');

            var objDados    = req.body;

            var rem           = { CJCLIENT: objDados.CJREMETE, IECLIENT: objDados.IEREMETE, CDMUNICI: objDados.CIREMETE, CPENDERE: objDados.CPREMETE };
            var remR          = await cdao.buscaCliente(rem, res, next).catch((err) => { throw err });
            objDados.IDG003RE = (remR.length == 0) ? null : remR[0].IDCIDADE;   
            objDados.IDG005RE = (remR.length == 0) ? null : remR[0].ID;  

            var des           = { CJCLIENT: objDados.CJDESTIN, IECLIENT: objDados.IEDESTIN, CDMUNICI: objDados.CIDESTIN, CPENDERE: objDados.CPENDERE };
            var desR          = await cdao.buscaCliente(des, res, next).catch((err) => { throw err });
            objDados.IDG003DE = (desR.length == 0) ? null : desR[0].IDCIDADE; 
            objDados.IDG005DE = (desR.length == 0) ? null : desR[0].ID;   

            //Valida se o rementente e o destinatário foram encontrados
            if(remR.length > 0 && desR.length > 0){

                var parm = {              
                                cdOperacao: objDados.IDG014,
                                idOrigem:   objDados.IDG003RE,
                                idDestino:  objDados.IDG003DE,
                                clOrigem:   objDados.IDG005RE,
                                clDestino:  objDados.IDG005DE
                            };

                parm.tpTransp = 'V'; //Retorno de AG
        
                var rs = await ddao.buscarDiasSLA(parm, res, next);
        
                if (rs != undefined && rs !=null) {
        
                    objDados.DTENTCON = moment(rs, 'DD/MM/YYYY').format('DD/MM/YYYY');
        
                }
            }

            res.status(200).send(objDados);  

        } catch (err) {

            throw err;

        }

    }

    return api;
}