module.exports = function (app, cb) {

    const dirUP     = process.env.FOLDER_UPLOAD;

    const logger    = app.config.logger;

    const utilsCA   = app.src.utils.ConversorArquivos;
    const utilsDIR  = app.src.utils.Diretorio;
    const utilsFMT  = app.src.utils.Formatador;
    const tmz       = app.src.utils.DataAtual;

    const mDoc      = app.src.modDocSyn.controllers.DocSaveController;
    const mdlDoc    = app.src.modDocSyn.models.DocSynModel;
    const mdlASN    = app.src.modDocSyn.models.ASNModel;
    const tpl       = app.src.modDocSyn.models.ASNTemplate;

    const nxt       = app.src.modDocSyn.dao.NextIdDAO;
    const dao       = app.src.modDocSyn.dao.ASNDAO;
    
    const ctlMS     = app.src.modDocSyn.controllers.MSController;

    var api = {};    

    //-----------------------------------------------------------------------\\

    api.newASN = async function (req, res, next) {

        try {

            var objResult = await api.formatASNData(req, res, next);
            var cdStatus  = (objResult.ttDoc == objResult.ttDone) ? 200 : 500;

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

    api.formatASNData = async function (req, res, next) {
        
        try {

            var strErro     = null;
            var ttDoc       = 0;
            var ttDone      = 0;
            var arInteracao = [0, 1, 3, 4, 8, 10, 11, 12, 13, 14];
    
            for (var i of arInteracao) {
    
                req.stInteracao = i;
    
                var rs = await dao.getASNData(req, res, next);
    
                while (rs.length > 0) {        
                    
                    var objDados = { item: [] };
    
                    req.objConn = await dao.controller.getConnection();
                    await dao.controller.setConnection(req.objConn);

                    objDados.IDMSG    = await nxt.getMessageID(req, res, next);
    
                    objDados.IDCARGA  = rs[0].IDCARGA;
                    objDados.NRETAPA  = rs[0].NRETAPA;
                    objDados.STINTCLI = rs[0].STINTCLI;
                    objDados.CONTLOAD = rs[0].CONTLOAD;
                    objDados.IDVEICUL = rs[0].IDVEICUL;
                    objDados.DISTANCE = rs[0].DISTANCE;
                    objDados.NRPLACA1 = rs[0].NRPLACA1;
                    objDados.NRPLACA2 = rs[0].NRPLACA2;
                    objDados.NRPLACA3 = rs[0].NRPLACA3;
                    objDados.CDFILIAL = rs[0].CDFILIAL;
                    objDados.IDDESTIN = rs[0].IDDESTIN;
                    objDados.IDTRANSF = rs[0].IDTRANSF;
                    objDados.NMTRANSP = rs[0].NMTRANSP;
                    objDados.WEIGHT   = rs[0].WEIGHT;
                    objDados.VOLUME   = rs[0].VOLUME;
                    objDados.DTINIETA = rs[0].DTINIETA;
                    objDados.DTFINETA = rs[0].DTFINETA;
                    objDados.DTACP    = rs[0].DTACP;
                    objDados.DTAGP    = rs[0].DTAGP;
                    objDados.DTEAD    = rs[0].DTEAD;
                    objDados.DTAAD    = rs[0].DTAAD;
                    objDados.DTCOLORI = rs[0].DTCOLORI;
                    objDados.TPDELIVE = parseInt(rs[0].TPDELIVE);
                    objDados.cdInt    = i;
    
                    if (objDados.WEIGHT)
                        objDados.WEIGHT = parseFloat(objDados.WEIGHT.toFixed(2));

                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                    var idParada = rs[0].IDG048;
    
                    while ((rs.length > 0) && (idParada == rs[0].IDG048)) {
    
                        var objItem = {};
    
                        objItem.LOADORD  = rs[0].LOADORD;
                        objItem.CDDELIVE = rs[0].CDDELIVE;
                        objItem.ITEMORD  = rs[0].ITEMORD;
                        objItem.ITEMQTD  = rs[0].ITEMQTD;
                        objItem.QTUNIT   = rs[0].QTUNIT;
                        objItem.ITEMWGT  = rs[0].ITEMWGT;
                        objItem.WGUNIT   = rs[0].WGUNIT;
                        objItem.IDCASA   = rs[0].IDCASA;
    
                        if (objItem.ITEMWGT) 
                            objItem.ITEMWGT = parseFloat(objItem.ITEMWGT.toFixed(2));

                        objDados.item.push(objItem);
                        rs.shift();
                        
                    }
                    
                    var objResult = this.ASNGenerate(objDados, res, next);
                    ttDoc++;
                    
                    if (objResult.blOK) {
    
                        var parm      = {};
                        parm.objConn  = req.objConn;
                        parm.IDG048   = idParada;
                        parm.IDG046   = objDados.IDCARGA;                    
                        parm.DTACP    = objDados.DTACP;    //Confirmação Coleta
                        parm.DTAGP    = objDados.DTAGP;    //Previsão Coleta
                        parm.DTEAD    = objDados.DTEAD;    //Previsão de Entrega
                        parm.DTAAD    = objDados.DTAAD;    //Confirmação de Entrega
                        parm.DTCOLORI = objDados.DTCOLORI; //Data de Coleta Original
                        parm.STINTCLI = objDados.STINTCLI; //Status de ASN / PRE-ASN
                        parm.cdInt    = i;                 //Loop de Interação
    
                        parm.NMDOCUME = objResult.ASNFILENAME;
                        parm.buffer   = objResult.buffer; 

                        objResult = await this.saveASNDoc(parm, res, next);

                        if (objResult.blOK) {

                            await this.changeASNFlag(parm, res, next);
                            
                            await this.insDeliveryLog(parm, res, next);
        
                            if (parm.STINTCLI < 2) //PRE-ASN e ASN
                                await ctlMS.ASNMilestones(parm, res, next); 

                            ttDone++;

                        }
                        
                    } else {
    
                        strErro = objResult.strErro;
    
                    }
    
                    await req.objConn.close();
                    //await req.objConn.closeRollback();

                }
    
            }
    
            return { ttDoc, ttDone, strErro };    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.insDeliveryLog = async function (req, res, next) {

        try {

            req.DTEVENTO = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');        

            switch (req.cdInt) {
    
                case 0:   //PRE-ASN / PRE-ASN REPLACE
                case 10:  //PRE-ASN L.R. DEVOLUCAO
                    req.IDI001 = 10;
                    break;
    
                case 1:  //ASN
                case 8:  //ASN L.R. RECUSA
                case 12: //ASN L.R. DEVOLUCAO
                case 14: //ASN RECUSA NA ORIGEM
                    req.IDI001 = 14;
                    break;
    
                case 3: //PRE-ASN DELETE
                    req.IDI001 = 24;
                    break;
    
                case 4: //ASN DELETE
                    req.IDI001 = 25;
                    break;
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            if (req.IDI001) {
    
                await dao.controller.setConnection(req.objConn);
                await nxt.insereEventoEtapa(req, res, next);
    
            }            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.ASNGenerate = function (objDados, res, next) {    
        
        try {

            var objValida = utilsFMT.checaEsquema(objDados, mdlDoc.ASN);        

            if (objValida.blOK) {
    
                var objASN = this.completeASN(objDados, res, next);
                var strXML = this.getASNXML(objASN, res, next);
    
                objValida.ASNFILENAME = objASN.FILENAME;
                objValida.buffer = strXML;

                utilsDIR.saveFile(`${dirUP}${objASN.FILENAME}`, strXML);    
    
            } else {
                
                objValida.strErro = `Erro ao gerar ASN - IDG046 #${objDados.IDCARGA} - ${objValida.strErro}`;
                logger.error(objValida.strErro);
    
            }
    
            return objValida;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\  
    
    api.completeASN = function (objDados, res, next) {

        try { 

            var strDtFmt = 'YYYY-MM-DD HH:mm:ss';

            var dtCreate = tmz.tempoAtual(strDtFmt);
            
            var objASN = {};
    
            objASN.cdInt    = objDados.cdInt;
            objASN.IDMSG    = objDados.IDMSG;
            objASN.CONTLOAD = objDados.CONTLOAD;
            objASN.IDVEICUL = objDados.IDVEICUL;
            objASN.CDFILIAL = objDados.CDFILIAL;
            objASN.IDDESTIN = objDados.IDDESTIN;
            objASN.IDTRANSF = objDados.IDTRANSF;
            objASN.NMTRANSP = objDados.NMTRANSP;
            objASN.DISTANCE = objDados.DISTANCE;
            objASN.NRPLATRK = objDados.NRPLACA1;
            objASN.VOLUME   = objDados.VOLUME;
            objASN.WEIGHT   = objDados.WEIGHT;
            objASN.DTAGP    = objDados.DTAGP;
            objASN.DTEAD    = objDados.DTEAD;
            objASN.TPDELIVE = objDados.TPDELIVE;
            objASN.item     = objDados.item;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            objASN.NRETAPA  = utilsCA.LPad(objDados.NRETAPA, '0', 2);
    
            objASN.BLNUMBER = utilsFMT.formataShipment({ idCarga: objDados.IDCARGA });
            objASN.IDSHIP   = utilsFMT.formataShipment({ idCarga: objDados.IDCARGA, nrEtapa: objDados.NRETAPA });
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            objASN.DTINIETA = tmz.formataData(objDados.DTINIETA, strDtFmt).replace(' ', 'T');
            objASN.DTFINETA = tmz.formataData(objDados.DTFINETA, strDtFmt).replace(' ', 'T');
    
            objASN.DTAGP = tmz.formataData(objDados.DTAGP, strDtFmt).replace(' ', 'T');
            objASN.DTEAD = tmz.formataData(objDados.DTEAD, strDtFmt).replace(' ', 'T');
            if (objDados.DTACP) objASN.DTACP = tmz.formataData(objDados.DTACP, strDtFmt).replace(' ', 'T');
    
            dtCreate = dtCreate.replace(' ', 'T');
            objASN.DTCREATE = dtCreate;
    
            dtCreate = dtCreate.replace(/(\-|\:)/g, '');
            objASN.FILENAME = `ASN_BRAVO_SYNGENTA_${objASN.IDSHIP}_${dtCreate}.xml`;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            switch (objDados.STINTCLI) {
    
                case 3: //PRE-ASN DELETE
                case 4: //ASN DELETE
                    objASN.PURPOSE = 'DELETE';
                    break;
    
                default: 
                    objASN.PURPOSE = 'REPLACE';
                    break;
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            if (objDados.NRPLACA2) {
                objASN.NRPLAREB = objDados.NRPLACA2;
                if (objDados.NRPLACA3) objASN.NRPLAREB += `, ${objDados.NRPLACA3}`;
    
            } else {
                objASN.NRPLAREB = '';
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            return objASN;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.changeASNFlag = async function (req, res, next) {

        try {

            switch (req.cdInt) {

                case 0: //PRE-ASN / PRE-ASN REPLACE
                    var stFlag = 1;
                    break;
    
                case 3: //PRE-ASN REMOVE
                case 4: //ASN REMOVE
                    var stFlag = req.STINTCLI + 2;
                    break;
                
                case 8:  //ASN L.R. RECUSA
                case 14: //ASN RECUSA NA ORIGEM
                    var stFlag = 2;
                    break;
    
                default:
                    var stFlag = req.STINTCLI + 1;
                    break;
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var objDados  = { IDG048: req.IDG048, STINTCLI: stFlag };
            var objValida = utilsFMT.validaEsquema(objDados, mdlASN.flagASN.columns);
    
            if (objValida.blOK) { 
    
                objDados = utilsFMT.setSchema(mdlASN.flagASN, objDados);
                objDados.objConn = req.objConn;
    
                await dao.controller.setConnection(objDados.objConn);
                await dao.alterar(objDados, res, next);
    
            } else {
    
                logger.error(`Erro ao alterar ASN Flag - IDG048 #${req.IDG048}`);
    
            }
            
            return objValida;            

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\

    api.getASNXML = function (objASN, res, next) {

        try {

            var strXML = tpl.getHeader(objASN);

            for (var objItem of objASN.item)
                strXML += tpl.getLoop(objASN, objItem);
            
            strXML += tpl.getFooter();
    
            return strXML; 

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.saveASNDoc = async function (req, res, next) { 
    
        try { 

            var parm = 
            {
                objConn:    req.objConn,                
                TPDOCUME:   'ASN',
                DSMIMETP:   'application/xml',
                IDS001:     1,                
                IDS007:     28, //G048
                PKS007:     req.IDG048,
                NMDOCUME:   req.NMDOCUME,
                buffer:     req.buffer
            };

            return await mDoc.saveDoc(parm, res, next);

        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    return api;

}