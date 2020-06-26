module.exports = function (app, cb) {

    const dir = process.env.FOLDER_WAREHOUSE_MANUAL;

    const moment = require('moment');

    const utilsCA = app.src.utils.ConversorArquivos;
    const utilsDir = app.src.utils.Diretorio;
    const utilsWare = app.src.utils.Warehouse;
    const logger = app.config.logger;
    const ctlCom = app.src.modWarehouse.controllers.CommonController;
    const ctlCoockpit = app.src.modWarehouse.controllers.XcockpitController;

    const model = app.src.modWarehouse.models.XMLModel;
    const modelInventory = app.src.modWarehouse.models.InventoryModel;
    const strDirDelivery = process.env.FOLDER_WAREHOUSE_MANUAL;
    const tmz = app.src.utils.DataAtual;
    const validateSchema = app.src.utils.Formatador;
    const schema = app.src.modWarehouse.models.ImportModel;
    const utilDir = app.src.utils.Diretorio;
    const utilsFMT = app.src.utils.Formatador;

    const stream = require('stream');

    var dao = app.src.modWarehouse.dao.XmlDAO;

    var daoCommon = app.src.modWarehouse.dao.CommonDAO;

    const mDoc       = app.src.modDocSyn.controllers.DocSaveController;

    var fs = require('fs');

    //SOAP
    var soap = require('soap');

    var api = {};

    //=--==-=-=-= INICIO FUNCOES =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    api.lerXmlDelivery = async function (req, res, next) {

        var path = `../xml/warehouse/deliveries/${req}`;

        if (!utilsDir.existsPath(path)) { //reimportar processados
            path = `../xml/warehouse/processados/deliveries/${req}`
        }

        if (!utilsDir.existsPath(path)) { //importar manual
            path = `../xml/warehouse/manual/${req}`
        }


        if (utilsDir.existsPath(path)) {

            logger.debug('Construindo objeto Delivery');

            var strXml = utilsCA.lerArquivo(path);
            var xmlDom = utilsCA.getXmlDom(strXml);
            var objDelivery = api.deliveryHeader(xmlDom);

            objDelivery.filename = req;
            objDelivery.blOk = true;

           //var nome = await api.renomearXmlsSoap({xml:strXml, nome:'NI'});

            var parm = {};
            parm.buffer = strXml;
            parm.IDS001 = 97;
            parm.IDS007 = 81;
            parm.PKS007 = 0;
            parm.NMDOCUME = `${req}`;
  
            await api.saveDelivery(parm);

        } else {

            logger.debug(`Arquivo ${path} não encontrado`);

            var objDelivery = {};
            objDelivery.blOk = false
            objDelivery.message = "Arquivo não Encontrado"
        }

        return objDelivery;
    }

    
    api.deliveryHeader = function (xmlDom) {

        if(xmlDom.documentElement.nodeName == "ZXDELVRY07_WH"){
            var objDelivery = ctlCom.buscaNos(xmlDom, model.DH, 0);
            objDelivery = this.deliveryItem(objDelivery, xmlDom);
            objDelivery.tipo = xmlDom.documentElement.nodeName;
        } else {
            var objDelivery = ctlCom.buscaNos(xmlDom, modelInventory.DH, 0);
            objDelivery = this.deliveryItemInventario(objDelivery, xmlDom);
            objDelivery.tipo = xmlDom.documentElement.nodeName;
        }

        
/*         if (objDelivery.TPPROCES == 'I') {

            objDelivery.CJREMETE = objDelivery.CJDESTIN;
            objDelivery.IEREMETE = objDelivery.IEDESTIN;
            objDelivery.NRSAPRE = objDelivery.NRSAPDE;
            objDelivery.NRCEPRE = objDelivery.NRCEPDE;
            objDelivery.NMCLIRE = objDelivery.NMCLIDE;
            objDelivery.NMCIDRE = objDelivery.NMCIDDE;
            objDelivery.NMESTRE = objDelivery.NMESTDE;
            objDelivery.NMPLAORI = objDelivery.NMPLADES;

        } */

        //if (objDelivery.hasOwnProperty('CDDELIVE')) {
        //objDelivery = ctlCom.formatDelivery(objDelivery);
        
        //}

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\ 

    api.deliveryItem = function (objDelivery, xmlDom) {

        objDelivery.item = [];

        var nodesItem = utilsCA.getXmlNodes(model.loopItem2, xmlDom);
        objDelivery = this.loopItem(objDelivery, xmlDom, nodesItem);

        if (objDelivery.item.length == 0) {
            objDelivery.arOcorrencia.push(utilsFMT.gerarOcorrencia(1, 'ITEM', 'Itens da Delivery não encontrados'));
        }

        return objDelivery;

    }

    api.deliveryItemInventario = function (objDelivery, xmlDom) {

        objDelivery.item = [];

        var nodesItem = utilsCA.getXmlNodes(modelInventory.loopItem2, xmlDom);
        objDelivery = this.loopItemInventory(objDelivery, xmlDom, nodesItem);

        if (objDelivery.item.length == 0) {
            objDelivery.arOcorrencia.push(utilsFMT.gerarOcorrencia(1, 'ITEM', 'Itens da Delivery não encontrados'));
        }

        return objDelivery;

    }

    //-----------------------------------------------------------------------\\

    api.loopItem = function (objDelivery, xmlDom, nodesItem) {

        for (var i in nodesItem) {

            var objItem = ctlCom.buscaNos(xmlDom, model.DI, i);

            if (objItem.arOcorrencia.length > 0) {
                objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objItem.arOcorrencia);
            }

            objDelivery.item.push(objItem);

        }

        return objDelivery;

    }


    //-----------------------------------------------------------------------\\

    api.loopItemInventory = function (objDelivery, xmlDom, nodesItem) {

        for (var i in nodesItem) {

            var objItem = ctlCom.buscaNos(xmlDom, modelInventory.DI, i);

            if (objItem.arOcorrencia.length > 0) {
                objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objItem.arOcorrencia);
            }

            objDelivery.item.push(objItem);

        }

        return objDelivery;

    }



    //-----------------------------------------------------------------------\\


    api.listarDelivery = async function (req, res, next) {

        console.log("teste");

        try {

            var lista = strDirDelivery;

            if(req.body.params.TIPO=="P"){
             lista =  process.env.FOLDER_PROCESSADOS; 
            }

            var arList = utilsDir.listFiles(`${lista}/`);
            var ini = req.body.pageNumber;
            var fim = req.body.size;
            if(ini != 0 ){
               ini = (req.body.pageNumber * req.body.size) + 1
               fim = (ini + req.body.size) - 1
            };

            var newList = arList.slice( ini, fim);

            var arFile = [];

            for (i of newList) {

                if (i.filename.toUpperCase() != ".DS_STORE") {

                    var objFile = {};
                    objFile.CDDELIVE = i.filename.split('-')[1];
                    objFile.FILENAME = i.filename;
                    objFile.size = i.size;
                    objFile.date = tmz.retornaData(i.birthtime, 'YYYY-MM-DD HH:mm:ss');

                    arFile.push(objFile);

                }

            }


            if (arFile.length) {
                arFile[0].COUNT_LINHA = arList.length;
            }


            res.send(utilsWare.formatDataGrid(arFile, req));

        } catch (err) {

            res.send({ status: "error", message: err.message });

        }


    }


    api.excluirDelivery = async function (req, res, next) {

        try {

            var dirDelivery = process.env.FOLDER_WAREHOUSE_MANUAL;

            for (let i = 0; i < req.body.length; i++) {

                var fullPath = dirDelivery + req.body[i];

                fs.unlink(fullPath, (err) => {
                    if (err) {
                        res.status(201).json({ status: 'error', message: 'falha ao excluir arquivo' });
                    } else {
                        res.status(201).json({ status: 'success', message: 'Delivery(ies) excluida(s) com sucesso' });
                    }
                })
            }

        } catch (error) {

            res.send({ status: "error", message: error.message });
        }

    }

    //=--==-=-=-= FIM FUNCOES =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    api.uploadDeliveries = async function (req, res, next) {

        /**
         * 400: Bad Request 
         * 400M001 : Empty or invalid request
         * 400M002 : Valid request but empty data
         */
        if (!req.files) {
            return res.status(400).send({ nrlogerr: -901, armensag: ['400', '400M001'] });
        }

        if (req.files.length === 0) {
            res.status(400).send({ nrlogerr: -901, armensag: ['400', '400M002'] });
        }

        let tempoAtualString = tmz.tempoAtual().replace(/:/gi, '-');
        var DirCanhoto = process.env.FOLDER_WAREHOUSE_MANUAL;

        for (let i = 0; i < req.files.length; i++) {
            let nomeArquivo = '';
            var name = req.files[i].originalname.split(".");
            if (name.length > 0) {
                var ext = name.length - 1;
                var extensao = name[ext];
            }
            nomeArquivo = name[0] + "-" + tempoAtualString + "." + extensao;
            var fullPath = DirCanhoto + nomeArquivo;

            fs.writeFile(fullPath, req.files[i].buffer, "binary", function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        res.status(200).json({ message: 'success' });

    }

    api.importarXml = async function (req, res, next) {
        try {
            var rs = {};
            var resp = [];

            for (var i of req.body) {

                objConn = await dao.controller.getConnection();

                var IDW002 = rs.IDW002;

/*                 if (rs.objConn) {
                    objConn = rs.objConn
                }

                i.objConn = objConn; */

                rs = await api.lerXmlDelivery(i);
                rs.IDS001 = req.headers.ids001 ? req.headers.ids001: 97;

                var xmlDelivery = rs;


                if (rs.tipo == "ZXWVINVE03_01") { //inventario
                    rs.objConn = objConn;
                    rs = await api.addXmlInventario(rs);
                    await rs.objConn.close();
                    utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/processados/inventarios/', nmArqOrigem: i});
                    resp.push({ status: "success", id: rs.id, message: `Inventário importado com sucesso!` })

                    rs.blOk = true;
                } else if (rs.tipo == "ZXDELVRY07_WH") { //delivery warehouse
                    var validarImportacao = await api.validarImportacao(rs);

                    parmDocNum = {}

                    parmDocNum.TPPROCES = rs.TPPROCES;
                    parmDocNum.CDOUBOUN = rs.CDOUBOUN;
                    parmDocNum.DOCNUM = rs.DOCNUM;
                    parmDocNum.objConn = objConn;

                    //var validarImportacaoDocNum = true;

                    //var validarImportacaoDocNum = await api.validarImportacaoDocNum(parmDocNum);

                    if (validarImportacao) {
                        rs.shipmentImport = '';
                        rs.IDW002 = IDW002;

                        rs.objConn = objConn;


                        if (rs.STATUALI == "DEL" || rs.STATUALI == "CAN") { //delivery cancelamento

                            var etapaDeliveryCancelamento = await dao.buscarDeliveryCancelamento(rs);

                            if (etapaDeliveryCancelamento[0].SNCANBRA == 1) {
                                rs.STETAPA = 7
                            } else {
                                rs.STETAPA = 6
                            }

                            await dao.cancelarDelivery(rs);

                            await rs.objConn.close();

                            utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/processados/deletadas/', nmArqOrigem: i});

                            resp.push({ status: "success", message: `Delivery  deletada com sucesso!` })

                        } else { // delivery normal

                            if (rs.blOk) {

                                rs.TPDELIVE = await api.verificarTp(rs);
                                rs.TPDELIVE = await api.verificarAg(rs);

                                if (!rs.NRNFREF || parseInt(rs.NRNFREF) == 0) {
                                    rs = await api.addXmlWarehouse(rs);


                                    ST = utilsWare.verificarStatusAtu(xmlDelivery.STATUALI, xmlDelivery.NRCHADOC, xmlDelivery.STNOTA, xmlDelivery.TPPROCES)
                                    TD = utilsWare.tpDelive(xmlDelivery.TPDELIVE)

                                    if (ST == 3 && xmlDelivery.TPPROCES == "O" && TD != 3 && TD != 4 && rs.IDW001 && rs.blOk) {
                                        parms = {};
                                        parms.body = {};
                                        parms.objConn = rs.objConn;
                                        parms.body.STRESERV = 1;
                                        parms.body.TPPROCES = 'O';
                                        parms.body.IDW001 = [rs.IDW001]

                                        await ctlCoockpit.reservarSaldoAutomatico(parms);
                                    }

                                } else {
                                    rs = await api.matchCompraIndustrial(rs);
                                }
                            }
                        }
                        await rs.objConn.close();
                        resp.push({ status: "success", id: rs.id, message: `A delivery ${rs.IDW001} foi importada com sucesso!` })
                    } else {

                        utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/nao_pertence/', nmArqOrigem: i});
                        resp.push({ status: "error", message: `A delivery não pertence ao warehouse!` })
                    }


                } else {

                    utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/nao_pertence/', nmArqOrigem: i});
                    resp.push({ status: "error", message: `O arquivo não possui um tipo conhecido` })
                }
            }
            if(!rs.objConn){
                rs.objConn = objConn;
            }

            await rs.objConn.close();
            
            res.status(201).send(resp);


        } catch (error) {

            if (rs && !rs.objConn) {
                rs.objConn = objConn;
                await rs.objConn.closeRollback();
            }

            utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/erros/', nmArqOrigem: i});

            
            res.status(201).send([{ status: "error", message: error.message }]);
        }
    }


    api.importarXmlCron = async function (req, res, next) {
        try {
            var rs = {};
            var resp = [];

            req.body = []

            var list = utilsDir.listFiles(`../xml/warehouse/manual/`);

            for (l of list){
               
                req.body.push(l.filename);
                
            }

            for (var i of req.body) {

                objConn = await dao.controller.getConnection();

                var IDW002 = rs.IDW002;

/*                 if (rs.objConn) {
                    objConn = rs.objConn
                }

                i.objConn = objConn; */

                rs = await api.lerXmlDelivery(i);
                rs.IDS001 = req.headers.ids001 ? req.headers.ids001: 97;

                var xmlDelivery = rs;


                if (rs.tipo == "ZXWVINVE03_01") { //inventario
                    rs.objConn = objConn;
                    rs = await api.addXmlInventario(rs);
                    await rs.objConn.close();
                    utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/processados/inventarios/', nmArqOrigem: i});
                    resp.push({ status: "success", id: rs.id, message: `Inventário importado com sucesso!` })

                    rs.blOk = true;
                } else if (rs.tipo == "ZXDELVRY07_WH") { //delivery warehouse
                    var validarImportacao = await api.validarImportacao(rs);

                    parmDocNum = {}

                    parmDocNum.TPPROCES = rs.TPPROCES;
                    parmDocNum.CDOUBOUN = rs.CDOUBOUN;
                    parmDocNum.DOCNUM = rs.DOCNUM;
                    parmDocNum.objConn = objConn;

                    //var validarImportacaoDocNum = true;

                    //var validarImportacaoDocNum = await api.validarImportacaoDocNum(parmDocNum);

                    if (validarImportacao) {
                        rs.shipmentImport = '';
                        rs.IDW002 = IDW002;

                        rs.objConn = objConn;


                        if (rs.STATUALI == "DEL" || rs.STATUALI == "CAN") { //delivery cancelamento

                            var etapaDeliveryCancelamento = await dao.buscarDeliveryCancelamento(rs);

                            if (etapaDeliveryCancelamento[0].SNCANBRA == 1) {
                                rs.STETAPA = 7
                            } else {
                                rs.STETAPA = 6
                            }

                            await dao.cancelarDelivery(rs);

                            await rs.objConn.close();

                            utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/processados/deletadas/', nmArqOrigem: i});

                            resp.push({ status: "success", message: `Delivery  deletada com sucesso!` })

                        } else { // delivery normal

                            if (rs.blOk) {

                                rs.TPDELIVE = await api.verificarTp(rs);
                                rs.TPDELIVE = await api.verificarAg(rs);

                                if (!rs.NRNFREF || parseInt(rs.NRNFREF) == 0) {
                                    rs = await api.addXmlWarehouse(rs);


                                    ST = utilsWare.verificarStatusAtu(xmlDelivery.STATUALI, xmlDelivery.NRCHADOC, xmlDelivery.STNOTA, xmlDelivery.TPPROCES)
                                    TD = utilsWare.tpDelive(xmlDelivery.TPDELIVE)

                                    if (ST == 3 && xmlDelivery.TPPROCES == "O" && TD != 3 && TD != 4 && rs.IDW001 && rs.blOk) {
                                        parms = {};
                                        parms.body = {};
                                        parms.objConn = rs.objConn;
                                        parms.body.STRESERV = 1;
                                        parms.body.TPPROCES = 'O';
                                        parms.body.IDW001 = [rs.IDW001]

                                        await ctlCoockpit.reservarSaldoAutomatico(parms);
                                    }

                                } else {
                                    rs = await api.matchCompraIndustrial(rs);
                                }
                            }
                        }
                        await rs.objConn.close();
                        resp.push({ status: "success", id: rs.id, message: `A delivery ${rs.IDW001} foi importada com sucesso!` })
                    } else {

                        utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/nao_pertence/', nmArqOrigem: i});
                        resp.push({ status: "error", message: `A delivery não pertence ao warehouse!` })
                    }


                } else {

                    utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/nao_pertence/', nmArqOrigem: i});
                    resp.push({ status: "error", message: `O arquivo não possui um tipo conhecido` })
                }
            }
            if(!rs.objConn){
                rs.objConn = objConn;
            }

            await rs.objConn.close();
            
            res.status(201).send(resp);


        } catch (error) {

            if (rs && !rs.objConn) {
                rs.objConn = objConn;
                await rs.objConn.closeRollback();
            }

            utilDir.moveFile({ dirOrigem: '../xml/warehouse/manual/', dirDestino: '../xml/warehouse/erros/', nmArqOrigem: i});

            
            res.status(201).send([{ status: "error", message: error.message }]);
        }
    }


    api.addXmlWarehouse = async function (req) {

        req.body = req;


        var rs = await api.importarShipment(req);

        if (rs.blOk) {
            req.body.IDW002 = rs.id;

            rs = await api.importarDelivery(req);

            if (rs.blOk) {

                req.body.IDW001 = rs.id;
                rs.statusNota = false;
                if (req.body.NRNOTA) {
                    var rs = await api.importarNf(req);
                    rs.statusNota = true;
                }

                if (rs.blOk) {

                    req.body.IDW004 = rs.id;

                    await dao.apagarItens(req);

                    for (var i of req.body.item) {
                        i.IDW001 = req.body.IDW001;
                        i.IDW004 = req.body.IDW004
                        i.objConn = req.objConn;
                        i.statusNota = rs.statusNota;
                        i.IDS001 = req.body.IDS001;
                        await api.importarItem(i);
                    }

                    //****temporário**********************************************************************************************/
                    var strOcorrencia = `nome do arquivo: ${req.body.filename} \n \n`

                    for (k of req.body.arOcorrencia) {
                        strOcorrencia = `${strOcorrencia} Campo: ${k.NMCAMPO} OBS: ${k.OBOCORRE} \n \n`
                    }

                    var dtAtual = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
                    await utilsCA.salvarArquivo(`../xml/warehouse/ocorrencia/${req.body.filename}-${dtAtual}.txt`, strOcorrencia);

                    //****Mover Arquivo*********************************************************************************************/

                    var destino = process.env.FOLDER_PROCESSADOS;
                    var origem = process.env.FOLDER_WAREHOUSE;

                    if (!utilsDir.existsPath(`${origem}${req.body.filename}`)) { //reimportar processados
                        origem = `../xml/warehouse/manual/`
                    }



                    utilDir.moveFile({ dirOrigem: origem, dirDestino: destino, nmArqOrigem: req.body.filename });

                } //IDW004
            } //IDW003
        } //IDW002
        rs.objConn = req.objConn

        rs.IDW002 = req.body.IDW002;
        rs.IDW001 = req.body.IDW001;
        return rs

    }

    api.importarShipment = async function (req) {

        if(req.CDSHIPME == "NO4PL"){
            req.CDSHIPME = `AG${req.CDOUBOUN}`;
        }

        var params = await utilsWare.validarSchema(req.body, schema.shipment.columns);
        params.objConn = req.objConn;

        var id;
        var rs = await dao.buscarShipment({ body: params });

        if (rs.length) {
            if (rs.length > 1) {
                return {
                    blOk: false,
                    message: `O Shipment: ${req.body.CDSHIPME} está duplicado. Favor entre em contato com o suporte`
                }
            } else {
                req.body.IDW002 = rs[0].IDW002;
                await dao.updateShipment(req);
                id = req.body.IDW002;
            }

        } else {

            var IDW002 = await dao.importarShipment(req);
            id = IDW002.id
        }

        return { blOk: true, id }
    }

    api.importarDelivery = async function (req) {

        var params = await utilsWare.validarSchema(req.body, schema.delivery.columns);
        params.objConn = req.objConn;

        var id;
        var rs = await dao.buscarDelivery({ body: params });

        if (rs.length) {
            if (rs.length > 1) {
                var delivery = req.body.TPPROCES == 'O' ? req.body.CDOUBOUN : req.body.CDINBOUN
                return {
                    blOk: false,
                    message: `A Delivery: ${delivery} está duplicada. Favor entre em contato com o suporte`
                }
            } else {

                req.body.ULTETAPA = rs[0].STETAPA;
                req.body.IDW001 = rs[0].IDW001;
                await dao.updateDelivery(req);
                id = req.body.IDW001;
            }

        } else {
            var IDW001 = await dao.importarDelivery(req);
            id = IDW001.id
        }

        return { blOk: true, id }
    }

    api.importarNf = async function (req) {

        var params = await utilsWare.validarSchema(req.body, schema.notaFiscal.columns);
        params.IDW001 = req.body.IDW001;

        var id;

        var rs = await dao.buscarNf({ body: params });

        if (rs.length) {
            if (rs.length > 1) {
                return {
                    blOk: false,
                    message: `A NF: ${req.body.NRNOTA} está duplicada. Favor entre em contato com o suporte`
                }
            } else {
                req.body.IDW004 = rs[0].IDW004;
                await dao.updateNf(req);
                id = req.body.IDW004;
            }

        } else {
            var IDW004 = await dao.importarNf(req);
            id = IDW004.id
        }

        return { blOk: true, id }
    }

    api.importarItem = async function (req) {

        var params = await utilsWare.validarSchema(req, schema.item.columns);
        params.objConn = req.objConn;

        params.IDW001 = req.IDW001;
        params.IDW004 = req.IDW004;

        var id;
        var rs = await dao.buscarItem({ body: params });

        if (rs.length) {
            if (rs.length > 1) {
                return {
                    blOk: false,
                    message: `O item: ${req.body.CDMATERI}  está duplicado. Favor entre em contato com o suporte`
                }
            } else {
                req.IDW003 = rs[0].IDW003;
                await dao.updateItem(req);
                id = req.IDW003;
            }

        } else {
            var IDW003 = await dao.importarItem(req);
            id = IDW003.id
        }

        return { blOk: true, id }
    }

    api.downloadDelivery = function (req, res, next) {

        var file = req.params.file;
        var folder = process.env.FOLDER_WAREHOUSE_MANUAL;

        if (utilsDir.existsPath(`${folder}${file}`)) {
            res.sendFile(file, { root: folder });
        } else {
            res.status(500).send({ erro: 'Arquivo não encontrado' });
        }
    }

    api.downloadDeliveryProcessada = function (req, res, next) {

        var file = req.params.file;
        var folder = process.env.FOLDER_PROCESSADOS;

        if (utilsDir.existsPath(`${folder}${file}`)) {
            res.sendFile(file, { root: folder });
        } else {
            res.status(500).send({ erro: 'Arquivo não encontrado' });
        }
    }

    api.addXmlInventario = async function (req) {

        req.body = req;

        var IDW007 = await dao.importarInventario(req);

        if (IDW007) {
            req.body.IDW007 = IDW007.id;

            for(var i of req.body.item){

                i.objConn = req.objConn;
                i.IDW007 = req.body.IDW007
                rs = await dao.importarItemInventario(i);
            }
        } 
        rs.objConn = req.objConn

        return rs

    }

    api.validarImportacao = async function (req) {

        if((req.item[0].NMPLAORI == 'BR25' && req.item[0].NMSTOLOC != 'SL75') || (req.NMPLADES == 'BR25' && req.item[0].NMSTOLOC == undefined )){
            return false
        } else {
            return true
        }
    }

    api.validarImportacaoDocNum = async function (req) {

        var docNum = await dao.validarImportacaoDocNum(req);

        if(docNum.length > 0 && docNum[0].DOCNUM != undefined){
            if(parseInt(req.DOCNUM) <= parseInt(docNum[0].DOCNUM)){

                return false;
            } else {
                return true;
            }

        } else { //primeira entrada
            return true;
        }



        



    }


    api.matchCompraIndustrial = async function (req) {

        req.body = req;

        var compraIndustrial = await dao.buscarCompraIndustrial(req);

        req.body.IDW001 = compraIndustrial[0].IDW001;
        req.body.IDW002 = compraIndustrial[0].IDW002;
        req.body.IDW003 = compraIndustrial[0].IDW003;
        req.body.IDW004 = compraIndustrial[0].IDW004;

        await dao.updateShipmentMatch(req);
        await dao.updateDelivery(req);

        for (i of req.item){
            i.objConn = req.objConn;
            i.IDW003 = req.body.IDW003;
            i.IDW001 = req.body.IDW001;
            await dao.updateItem(i);
        }
        
        
        await dao.updateNfMatch(req);


        rs = req;
        rs.blOk = true;


        return rs

    }


    api.renomearXmlsSoap = async function (req, res) {
        var result = '';
        xmlDom = utilsCA.getXmlDom(req.xml);
        objDelivery = api.deliveryHeaderRenomear(xmlDom);

        console.log(objDelivery);

        result = `${objDelivery.TIPO}-${objDelivery.IDENTIFICADOR}-${objDelivery.CATEGORIA}`
        
        if (!result){ //caso ocorra um erro ao renomear
            result = req.nome;
        }
        return result  
        

    }


    api.deliveryHeaderRenomear = function (xmlDom) {
        objReturn ={}

        objReturn.IDENTIFICADOR = '';
        objReturn.CATEGORIA = '';

        switch (xmlDom.documentElement.nodeName) {

            case "ZXDELVRY07_WH":
                var objDelivery = ctlCom.buscaNos(xmlDom, model.DH, 0);
                objDelivery = this.deliveryItem(objDelivery, xmlDom);

                objReturn.TIPO = "WH";
                objReturn.IDENTIFICADOR = objDelivery.CDOUBOUN;
                objReturn.CATEGORIA = objDelivery.TPPROCES;
                break
            case "ZXWVINVE03_01":
                var objDelivery = ctlCom.buscaNos(xmlDom, modelInventory.DH, 0);
                objDelivery = this.deliveryItemInventario(objDelivery, xmlDom);

                objReturn.TIPO = "IV";
                objReturn.IDENTIFICADOR = objDelivery.NRDOCUME;
                break

            case "Shipment":
                    objReturn.TIPO = "LS";
                    break
            default:
                objReturn.TIPO = "ND";
        } 
        

        return objReturn;

    }

    api.saveDelivery = async function (req, res, next) {  // digitalizar deliveries
    
        try { 

            var objConn = await dao.controller.getConnection();

            var parm = 
            {
                objConn,               
                TPDOCUME:   'WAR',
                DSMIMETP:   'application/xml',
                IDS001:     req.IDS001,                
                IDS007:     req.IDS007,
                PKS007:     req.PKS007,
                NMDOCUME:   req.NMDOCUME,
                buffer:     req.buffer
            };
            
            var IDG082 = await mDoc.saveDoc(parm, res, next);

            await objConn.close();

            return IDG082;



        } catch (err) { 

            await rs.objConn.closeRollback();
    
            throw err; 
    
        } 
    
    }

    api.listDeliveries = async function (req, res, next) { //listar deliveries
        try { 

            var objConn = await dao.controller.getConnection();
            
            var rs = await dao.listDeliveries(req);

            for (var i of rs){
                let filename = i.FILENAME.split('-') 
                i.CDDELIVE = filename[1];
                i.TPPROCES = filename[2].split('.')[0];;
            }

            await objConn.close();

            res.send(utilsWare.formatDataGrid(rs, req));


        } catch (err) { 
    
            throw err; 
    
        } 


    }

    api.getXmlDeliveryToString = async function (req, res, next) { // 
        
        try {

            req.objConn = await dao.controller.getConnection();
            
            var rs = await dao.getXmlDeliveryToString(req);

            await req.objConn.close();

            var fileContents = Buffer.from(rs[0].CTDOCUME, 'base64').toString();
            console.log(fileContents);

            return fileContents;

            //var readStream = new stream.PassThrough();
            //readStream.end(fileContents);

            //res.set('Content-disposition', 'attachment; filename=' + rs[0].NMDOCUME);
            //res.set('Content-Type', rs[0].DSMIMETP);

            //readStream.pipe(res);
    
            
        } catch (error) {

            console.log(error);
            
        }


    }

    api.listarDeliveryManual = async function (req, res, next) {

        try {

            var lista = strDirDelivery;

            if(req.body.params.TIPO=="P"){
             lista =  process.env.FOLDER_PROCESSADOS; 
            }

            var arList = utilsDir.listFiles(`${lista}/`);
            var ini = req.body.pageNumber;
            var fim = req.body.size;
            if(ini != 0 ){
               ini = (req.body.pageNumber * req.body.size) + 1
               fim = (ini + req.body.size) - 1
            };

            var newList = arList.slice( ini, fim);

            var arFile = [];

            for (i of newList) {

                if (i.filename.toUpperCase() != ".DS_STORE") {

                    var objFile = {};
                    objFile.CDDELIVE = i.filename.split('-')[1];
                    objFile.FILENAME = i.filename;
                    objFile.size = i.size;
                    objFile.date = tmz.retornaData(i.birthtime, 'YYYY-MM-DD HH:mm:ss');

                    arFile.push(objFile);

                }

            }


            if (arFile.length) {
                arFile[0].COUNT_LINHA = arList.length;
            }


            res.send(utilsWare.formatDataGrid(arFile, req));

        } catch (err) {

            res.send({ status: "error", message: err.message });

        }

    }

    api.verificarTp = async function (req) {
        

        if(
            (req.CDPLAFOR == 'BR25' &&  req.CDARMFOR == 'SL75' &&  req.item[0].NMPLAORI == 'BR49') ||
            (req.CDPLAFOR  == 'BR49' && req.item[0].NMPLAORI == 'BR25' &&  req.item[0].NMSTOLOC == 'SL75')
        ) {
            return 'TP'
        } else {
            return req.TPDELIVE;
        }

    }

    api.verificarAg = async function (req) {
        

        if(req.NMCLIAG) {
            return 'AG'
        } else {
            return req.TPDELIVE;
        }

    }

    api.loginSoap = async function (header, rota) {

        if (!!rota & rota == 'b') { 
            var cert = "Basic " + new Buffer(process.env.SAP_BRAVO_USER + ":" + process.env.SAP_BRAVO_PASS).toString("base64");
            if (header.authorization == cert) {
                return true;
            }

        } else {
            
            var cert = "Basic " + new Buffer(process.env.SAP_SYN_USER_SOAP + ":" + process.env.SAP_SYN_PASS).toString("base64");
            if (header.authorization == cert) {
                return true;
            }

        }

        return false;

    }

    api.importDocSap = async function(args, req) {

    try {
        var xml;
        var dateNow = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');

        var auth_soap = parseInt(process.env.AUTH_SOAP);

        var auth = (auth_soap) ? false : true; //mudar para false

        if (auth_soap == 1) {
            auth = await api.loginSoap(req.headers, 's');
      }

      if (auth) {
        if (args.DeliveryXML.$value) {
          xml = args.DeliveryXML.$value;
        } else {
          xml = args.DeliveryXML;
        }

        var dt = moment().format("YYYYMMDDHHmmSS");

        var nome = moment().format("YYYYMMDDHHmmSS");
        
        nome = await api.renomearXmlsSoap({ xml, nome });

        fs.writeFileSync(`../xml/warehouse/manual/${nome}-${dt}.xml`, xml);
        req = {};
        req.body = {};
        req.body.filename = `${nome}.xml`;

        //log
        var log = `${dateNow} - Arquivo => ${nome} recebido com sucesso  \r`;
        
        fs.writeFile(`../xml/warehouse/logs/log_iwhc.txt`, log, { enconding: 'utf-8', flag: 'a' },
        function (err) {
            if (err) throw err;
            //console.log('Arquivo de Log salvo! - Iwhc');
        });

        
        return { return: "Delivery recebida com sucesso" };

      } else{

        var log = `${dateNow} - Usuário e senha incorreto, arquivo não recebido \r`;

        fs.writeFile(`../xml/warehouse/logs/log_iwhc.txt`, log, {enconding:'utf-8',flag: 'a'},
        function (err) {
            if (err) throw err;
            //console.log('Arquivo de Log salvo! - Iwhc');
        });


         return { return: 'Usuário ou Senha incorretos' };

      }
        
    } catch (error) {

       var log = `${dateNow} - arquivo não pertence ao Warehouse \r`;

        fs.writeFile(`../xml/warehouse/logs/log_iwhc.txt`, log, {enconding:'utf-8',flag: 'a'},
        function (err) {
            if (err) throw err;
            //console.log('Arquivo de Log salvo! - Iwhc');
        });



        
        return { return: 'A delivery foi recebida, mas não foi processada' };
    }

      

    };



    return api;

};