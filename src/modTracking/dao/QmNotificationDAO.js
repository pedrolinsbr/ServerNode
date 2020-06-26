module.exports = function (app, cb) {
    const logger = require(process.cwd() + '/config/logger.js');
    var api = {};
    api.controller = app.config.ControllerBD;
    var logInterface = app.src.utils.LogInterface;
    var utils = app.src.utils.FuncoesObjDB;
    var deliveryDAO = app.src.modIntegrador.dao.DeliveryDAO;
    const tmz = app.src.utils.DataAtual;
    var asnDAO = app.src.modIntegrador.dao.ASNDAO;
    var tradCodOcorr = app.src.utils.TradCodOcorr;
    
    /**
     * @description Recebe e processa xml do QmNotification
     *
     * @function receiveNotification            
     * @param   {Object} req    
     * @param   {Object} req.objConn conexão DBV4    
     * @param   {number} req.UserId usuário que enviou xml
     * @param   {number} req.body conteúdo do xml
     *
     * @returns {{ STATREQ: "Erro" } | { STATREQ: "sucesso" } | {  }} Retorna json informando o que foi processado
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.receiveNotification = async function (req, res, next) {
        req.errXml = [];
        req.sucXml = [];
        if(!req.objConn){
            req.objConn = await this.controller.getConnection()
        }
        await this.controller.setConnection(req.objConn)
        this.tradCodOcorr = await tradCodOcorr.codOcorrReasonCode(req);
        var parser = require('xml2json');

        var json = JSON.parse(parser.toJson(req.body,{
            object: false,
            reversible: false,
            coerce: false,
            sanitize: true,
            trim: true,
            arrayNotation: false,
            alternateTextNode: "extraText"
        }));
        logger.info(`xml de ${req.UserId} convertido com sucesso`);
        var desceJson = function (json) {
            if(json.extraText){//trato bug que pega enters no xml
                delete json.extraText;
            }
            for (var i in json) {
                return [i, json[i]];
            }
        }
        if(json.transportadora){
            json = {
                xml:json
            }
        }

        if(json.xml && json.xml.transportadora) 
        { 
            let dthratualizao = json.xml.transportadora.dthratualizacao ? 
                                                    json.xml.transportadora.dthratualizacao : new Date();  
            var notasfiscais = { notafiscal: [] };

            if (!Array.isArray(json.xml.transportadora.notasfiscais.origem)) {
                json.xml.transportadora.notasfiscais.origem = 
                                            new Array(json.xml.transportadora.notasfiscais.origem);
            }

            json.xml.transportadora.notasfiscais.origem.forEach( function (notas) {
                let cnpjremetente = notas.cnpj; 
                if(!Array.isArray(notas.notafiscal)){
                    var tmp = notas.notafiscal;
                    notas.notafiscal = new Array();
                    notas.notafiscal.push(tmp);
                }
                notas.notafiscal.forEach( function (nota) {
                    notasfiscais.notafiscal.push(
                       {numerofiscal: nota.numero,
                        dataprevisaoentrega: nota.dataprevisaoentrega,
                        dataentrega: nota.dataentrega,
                        localizacao: nota.localizacao,
                        dthratualizacao: dthratualizao,
                        cnpjremetente: cnpjremetente}
                    );
                })  
            })
            json = notasfiscais;
        }

        //capturo objeto de notasfiscais
        var i = null;
        var numDesc = 0;//usado para evitar loop infinito quanto o xml vira json porém em um formato não esperado
        while (i != "notafiscal" && numDesc < 5) {
            [i, json] = desceJson(json);
            numDesc++;
        }
        //valido se o desceJson caiu em um loop
        if(numDesc == 5){
            var objLog = { 
                STATREQ: "Erro, json em loop infinito após conversão",
                detalhes:[]
            }
            await this.controller.setConnection(req.objConn);
            await logInterface.gravaLog(req, objLog);
            await req.objConn.close();
            return { STATREQ: "Erro" };
        }
        if (!Array.isArray(json)) {
            json = [json];
        }
        json = await this.validateNF(json, req);

        //mando inserir as datas
        json = await this.saveData(json,req);

        //preparo o objeto para mandar para o log de sucesso
        var deliveries = [];
        for (var i in json) {
            for (var ii = 0; ii < json[i].length; ii++) {
                json[i][ii].dthratualizacao = tmz.retornaData(json[i][ii].dthratualizacao, "DD/MM/YYYY HH:mm");
                json[i][ii].dataprevisaoentrega = tmz.retornaData(json[i][ii].dataprevisaoentrega, "DD/MM/YYYY HH:mm");
                if(json[i][ii].latitude && json[i][ii].longitude){
                    json[i][ii].latitude = parseFloat(json[i][ii].latitude.replace(",", "."));
                    json[i][ii].longitude = parseFloat(json[i][ii].longitude.replace(",", "."));
                }else{
                    json[i][ii].latitude = 0;
                    json[i][ii].longitude = 0;
                }
                
                deliveries.push(json[i][ii]);
            }
        }
        //mando gravar o "log de sucesso"
        await this.logSucess(deliveries,req);
        //preparo objLog
        if (req.errXml.length == 0) {
            var objLog = { STATREQ: "Sucesso" }
        }
        if (req.sucXml.length == 0) {
            var objLog = { STATREQ: "Erro" }
        }
        if (req.sucXml.length != 0 && req.errXml.length != 0) {
            var objLog = { STATREQ: "Parcialmente processado" }
        }
        objLog.detalhes = [];
        for (var i = 0; i < req.errXml.length; i++) {
            const notaErro = req.errXml[i];
            objLog.detalhes.push({
                TXTMENSAG: notaErro.numerofiscal + " " + notaErro.erro,
                STATDETA: "F"
            });
        }

        for (var i = 0; i < req.sucXml.length; i++) {
            const notaSuc = req.sucXml[i];
            objLog.detalhes.push({
                TXTMENSAG: notaSuc.numerofiscal,
                STATDETA: "S"
            });
        }

        //subo o nivel para mandar para um método externo
        await this.controller.setConnection(req.objConn);
        //mando gravar o log detalhado
        await logInterface.gravaLog(req, objLog);
        await req.objConn.close();
        var ret = {
            sucesso: req.sucXml,
            falha: req.errXml
        }
        req.errXml = [];
        req.sucXml = [];
        return ret;

        


    }

    /**
     * @description Recebe e processa xml do QmNotification
     *
     * @function validateNF            
     * @param   {Object} notasfiscais    
     * @param   {Object} req.objConn conexão DBV4    
     * @param   {number} req.UserId usuário que enviou xml
     *
     * @returns {Object} Retorna json com paradas e suas deliveries
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.validateNF = async function (notasfiscais, req) {
        var con = await this.controller.getConnection(req.objConn);
        //CASO HAJA DATA DE ENTREGA GRAVADA NO BANCO PRESUMO QUE NÃO É NECESSÁRIO GRAVAR MAIS NADA
        /**pego as deliveries com paradas em um unico array com td misturado, posteriormente
         * será filtrado criando um objeto mais legivel para trabalhar posteriormente
         */
        var paradas = {};
        for (var i in notasfiscais) {
            const notafiscal = notasfiscais[i];

            try {
                logger.info(`Montando sqlWhere: ${notafiscal.numerofiscal}`)
                var [sqlWhere, bindValues] = utils.buildWhere({
                    tableName: "G043",
                    NRNOTA: notafiscal.numerofiscal,
                    "REMETENTE.CJCLIENT": notafiscal.cnpjremetente,
                    "G024.CJTRANSP": notafiscal.cnpjtransportador
                }, true);

                logger.info(`Montando sqlWhereAcl: ${notafiscal.numerofiscal}`)
                var acl = app.src.modIntegrador.controllers.FiltrosController;
                let sqlWhereAcl = await acl.montar({
                    ids001: req.UserId,
                    dsmodulo: req.UrlModulo,
                    nmtabela: [{ G024: 'G024' }],                    
                    esoperad: 'And'
                });
                if (sqlWhereAcl == " And ") {
                    sqlWhereAcl = "";
                }
                if(sqlWhereAcl == undefined){
                    logger.error("PROBLEMA COM ACL ! OBJETO UTILIZADO: " + {
                        ids001: req.UserId,
                        dsmodulo: req.UrlModulo,
                        nmtabela: [{ G024: 'G024' }],                    
                        esoperad: 'And'
                    });
                    continue;
                }
                logger.info(`Capturando delivery com numero nota: ${notafiscal.numerofiscal}`)
                var deliveriesWithParadas = await con.execute({
                    sql: `SELECT DISTINCT
                    G048.IDG048,
                    G048.DTPREATU,
                    G043.IDG043,
                    G043.NRNOTA
                    FROM G043
                    INNER JOIN G049
                        ON (G049.IDG043 = G043.IDG043)
                    INNER JOIN G048
                        ON (G048.IDG048 = G049.IDG048)
                    INNER JOIN G046
                        ON(G046.IDG046 = G048.IDG046)
                    INNER JOIN G024
                        ON(G024.IDG024 = G046.IDG024)
                    INNER JOIN G052
                        ON(G052.IDG043 = G043.IDG043)
                    INNER JOIN G051
                        ON(G051.IDG051 = G052.IDG051)
                    INNER JOIN G005 REMETENTE
                        ON(REMETENTE.IDG005 = G051.IDG005RE)
                    ` + sqlWhere + sqlWhereAcl,
                    param: bindValues
                }).then((result) => {
                    if (result.length == 0) {
                        logger.info("Nenhuma delivery encontrada para a nota fiscal")
                    }
                    return result[0];
                }).catch((err) => {
                    logger.error(err);
                    throw err;
                });
            } catch (err) {
                logger.error(err);
                await con.closeRollback();                
            }



            try {
                //valido caso data prevista de entrega tenha mudado
                // var data = tmz.retornaData(notafiscal.dataprevisaoentrega, "DD/MM/YYYY");
                // deliveriesWithParadas.DTPREATU = tmz.retornaData(deliveriesWithParadas.DTPREATU, "DD/MM/YYYY");  
                // if ((deliveriesWithParadas.DTPREATU.getTime() != data.getTime()) &&
                //     (notafiscal.codigoocorrencia == null || notafiscal.codigoocorrencia == "")) {

                //     this.errXml.push({
                //         numerofiscal: notafiscal.numerofiscal,
                //         erro: "dataprevisaoentrega alterado porem não há codigoocorrencia"
                //     });
                //     continue;

                // }
                //preparo a variavel paradas agrupando deliveries pertecentes a mesma parada
                notafiscal.IDG043 = deliveriesWithParadas.IDG043;
                if (!Array.isArray(paradas[deliveriesWithParadas.IDG048])) {
                    paradas[deliveriesWithParadas.IDG048] = [notafiscal];
                    logger.info("criando parada e atribuindo nota");
                } else {
                    paradas[deliveriesWithParadas.IDG048].push(notafiscal);
                    logger.info("atribuindo nota");
                }
            } catch (err) {//tratamento de erro quando ñ é encontado delivery
                logger.error(err);
                req.errXml.push({
                    numerofiscal: notafiscal.numerofiscal,
                    erro: "Delivery não encontrada"
                });
            }

        }
        //percorro todas as paradas procurando inconsistencia em data
        logger.info("Percorro paradas, procurando inconsistencia em data");
        for (var i in paradas) {
            if (paradas[i].length < 2) {
                paradas[i].DTPREATU = paradas[i][0].dataprevisaoentrega;
                paradas[i].DTENTREG = paradas[i][0].dataentrega;
                paradas[i].codigoocorrencia = paradas[i][0].codigoocorrencia;
                continue;
            }
            var inconsistencia = false;
            var deliveries = paradas[i];
            var tmpDeliveries = deliveries;
            for (var tmp = 0; tmp < tmpDeliveries.length; tmp++) {
                for (var del = 0; del < deliveries.length; del++) {

                    if (
                        (tmpDeliveries[tmp].dataprevisaoentrega != deliveries[del].dataprevisaoentrega) ||
                        (tmpDeliveries[tmp].dataentrega != deliveries[del].dataentrega) ||
                        (tmpDeliveries[tmp].codigoocorrencia != deliveries[del].codigoocorrencia)
                    ) {
                        inconsistencia = true;
                        break;
                    }
                }
                if (inconsistencia) {
                    break;
                }
            }
            delete tmpDeliveries;//deleto array temporario
            if (inconsistencia) {
                for (var del = 0; del < deliveries.length; del++) {

                    req.errXml.push({
                        numerofiscal: deliveries[del].numerofiscal,
                        erro: "Deliveries pertencente a mesma parada com divergencia nas datas"
                    });

                }
                delete paradas[i];
            } else {
                logger.info("atribuindo datas á parada");
                deliveries.DTPREATU = deliveries[0].dataprevisaoentrega;
                deliveries.DTENTREG = deliveries[0].dataentrega;
                deliveries.codigoocorrencia = deliveries[0].codigoocorrencia;

            }



        }
        return paradas;
    }


    /////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * @description Grava data de entrega e previsão que foi modificada pelo QM 
     *
     * @function saveData            
     * @param   {Object} paradas    
     * @param   {Object} req.objConn conexão DBV4    
     * @param   {number} req.UserId usuário que enviou xml
     *
     * @returns {Object} Retorna json com paradas e suas deliveries
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.saveData = async function (paradas,req) {
        for (i in paradas) {
            const parada = paradas[i];
            if (!(parada.DTENTREG == "" || parada.DTENTREG == null)) {
                await this.controller.setConnection(req.objConn);
                var reqEntreg = {
                    params: {
                        idParada: i
                    },
                    body: {
                        DTENTREG: parada.DTENTREG
                    },
                    objConn: req.objConn
                }

                try {
                    
                    await deliveryDAO.gravaDataEntreg(reqEntreg);
                } catch (err) {
                    //percorro a parada pegando numero de nota e gerando o erro
                    for (var iDel = 0; iDel < parada.length; iDel++) {
                        const delivery = parada[iDel];

                        if (err.codErr) {
                            req.errXml.push({
                                numerofiscal: delivery.numerofiscal,
                                erro: err.msgErr
                            });
                        }
                        if(err.errorNum == 1847){
                            // logger.info(`data de entrega não informado, Parada: ${parada[iDel]}`)
                        }
                    }
                    if (err.codErr == 10) {
                        delete paradas[i];
                        continue;
                    }


                    // logger.error(err);
                }

            }
            await this.controller.setConnection(req.objConn);
            var reqPrevi = {
                body: {
                    DTALTERADA: parada.DTPREATU,
                    IDG048: i,
                    IDI007: this.tradCodOcorr[parada.codigoocorrencia]
                },
                objConn:req.objConn
            };


            

            //if(reqPrevi.body.IDI007 == undefined){
                reqPrevi.body.stEnvio = 2;
            // }
            try {
                await deliveryDAO.alterarDataPrevisaoCarga(reqPrevi);
            } catch (err) {
                logger.error(err);
            }

        }

        return paradas;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////

     /**
     * @description grava o q foi processado no QM notification
     *
     * @function logSucess            
     * @param   {Object} deliveries    
     * @param   {Object} req.objConn conexão DBV4    
     * @param   {number} req.UserId usuário que enviou xml
     *
     * @returns {Object} Retorna json com paradas e suas deliveries
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.logSucess = async function (deliveries,req) {
        for (var i = 0; i < deliveries.length; i++) {
            try {
                var objConn = await this.controller.getConnection(req.objConn);
                
                await objConn.insert({
                    tabela: 'G042',
                    colunas: {
                        DSLOCAL: deliveries[i].localizacao,
                        NRLATITU: deliveries[i].latitude,
                        NRLONGIT: deliveries[i].longitude,
                        IDG043: deliveries[i].IDG043,
                        DTPREATU: deliveries[i].dataprevisaoentrega,
                        DTHRATU: deliveries[i].dthratualizacao,
                        IDI015: deliveries[i].codigoocorrencia
                    },
                    key: 'IDG042'
                }).then((result) => {
                    return result;
                }).catch((err) => {
                    throw err;
                });
                req.sucXml.push({
                    numerofiscal: deliveries[i].numerofiscal
                });
            } catch (err) {
                req.errXml.push({
                    numerofiscal: deliveries[i].numerofiscal,
                    erro: "Erro desconhecido ao gravar no log de sucesso"
                });
                delete deliveries[i];
            }
        }


    }

    /**
     * @description responde a requisição da datagrid
     *
     * @function listaLogQm            
     * @param   {Object} req    
     * @param   {Object} req.body    
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.listaLogQm = async function(req,res,next){
        if(req.body["parameter"] === ""){
            delete req.body["parameter"]
        }
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "G042", false);

        try{
            var con =  await this.controller.getConnection();
            var result = con.execute({
                sql:`Select 
                    G042.DSLOCAL G042_DSLOCAL,
                    G042.NRLATITU G042_NRLATITU,
                    G042.NRLONGIT G042_NRLONGIT,
                    TO_CHAR(G042.DTPREATU, 'DD/MM/YYYY HH24:MI:SS') G042_DTPREATU,
                    TO_CHAR(G042.DTHRATU, 'DD/MM/YYYY HH24:MI:SS') G042_DTHRATU,
                    TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY HH24:MI:SS') G043_DTENTREG,
                    G042.IDI015 G042_IDI015,
                    COUNT(*) OVER () as COUNT_LINHA                    
                    FROM G042
                    INNER JOIN G043
                        ON G043.IDG043 = G042.IDG042
                     JOIN G049
                        ON G049.IDG043 = G043.IDG043
                    INNER JOIN G048
                        ON G048.IDG048 = G049.IDG048` + sqlWhere + sqlOrder + sqlPaginate,
                param:bindValues
            }).then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            }).catch((err) => {
                throw err;
            })
            await con.close();
            return result;
        }catch(err){
            await con.closeRollback();
            throw err;
        }
    }

    /**
     * @description Executado pelo cron, responsavel por pegar os QMs no ftp das transportadoras
     *
     * @function listaLogQm            
     *
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.getXmlQmInFtp = async function(){
        //pego todas as pastas ftp do banco
        logger.info("Cron getXmlQmInFtp executado!");
        try{
            var objConn =  await this.controller.getConnection();
            var ftps = await objConn.execute({
                sql: `Select *                
                from S035
                INNER JOIN S036 
                    ON S036.IDS036 = S035.IDS036
                INNER JOIN S001
                    ON S001.IDS001 = S035.IDS001
                WHERE S036.NMINTEGR = 'qmnotification'`,
                param:[]
            }).then((result) => {
                return result
            }).catch((err) => {
                throw err
            });

        }catch (error) {
            logger.error(error);
        }
	    const fs 	 = require('fs');
        //percorro todas as conexões e consulto os xmls
        for(var i in ftps){
            const ftp = ftps[i];
            var keyFile = null
            try {
                keyFile = fs.readFileSync(`../key/ftps/FTP-${ftp.IDS035}/${ftp.PUBLICKEY}`);	
            } catch (error) {
                if(!ftp.PASSWORD){
                    logger.info(`FTP_ID ${ftp.IDS035} não foi possivel encontrar senha ou keyfile`);
                    continue;
                }
                
            }
            logger.info(`informações do FTP_ID ${ftp.IDS035} capturadas com sucesso`);
            
            //preparo o falseReq
            var falseReq = {};
            falseReq.UserId = ftp.IDS001;
            falseReq.UrlModulo = "Tracking";
            falseReq.UrlId = 1;
            

            const objConnFtp = {
                host: ftp.HOST
            ,	port: ftp.PORT
            ,	username: ftp.USERNAME
            ,	remoteDir: ftp.REMOTEDIR         
            }

            if (ftp.PASSWORD){
                objConnFtp.password =  ftp.PASSWORD ; 
            }else{
                objConnFtp.privateKey =  keyFile ; 
            }
            falseReq.objConn = objConn;
            try {
                if(objConnFtp.port == 21){
                    await this.ftpResolver(falseReq,objConnFtp);
                }else{
                    await this.sftpResolver(falseReq,objConnFtp);
                }    
            } catch (error) {
                logger.error(error);
            }            
        }
      
    }

    /**
     * @description acessa o ftp capturando os arquivos e jogando para o receiveNotification
     *
     * @function logSucess            
     * @param   {Object} falseReq    
     * @param   {Object} falseReq.objConn conexão DBV4    
     * @param   {Object} falseReq.body usuário que enviou xml
     * @param   {Object} objConnFtp usuário que enviou xml
     *
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.ftpResolver = async function(falseReq,objConnFtp){
        var stream = require('stream');
        const Client = require("basic-ftp");
        var ftp = new Client.Client();
        objConnFtp.user = objConnFtp.username;
        delete objConnFtp.username;
        await ftp.access(objConnFtp);
        logger.info(`FTP_ID ${objConnFtp.host} conectado`);
        await ftp.cd(objConnFtp.remoteDir)
        logger.info(`FTP_ID ${objConnFtp.host} diretorio listado`);
        var files = await ftp.list();
        logger.info(`FTP_ID ${objConnFtp.host} arquivos capturados`);
        for (var remFile of files){
            var writable = new stream.Writable({
                write: function(chunk, encoding, next) {
                  writable.content += chunk.toString();
                  next();
                }
              });
            writable.content = "";

            await ftp.download(writable,remFile.name);
            falseReq.body = writable.content;
            
            logger.info(`FTP_ID ${objConnFtp.host} arquivos na memória, enviando para método receiveNotification`);            
            var qmNotification = Object.assign({},app.src.modTracking.dao.QmNotificationDAO);
            try {
                await qmNotification.receiveNotification(falseReq);
            } catch (error) {
                logger.error(error);
            }
         
            
        }
        await ftp.close();
        logger.info(`FTP_ID ${objConnFtp.host} desconectado`);
    }

    /**
     * @description acessa o sftp capturando os arquivos e jogando para o receiveNotification
     *
     * @function logSucess            
     * @param   {Object} falseReq    
     * @param   {Object} falseReq.objConn conexão DBV4    
     * @param   {Object} falseReq.body usuário que enviou xml
     * @param   {Object} objConnFtp usuário que enviou xml
     *
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.sftpResolver = async function(falseReq,objConnFtp){
        const Client = require('ssh2-sftp-client');
        var sftp = new Client();
        await sftp.connect(objConnFtp)
        logger.info(`FTP_ID ${objConnFtp.host} conectado`);
        var files = await sftp.list(objConnFtp.remoteDir);
        logger.info(`FTP_ID ${objConnFtp.host} arquivos capturados`);
        for (var file of files){
            var strRemoteFile = `${objConnFtp.remoteDir}/${file.name}`;
            var fileStream = await sftp.get(strRemoteFile);
            var xml = fileStream.read();
            falseReq.body = xml;
            var qmNotification = Object.assign({},app.src.modTracking.dao.QmNotificationDAO);
            try {
                await qmNotification.receiveNotification(falseReq);
            } catch (error) {
                logger.error(error);
            }
        }
        await sftp.end();
        logger.info(`FTP_ID ${objConnFtp.host} desconectado`);
    }
    

    return api;

};
