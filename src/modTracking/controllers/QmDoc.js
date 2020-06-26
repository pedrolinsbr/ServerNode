module.exports = function (app, cb) {

    const utilsCA  = app.src.utils.ConversorArquivos;
    const utilsDir = app.src.utils.Diretorio;
    const utilsFMT = app.src.utils.Formatador;
    const tmz      = app.src.utils.DataAtual;
    const mdl      = app.src.modTracking.models.logQM;
    const dao      = app.src.modTracking.dao.QmDAO;
    const gdao     = app.src.modGlobal.dao.GenericDAO;
    const logger   = app.config.logger;

    const xmlDir   = process.env.FOLDER_DOWNLOAD;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.importaQm = async function (req, res, next) {

        try {

            var arFiles = await api.listaArquivosQm(req, res, next);

            res.send(arFiles);

        } catch (err) {
            res.status(500).send(err);
        }

    }

    //-----------------------------------------------------------------------\\

    api.listaArquivosQm = async function (req, res, next) {

        var arFiles = utilsDir.listFiles(xmlDir);

        var arID = [];

        for (var file of arFiles) {

            var filepath = `${xmlDir}${file.filename}`;

            arID = arID.concat(await this.lerXmlQm({ filepath }, res, next).catch((err) => { throw err }));
        }

        return { arID };
    }

    //-----------------------------------------------------------------------\\

    api.lerXmlQm = async function (req, res, next) {

        var strXML = (req.hasOwnProperty('filepath')) ? utilsCA.lerArquivo(req.filepath) : req.body;
        var xmlDom = utilsCA.getXmlDom(strXML);
        var nodes  = utilsCA.getXmlNodes('//notafiscal', xmlDom);

        var arDados = [];

        logger.debug('Lendo dados do QM Notification');

        for (var nota of nodes) {

            var objDado = {};

            for (var i in nota.attributes) {

                if (nota.attributes[i].value !== undefined) {
                    
                    var campo = nota.attributes[i].name;
                    var valor = nota.attributes[i].value;

                    switch (campo) {
                        case 'numerofiscal':
                            objDado.NRNOTA = valor;
                            break;

                        case 'cnpjremetente':
                            objDado.CJCLIENT = valor;
                            break;

                        case 'cnpjtransportador':
                            objDado.CJTRANSP = valor;
                            break;

                        case 'localizacao':
                            objDado.DSLOCAL = valor;
                            break;

                        case 'codigoocorrencia':
                            objDado.cdOcorrencia = valor;
                            break;

                        case 'dataprevisaoentrega':
                            objDado.DTENTPLA = tmz.retornaData(valor, 'DD/MM/YYYY HH:mm');
                            break;

                        case 'dataentrega':
                            objDado.DTENTREG = tmz.retornaData(valor, 'DD/MM/YYYY HH:mm');
                            break;                            

                        case 'dthratualizacao':
                            objDado.DTHRATU = tmz.retornaData(valor, 'DD/MM/YYYY HH:mm');
                            break;

                        case 'latitude':
                            objDado.NRLATITU = utilsFMT.currencyToFloat(valor);
                            break;

                        case 'longitude':
                            objDado.NRLONGIT = utilsFMT.currencyToFloat(valor);
                            break;

                    }

                }

            }
                            
            arDados.push(objDado);

        }

        logger.debug(`${arDados.length} notificações encontradas`);

        return await this.salvaQm({ arDados }, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.salvaQm = async function (req, res, next) {

        var arOK   = [];
        var arErro = [];

        var objConn = await gdao.controller.getConnection();        

        for (var objDado of req.arDados) {

            var blOK    = false;
            var strErro = null;

            var objAnalise = utilsFMT.setSchema(mdl.NF, objDado);
            var objValida  = utilsFMT.validaEsquema(objAnalise.vlFields, mdl.NF.columns);            

            if (objValida.blOK) {

                logger.debug(`Buscando dados da NF #${objDado.NRNOTA}`);

                objDado.objConn = objConn;
                await gdao.controller.setConnection(objConn);
                
                var rs = await dao.buscaNF(objDado, res, next).catch((err) => { throw err });

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                //Atualiza previsão de entrega na CTE

                if (rs.length > 0) {                                    

                    objDado.IDG043      = rs[0].IDG043;
                    objDado.IDG051      = rs[0].IDG051;
                    objDado.DTPREATU    = objDado.DTENTPLA;
                    objDado.dtPrevisao  = tmz.formataData(objDado.DTENTPLA, 'DD/MM/YYYY HH:mm');
                
                    await gdao.controller.setConnection(objConn);
                    await dao.updDtPrevisao(objDado, res, next).catch((err) => { throw err });

                    logger.debug(`Atualizando previsão de entrega - IDG051 #${objDado.IDG051}`);

                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                    //Atualiza data de Entrega na Delivery

                    if (objDado.hasOwnProperty('DTENTREG')) {
                    
                        logger.debug(`Atualizando data de entrega - IDG043 #${objDado.IDG043}`);

                        objDado.DTPREATU  = objDado.DTENTREG;
                        objDado.dtEntrega = tmz.formataData(objDado.DTENTREG, 'DD/MM/YYYY HH:mm');

                        await gdao.controller.setConnection(objConn);
                        await dao.updDtEntrega(objDado, res, next).catch((err) => { throw err })                

                        .then(async () => {

                            logger.debug(`Atualizando flag de entrega - IDG051 #${objDado.IDG051}`);

                            //Aplica Flag de Entrega no CTE
                            await gdao.controller.setConnection(objConn);
                            await dao.updCTEEntrega(objDado, res, next).catch((err) => { throw err });

                        });

                    }

                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                    //Grava registro em log

                    var objLog = utilsFMT.setSchema(mdl.G042, objDado);
                    objValida  = utilsFMT.validaEsquema(objLog.vlFields, mdl.G042.columns);

                    if (objValida.blOK) {

                        objLog.objConn = objConn;
                        await gdao.controller.setConnection(objConn);
                        await gdao.inserir(objLog, res, next).catch((err) => { throw err })

                        .then((result) => { 
                            blOK = true;
                            logger.debug(`Inserindo log de registro - IDG042 #${result.id}`);
                         });

                    } else {

                        strErro = `Objeto LOG inválido`;
                        logger.error(`${strErro} - NF: ${objDado.NRNOTA}`);

                    }

                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                } else {
                    
                    strErro = `Nota Fiscal não encontrada`;
                    logger.error(`${strErro} - NF: ${objDado.NRNOTA}`);
                    
                }

            } else {

                strErro = `Formato do XML inválido`;
                logger.error(strErro);

            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var objResult = { 'numerofiscal': objDado.NRNOTA };

            if (blOK) {

                arOK.push(objResult);

            } else  {

                objResult.erro = strErro;
                arErro.push(objResult);

            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
            
        }

        await objConn.close();

        return { 'sucesso': arOK, 'falha': arErro };
    }

    //-----------------------------------------------------------------------\\

    return api;

}