module.exports = function (app, cb) {

    const dirUP     = process.env.FOLDER_UPLOAD;

    const logger    = app.config.logger;

    const tpl       = app.src.modDocSyn.models.MSTemplate;
    const mdlDoc    = app.src.modDocSyn.models.DocSynModel;

    const utilsFMT  = app.src.utils.Formatador;
    const utilsDIR  = app.src.utils.Diretorio;
    const tmz       = app.src.utils.DataAtual;

    const mDoc      = app.src.modDocSyn.controllers.DocSaveController;

    const nxt       = app.src.modDocSyn.dao.NextIdDAO;
    const dao       = app.src.modDocSyn.dao.MSDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.newMS = async function (req, res, next) {

        try {
            
            var objResult = await api.formatMSData(req, res, next);
            var cdStatus  = (objResult.ttDoc == objResult.ttDone) ? 200 : 400;

            if (req.headers)
                res.status(cdStatus).send(objResult);

            return;

        } catch (err) {

            if (req.headers)
                res.status(500).send({ erro: err.message });

            return;

        }

    }

    //-----------------------------------------------------------------------\\

    api.trackingMS = async function (req, res, next) {

        try {

            var objResult = await api.roadMS(req, res, next);
            var cdStatus  = (objResult.ttDoc == objResult.ttDone) ? 200 : 400;

            if (req.headers)
                res.status(cdStatus).send(objResult);

            return;

        } catch (err) {

            if (req.headers)
                res.status(500).send({ erro: err.message });

            return;

        }

    }

    //-----------------------------------------------------------------------\\

    api.roadMS = async function (req, res, next) {
    
        try {

            var parm = {};
            var rs = await dao.getTrackingData(parm, res, next);

            var ttDoc  = rs.length;
            var ttDone = 0;

            for (var objMS of rs) {

                parm.IDG051 = objMS.IDG051;

                if (objMS.STINTCLI == 1) { 

                    objMS.STPROPOS = 'A';
                    ([3,4].includes(parseInt(objMS.TPDELIVE))) ? objMS.MSTYPE = 'ERO' : objMS.MSTYPE = 'EAD';
                    objMS.DTALTEVE = objMS.DTULTEAD;
                    delete objMS.IDI007;

                } else {

                    objMS.STPROPOS = (objMS.TTMSENT == 0) ? 'C' : 'A';
                    ([3,4].includes(parseInt(objMS.TPDELIVE))) ? objMS.MSTYPE = 'RRO' : objMS.MSTYPE = 'AAD';
                    objMS.DTALTEVE = objMS.DTAAD;
                    
                    if ((objMS.AAD.getTime() < objMS.PRIEAD.getTime()) &&
                        ((objMS.IDI007 == null) || (objMS.MSTYPE == 'RRO'))) {
                        
                        objMS.IDI007 = 164; //50505054

                    } else if ((objMS.AAD.getTime() == objMS.PRIEAD.getTime()) && (objMS.MSTYPE == 'RRO')) {

                        delete objMS.IDI007;

                    }

                }

                parm.STINTCLI = objMS.STINTCLI + 1;
                parm.arDados  = [objMS];

                parm.objConn  = await nxt.controller.getConnection();

                await nxt.controller.setConnection(parm.objConn);
                await dao.updStatusCTE(parm, res, next);

                var objResult = await this.insereMS(parm, res, next);
                ttDone += objResult.arID.length;

                await parm.objConn.close();                
            }
                
            return { ttDoc, ttDone };
    
        } catch (err) {

            throw err;

        }
    }

    //-----------------------------------------------------------------------\\

    api.ASNMilestones = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn, arDados: [] };

            switch (req.cdInt) {
    
                case 0: //PRE-ASN
                    parm.arDados = await this.enviaMSPreASN(req, res, next);
                    break;
    
                case 1:  //ASN
                case 12: //ASN L.R. DEVOLUCAO
                    parm.arDados = await this.enviaMSColeta(req, res, next);
                    break;
    
                case 8: //ASN L.R. RECUSA
                case 13: //ASN L.R DEVOLUCAO (GHOST SHIPMENT)
                    parm.arDados = this.enviaMSRecusa(req, res, next);
                    break;
    
                case 10: //PRE-ASN L.R. DEVOLUCAO
                    parm.arDados = this.enviaMSContato(req, res, next);
                    break;
    
                case 11: //PRE-ASN L.R. DEVOLUCAO - AGENDAMENTO
                    parm.arDados = this.enviaMSContato(req, res, next);
                    break;

                case 14: //ASN - RECUSA NA ORIGEM
                    parm.arDados = this.enviaMSRecusaOrigem(req, res, next);
                    break;
    
            }
            
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
            
            if (parm.arDados.length > 0)
                await this.insereMS(parm, res, next);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.enviaMSRecusaOrigem = function (req, res, next) {

        var arDados = [];

        arDados.push({ MSTYPE: 'AAD', IDG048: req.IDG048, DTALTEVE: req.DTAAD, IDI007: 187 }); //R.C. 53.50.50.50

        return arDados;        

    }

    //-----------------------------------------------------------------------\\

    api.enviaMSRecusa = function (req, res, next) {

        var arDados = [];

        arDados.push({ MSTYPE: 'EPC', IDG048: req.IDG048, DTALTEVE: req.DTAGP });
        arDados.push({ MSTYPE: 'ERO', IDG048: req.IDG048, DTALTEVE: req.DTEAD });
        arDados.push({ MSTYPE: 'RPC', IDG048: req.IDG048, DTALTEVE: req.DTACP }); 
        arDados.push({ MSTYPE: 'RRO', IDG048: req.IDG048, DTALTEVE: req.DTAAD });       

        return arDados;        

    }

    //-----------------------------------------------------------------------\\

    api.enviaMSContato = function (req, res, next) {

        var STPROPOS = (req.cdInt == 10) ? 'C' : 'A';

        var arDados = [];        
        
        arDados.push({ MSTYPE: 'EPC', IDG048: req.IDG048, DTALTEVE: req.DTAGP, STPROPOS }); 
        arDados.push({ MSTYPE: 'ERO', IDG048: req.IDG048, DTALTEVE: req.DTEAD, STPROPOS });

        return arDados;

    }

    //-----------------------------------------------------------------------\\    

    api.enviaMSPreASN = async function (req, res, next) {

        var arDados = [];

        var STPROPOS = (req.DTCOLORI.getTime() == req.DTAGP.getTime()) ? 'C' : 'A';

        arDados.push({ MSTYPE: 'AGP', IDG048: req.IDG048, DTALTEVE: req.DTAGP, STPROPOS });
        arDados.push({ MSTYPE: 'EAD', IDG048: req.IDG048, DTALTEVE: req.DTEAD, STPROPOS });    

        return arDados;
    }

    //-----------------------------------------------------------------------\\ 
    
    api.enviaMSColeta = async function (req, res, next) {

        try {

            var arDados = [];

            var MSTYPE = (req.cdInt == 1) ? 'ACP' : 'RPC';
    
            var objMS = { MSTYPE, IDG048: req.IDG048, DTALTEVE: req.DTACP };
            
            if (req.DTACP.getTime() > req.DTCOLORI.getTime()) {

                objMS.IDI007 = 104; // R.C. 52585053
                
                if (MSTYPE == 'ACP') {

                    await nxt.controller.setConnection(req.objConn);            
                    var rs = await dao.lastRC(req, res, next);    

                    if (rs.length > 0) objMS.IDI007 = rs[0].IDI007;

                }

            }
    
            arDados.push(objMS);
    
            return arDados;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereMS = async function (req, res, next) {

        try {

            var strErro  = null;
            var arID     = [];
            var arDados  = (Array.isArray(req.arDados)) ? req.arDados : [];        
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            for (var objDados of arDados) {
    
                objDados.objConn = req.objConn;
                var objValida = await this.setMSData(objDados, res, next);
    
                if (objValida.blOK) {
    
                    arID.push(objValida.id);                    
    
                } else {
    
                    strErro = objValida.strErro;
                    logger.error(`Erro ao inserir Milestone ${objDados.MSTYPE} (${objDados.STPROPOS}) - IDG048 #${objDados.IDG048} - ${strErro}`);
                    break;
    
                }
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
            
            return { arID, strErro };
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.setMSData = async function (req, res, next) {

        try {

            req.IDI001   = this.getIdMSType(req.MSTYPE);
            req.DTEVENTO = tmz.dataAtualJS();
    
            if (!req.hasOwnProperty('STPROPOS')) req.STPROPOS = 'C'; //CREATE
            req.DTALTEVE = (req.hasOwnProperty('DTALTEVE')) ? tmz.validaData(req.DTALTEVE) : req.DTEVENTO;
    
            var objDados  = utilsFMT.setSchema(mdlDoc.I013, req);
            var objValida = utilsFMT.validaEsquema(objDados.vlFields, mdlDoc.I013.columns);
    
            if (objValida.blOK) {            
    
                objDados.objConn = req.objConn;
                await nxt.controller.setConnection(objDados.objConn);
                var objResult = await dao.inserir(objDados, res, next);
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                var parm = {};
                parm.objConn  = objDados.objConn;
                parm.IDG048   = objDados.vlFields.IDG048;
                parm.IDI001   = objDados.vlFields.IDI001;
                parm.DTEVENTO = tmz.formataData(objDados.vlFields.DTEVENTO, 'YYYY-MM-DD HH:mm:ss');
    
                await nxt.controller.setConnection(parm.objConn);
                await nxt.insereEventoEtapa(parm, res, next);
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                objValida.id = objResult.id;
    
            }
    
            return objValida;

        } catch (err) {

            throw err;            

        }

    }

    //-----------------------------------------------------------------------\\

    api.formatMSData = async function (req, res, next) {
    
        try {

            var strErro = '';
            var ttDoc   = 0;
            var ttDone  = 0;
    
            req.objConn = await nxt.controller.getConnection();
            
            await nxt.controller.setConnection(req.objConn);
            
            var rs = await dao.getMSData(req, res, next);
    
            while (rs.length > 0) {
    
                var objDados = {};
    
                await nxt.controller.setConnection(req.objConn);        
                objDados.IDMSG    = await nxt.getMessageID(req, res, next);

                objDados.MSTYPE   = this.getMSType(rs[0].IDMSTYPE);
                objDados.IDCARGA  = rs[0].IDCARGA;
                objDados.NRETAPA  = rs[0].NRETAPA;
                objDados.CITYNAME = rs[0].CITYNAME;
                objDados.MSPURPOS = rs[0].MSPURPOS;
                objDados.MSDATE   = rs[0].MSDATE;
                objDados.DTCREATE = rs[0].DTCREATE;
                objDados.REASCODE = rs[0].REASCODE;
    
                var objResult = this.MSGenerate(objDados, res, next);
                ttDoc++;
    
                if (objResult.blOK) {

                    var parm =
                    {
                        PKS007:     rs[0].IDI013,
                        NMDOCUME:   objResult.filename,
                        buffer:     objResult.buffer,
                        objConn:    req.objConn
                    };
        
                    objValida = await this.saveMSDoc(parm, res, next);
    
                    if (objValida.blOK) {

                        parm.IDI013 = rs[0].IDI013;
                        await nxt.controller.setConnection(req.objConn);
                        await dao.updStatusMS(parm, res, next);
    
                        ttDone++;
                    }
    
                } else {
    
                    strErro = objResult.strErro;
    
                }
    
                rs.shift();
    
            }
    
            await req.objConn.close();
            //await req.objConn.closeRollback();
    
            return { ttDoc, ttDone, strErro };

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.saveMSDoc = async function (req, res, next) {

        try {

            req.TPDOCUME = 'MLS';
            req.DSMIMETP = 'application/xml';
            req.IDS001   = 1;
            req.IDS007   = 33; //I013

            return await mDoc.saveDoc(req, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.MSGenerate = function (objDados, res, next) {    

        try {

            var objValida = utilsFMT.checaEsquema(objDados, mdlDoc.MS);

            if (objValida.blOK) {
    
                objDados = this.completeMS(objDados);
    
                var strXML = tpl.getMSXML(objDados);
    
                objValida.filename = objDados.FILENAME;
                objValida.buffer   = strXML;    

                utilsDIR.saveFile(`${dirUP}${objDados.FILENAME}`, strXML);
    
            } else { 
    
                logger.error(`Erro ao gerar Milestone IDI013 #${objDados.IDMSG} - ${objValida.strErro}`);
    
            }
    
            return objValida;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.getMSType = function (idType) {

        var strMSType = '';

        switch (idType) {

            case 16: strMSType = 'AGP'; break;
            case 17: strMSType = 'EAD'; break;
            case 19: strMSType = 'ACP'; break;
            case 21: strMSType = 'AAD'; break;
            case 33: strMSType = 'CCD'; break;
            case 34: strMSType = 'EPC'; break;
            case 35: strMSType = 'ERO'; break;
            case 36: strMSType = 'RPC'; break;
            case 37: strMSType = 'RRO'; break;
        }

        return strMSType;

    }

    //-----------------------------------------------------------------------\\

    api.getIdMSType = function (strMSType) {

        var idMSType = 0;

        switch (strMSType) {

            case 'AGP': idMSType = 16; break;
            case 'EAD': idMSType = 17; break;
            case 'ACP': idMSType = 19; break;
            case 'AAD': idMSType = 21; break;
            case 'CCD': idMSType = 33; break;
            case 'EPC': idMSType = 34; break;
            case 'ERO': idMSType = 35; break;
            case 'RPC': idMSType = 36; break;
            case 'RRO': idMSType = 37; break;
        }

        return idMSType;

    }

    //-----------------------------------------------------------------------\\    

    api.completeMS = function (objDados) {
        
        var strDtFmt = 'YYYY-MM-DD HH:mm:ss';

        objDados.IDSHIP   = utilsFMT.formataShipment({ idCarga: objDados.IDCARGA, nrEtapa: objDados.NRETAPA });
        objDados.DTCREATE = tmz.tempoAtual(strDtFmt).replace(' ', 'T');
      //objDados.DTCREATE = tmz.formataData(objDados.DTCREATE, strDtFmt).replace(' ', 'T');        
        objDados.MSDATE   = tmz.formataData(objDados.MSDATE, strDtFmt).replace(' ', 'T');

        var dtCreate = objDados.DTCREATE.replace(/(\-|\:)/g, '');
        objDados.FILENAME = `BRAVO_SYNGENTA_MS_${objDados.IDMSG}_${dtCreate}.xml`;

        switch (objDados.MSPURPOS) {

            case 'A':
                objDados.PURPOSE = 'REPLACE';
                break;

            case 'R':
                objDados.PURPOSE = 'REMOVE';
                break;

            default:
            //case 'C':
                objDados.PURPOSE = 'CREATE'; 
                break;

        }

        delete objDados.IDCARGA;
        delete objDados.NRETAPA;
        delete objDados.MSPURPOS;

        return objDados;

    }

    //-----------------------------------------------------------------------\\

    api.cancelaEntrega = async function (req, res, next) {

        try {

            var parm = { IDG043: req.params.id };

            parm.objConn = await nxt.controller.getConnection(null, req.UserId);

            await dao.cancelaMSAAD(parm, res, next);
            await dao.cancelaEntregaCarga(parm, res, next);
            await dao.cancelaEntregaDelivery(parm, res, next);

            await parm.objConn.close();

            if (req.body.atendimento) {
                return true;
            } else {
                res.send({ blOK: true });
            }

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\   

    return api;

}