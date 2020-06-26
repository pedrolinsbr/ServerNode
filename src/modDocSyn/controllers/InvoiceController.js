module.exports = function (app, cb) {

    const dirUP     = process.env.FOLDER_UPLOAD;

    const logger    = app.config.logger;

    const tmz       = app.src.utils.DataAtual;
    const utilsFMT  = app.src.utils.Formatador;
    const utilsDIR  = app.src.utils.Diretorio;
    
    const mDoc      = app.src.modDocSyn.controllers.DocSaveController;

    const mdlDoc    = app.src.modDocSyn.models.DocSynModel;
    const tpl       = app.src.modDocSyn.models.InvoiceTemplate;
    const nxt       = app.src.modDocSyn.dao.NextIdDAO;
    const dao       = app.src.modDocSyn.dao.InvoiceDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.newInvoice = async function (req, res, next) {

        try {

            var objResult = await api.formatInvoiceData(req, res, next);
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

    api.formatInvoiceData = async function (req, res, next) {

        try {

            req.objConn = await nxt.controller.getConnection();
        
            await nxt.controller.setConnection(req.objConn);
            var rs = await dao.getInvoiceData(req, res, next);
    
            var ttDoc   = rs.length;
            var ttDone  = 0;
            var strErro = null;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            for (var objInv of rs) {        
    
                var objDados = {};
    
                await nxt.controller.setConnection(req.objConn);
                objDados.IDMSG     = await nxt.getMessageID(req, res, next);
    
                objDados.IDCARGA   = objInv.IDCARGA;
                objDados.IDETAPA   = objInv.IDETAPA;
                objDados.NRETAPA   = objInv.NRETAPA;                        
                objDados.VRFEE     = objInv.VRFEE;
                objDados.VRFREIGH  = objInv.VRFREIGH;
                objDados.STINTINV  = parseInt(objInv.STINTINV);
    
                var objResult = this.invoiceGenerate(objDados, res, next);
    
                if (objResult.blOK) { 
                    
                    var parm =
                    {
                        objConn:    req.objConn,
                        PKS007:     objInv.IDETAPA,
                        NMDOCUME:   objResult.filename,
                        buffer:     objResult.buffer                        
                    };

                    objResult = await this.saveInvoiceDoc(parm, res, next);
                    
                    if (objResult.blOK) {

                        objDados.STINTINV++; //change Flag
                        objDados.IDG048  = objInv.IDETAPA;                
                        objDados.objConn = req.objConn;
        
                        await nxt.controller.setConnection(objDados.objConn);
                        await dao.changeInvoiceStatus(objDados, res, next);
        
                        await this.insDeliveryLog(objDados, res, next);
        
                        ttDone++; 
    
                    }
    
                } else { 
    
                    strErro = objResult.strErro;
    
                }
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            //await req.objConn.closeRollback();
            await req.objConn.close();
    
            return { ttDoc, ttDone, strErro };
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insDeliveryLog = async function (req, res, next) {
        
        try {

            req.DTEVENTO = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');

            switch (req.STINTINV) {
                case 1: //CRIAÇÃO
                    req.IDI001 = 15;
                    break;
                    
                case 3: //CANCELAMENTO
                    req.IDI001 = 27;
                    break;
    
                default:
                    req.IDI001 = 0;				
                    break;
            }
    
            if (req.IDI001 > 0) {
                
                await nxt.controller.setConnection(req.objConn);
                await nxt.insereEventoEtapa(req, res, next);
    
            }

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.invoiceGenerate = function (objDados, res, next) {

        try {

            var objValida = utilsFMT.checaEsquema(objDados, mdlDoc.INVOICE);

            if (objValida.blOK) { 
    
                var objInv = this.completeInvoice(objDados, res, next);
                var strXML = tpl.getInvoiceXML(objInv, res, next);
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                objValida.filename = objInv.FILENAME;
                objValida.buffer = strXML;
    
                utilsDIR.saveFile(`${dirUP}${objInv.FILENAME}`, strXML);
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            } else {
    
                objValida.strErro = `Erro ao gerar Invoice - IDG048 #${objDados.IDETAPA} - ${objValida.strErro}`;
                logger.error(objValida.strErro);
    
            }
    
            return objValida;

        } catch (err) {

            throw err;

        }    

    }

    //-----------------------------------------------------------------------\\

    api.completeInvoice = function (objDados, res, next) {

        try {

            var objInv = {};

            var strDtFmt = 'YYYY-MM-DD HH:mm:ss';
    
            var dhTMZ   = tmz.tempoAtual(strDtFmt, false);
            var dhUTC   = tmz.tempoAtual(strDtFmt, true);
    
            var dhFile  = dhTMZ.replace(/(\-|\:)/g, '').replace(' ', 'T');
    
            var arDhTMZ = dhTMZ.split(' ');
            var arDhUTC = dhUTC.split(' ');
    
            objInv.PURPOINV = 'CREATE';
    
            objInv.DTTMZ    = arDhTMZ[0];
            objInv.HRTMZ    = arDhTMZ[1];
    
            objInv.DTUTC    = arDhUTC[0];
            objInv.HRUTC    = arDhUTC[1];                
    
            objInv.IDMSG    = objDados.IDMSG;
            objInv.IDCARGA  = objDados.IDCARGA;
            objInv.NRETAPA  = objDados.NRETAPA;            
            objInv.STINTINV = parseInt(objDados.STINTINV);
            objInv.VRFEE    = parseFloat(objDados.VRFEE.toFixed(2));
            objInv.VRFREIGH = parseFloat(objDados.VRFREIGH.toFixed(2));
    
            objInv.IDSHIP   = utilsFMT.formataShipment({ idCarga: objDados.IDCARGA, nrEtapa: objDados.NRETAPA });
            objInv.PURPFEE  = (objDados.STINTINV == 2) ? 'DECREMENT' : 'INCREMENT';
    
            objInv.FILENAME = `GI_BRAVO_SYNGENTA_${objInv.IDSHIP}_${dhFile}.xml`;
    
            return objInv;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.saveInvoiceDoc = async function (req, res, next) { 
    
        try { 

            var parm = 
            {
                objConn:    req.objConn,                
                TPDOCUME:   'INV',
                DSMIMETP:   'application/xml',
                IDS001:     1,                
                IDS007:     28, //G048
                PKS007:     req.PKS007,
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