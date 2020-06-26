/**
 * @module modDelivery/controllers/DeliveryController
 * 
 * @requires modDelivery/controllers/DeliveryClass
 * @requires modDelivery/models/DeliveryModel
 * @requires modDelivery/dao/DeliveryDAO
 * @requires global/dao/GenericDAO
 * @requires config/logger
 * 
 * @requires utils/Formatador
 * @requires utils/Utils
 * @requires utils/DataAtual
*/
module.exports = function (app, cb) {

    const logger   = app.config.logger;

    const utils    = app.src.utils.Formatador;
    const utilsDir = app.src.utils.Diretorio;
	const tmz 	   = app.src.utils.DataAtual;
        
    const mdl      = app.src.modDelivery.models.DeliveryModel;
    const mdo      = app.src.modOferece.models.ViagemModel;
    const ndc      = app.src.modDelivery.controllers.DeliveryClass;
    const ctn      = app.src.modDelivery.controllers.ContingenciaController;
    const sctl     = app.src.modDelivery.controllers.CargaController;
    const cli      = app.src.modDelivery.controllers.ClienteController;
    
    const dao 	   = app.src.modDelivery.dao.DeliveryDAO;
    const cdao 	   = app.src.modDelivery.dao.CargaDAO;
    const gdao     = app.src.modGlobal.dao.GenericDAO;        
    const fldAdd   = app.src.modGlobal.controllers.XFieldAddController;

    const dirIn    = process.env.FOLDER_DOWNLOAD;
    const dirCtgy  = process.env.FOLDER_CONTINGENCY;
    const dirOut   = process.env.FOLDER_STORE;
    const dirSave  = process.env.FOLDER_SAVE;

    var api = {};
   
    //-----------------------------------------------------------------------\\ 
    /**
        * @description Lista as ocorrências na importação de Delivery
        *
        * @async 
        * @function listaOcorrencia			
        * @param    {Object} req Parâmetros da pesquisa
        * 
        * @see      {@link module:modDelivery/dao/DeliveryDAO~listarOcorrencias}
        * 
        * @returns  {Array} Retorna um array com o resultado da pesquisa
        * @throws   {Array} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\  

	api.listaOcorrencias = async function (req, res, next) {

        var objResult = await dao.listarOcorrencias(req, res, next).catch((err) => { next(err) });
        res.status(200).send(objResult);

    }

    //-----------------------------------------------------------------------\\  

    api.cancelarOcorrencia = async function (req, res, next) {

        var objResult = await dao.cancelarOcorrencia(req, res, next)
        .catch((err) => { 
            throw err;
        });

        res.status(200).send({result : objResult});
      }
    
    //-----------------------------------------------------------------------\\  
    /**
        * @description Lista os arquivos que entraram na rotina de importação 
        *
        * @async 
        * @function listaImportacao
        * @param    {Object} req Parâmetros da pesquisa
        * 
        * @see      {@link module:modDelivery/dao/DeliveryDAO~listarImportacao}
        * 
        * @returns  {Array} Retorna um array com o resultado da pesquisa
        * @throws   {Array} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\  

	api.listaImportacao = async function (req, res, next) {

        var objResult = await dao.listarImportacao(req, res, next).catch((err) => { next(err) });
        res.status(200).send(objResult);

    }
    
    //-----------------------------------------------------------------------\\     
    /**
        * @description Retorna dados sobre o embarque da Delivery
        *
        * @async 
        * @function listaEntrega			
        * @param    {Object} req Parâmetros da pesquisa
        * 
        * @see      {@link module:modDelivery/dao/DeliveryDAO~listarEntrega}
        * 
        * @returns  {Array} Retorna um array com o resultado da pesquisa
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

	api.listaEntrega = async function (req, res, next) {

        var objResult = await dao.listarEntrega(req, res, next).catch((err) => { next(err) });
        res.status(200).send(objResult);

    }
    
    //-----------------------------------------------------------------------\\  
    /**
        * @description Importa os arquivos XML das Deliveries listadas na Dashboard 
        *
        * @async 
        * @function importaDelivery			
        * @param    {Object} req
        * @param    {Object} req.body
        * @param    {Array}  req.body.files Arquivos a serem importados
        * 
        * @requires module:modDelivery/controllers/DeliveryController~gravaDelivery
        * 
        * @returns  {Array} Retorna um array com o resultado da pesquisa
        * @throws   {status(500) | Object} Nenhum arquivo selecionado
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\
    
	api.importaDelivery = async function (req, res, next) {		

        try {

            if ((Array.isArray(req.body.files)) && 
                (req.body.files.length > 0) && 
                (req.body.hasOwnProperty('dir'))) {

                var parm  = { arFiles: req.body.files, IDS001: req.body.usuario };
                parm.tipo = (req.body.dir.toUpperCase() == 'DOWNLOAD') ? 'GTN' : 'SAP';
                
                var objResult = await api.gravaDelivery(parm, res, next);                
                objResult.ttReg = req.body.files.length;                

            } else {

                var objResult = { ttReg: 0, ttCommit: 0 };
                objResult.arOcorrencia = ['Nenhum arquivo selecionado'];

            }

            var cdStatus = ((objResult.ttReg == objResult.ttCommit) && (objResult.ttCommit > 0)) ? 200 : 500;

            res.status(cdStatus).send(objResult);

        } catch (err) {

            //next(err);
            res.status(500).send(err);
            
        }
	}

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Parametriza, valida, registra e salva os dados das Deliveries
        *
        * @async 
        * @function gravaDelivery	
        * @param    {Array}  req.arFiles Arquivos XML
        * 
        * @requires module:globa/dao/GenericDAO~getConnection
        * @requires module:modDelivery/controllers/DeliveryClass~lerXMLDelivery
        * @requires module:modDelivery/controllers/DeliveryController~insereImportacao
        * @requires module:modDelivery/controllers/DeliveryController~buscarDadosDelivery
        * @requires module:modDelivery/controllers/DeliveryController~salvaDelivery
        * @requires module:modDelivery/controllers/DeliveryController~removeOcorrencias
        * @requires module:modDelivery/controllers/DeliveryController~insereOcorrencias
        * @requires module:modDelivery/controllers/DeliveryController~removeImportacao
        * @requires module:modDelivery/controllers/DeliveryController~moveArquivos
        * 
        * @returns  {Object} Retorna um objeto com o resultado da importação
        * @throws   {string} O arquivo possui formato inválido ou ocorrências
        *
        * @author   Rafael Delfino Calzado
        * @since    03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.gravaDelivery = async function(req, res, next) {

        try {

            var arOcorrencia = [];
            var ttCommit = 0;
    
            for (var file of req.arFiles) {
                
                var parm = { filename: file };

                if (req.tipo == 'GTN') {

                   parm.dir = dirIn;
                   var objDelivery = ndc.lerXMLDelivery(parm, res, next);

                } else {

                   parm.dir = dirCtgy;
                   var objDelivery = ctn.lerXMLContingencia(parm, res, next);

                }

                if (objDelivery.hasOwnProperty('CDDELIVE')) {
    
                    objDelivery.IDS001  = parseInt(req.IDS001);
                    objDelivery.objConn = await gdao.controller.getConnection();
    
                    //INSERE REGISTRO DE IMPORTAÇÃO
                    await this.insereImportacao(objDelivery, res, next)
    
                    .then(async () => {
    
                        if (objDelivery.arOcorrencia.length == 0) {
                            objDelivery = await this.salvaDelivery(objDelivery, res, next);

                            if (objDelivery.arOcorrencia.length == 0) {

                                await objDelivery.objConn.close();
                                ttCommit++;

                            } else {

                                await objDelivery.objConn.closeRollback();

                            }    

                        }
    
                        //REGISTRO DE OCORRÊNCIAS
                        await this.removeOcorrencias(objDelivery, res, next);
    
                        if (objDelivery.arOcorrencia.length > 0) {
    
                            await this.insereOcorrencias(objDelivery, res, next);
                            arOcorrencia.push(`A Delivery ${objDelivery.CDDELIVE} possui ${objDelivery.arOcorrencia.length} ocorrência(s).`);
    
                        }
    
                        //REMOVE REGISTRO DE IMPORTAÇÃO
                        await this.removeImportacao(objDelivery, res, next);
                        
                        parm.CDDELIVE = objDelivery.CDDELIVE;
                        await this.moveArquivos(parm, res, next);
                        await objDelivery.objConn.close();
    
                    });
    
                } else {
    
                    arOcorrencia.push(`O arquivo ${file} possui formato inválido`);
    
                }
    
            }
    
            return { ttCommit, arOcorrencia };

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Move os arquivos importadas para as pastas estabelecidas
        *
        * @async 
        * @function moveArquivos
        * @param    {Object} req			
        * @param    {string} req.filename Nome do arquivo XML
        * @param    {string} req.CDDELIVE Código da delivery
        * 
        * @see      dirSave - Diretório para salvar o backup mais recente do arquivo
        * @see      dirIn   - Diretório para fazer o download do arquivo
        * @see      dirOut  - Diretório para salvar a delivery
        * 
        * @requires module:utils/DataAtual
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.moveArquivos = async function (req, res, next) {        

        try {

            var dtAtual = tmz.tempoAtual('YYYYMMDDHHmmss');

            var objFile = 
                {
                    dirOrigem:      req.dir,
                    dirDestino:     dirSave,
                    nmArqOrigem:    req.filename,
                    nmArqDestino:   `delivery-${req.CDDELIVE}.xml`
                };
    
            await utilsDir.copyFile(objFile, res, next); 
            
            objFile.dirDestino   = dirOut;
            objFile.nmArqDestino = `delivery-${req.CDDELIVE}-${dtAtual}.xml`;
    
            await utilsDir.moveFile(objFile, res, next);
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Registra a importação em andamento
        *
        * @async 
        * @function insereImportacao			
        * @param    {Object} objDelivery
        * @param    {string} objDelivery.CDDELIVE Código da delivert
        * @param    {string} objDelivery.filename Nome do arquivo XML
        * @param    {Object} objDelivery.objConn  Objeto contendo os dados para conexão do banco de dados 
        * 
        * @requires module:utils/DataAtual
        * @requires module:utils/Formatador
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.insereImportacao = async function (objDelivery, res, next) {
        
        logger.debug(`Inserindo registro de importação - Delivery: ${objDelivery.CDDELIVE}`);

        var objImporta = 
            {
                  CDDELIVE: objDelivery.CDDELIVE
                , NMARQUIV: objDelivery.filename
                , DTCADAST: tmz.dataAtualJS()
            };
        
        var objI = utils.setSchema(mdl.I012, objImporta);
        objI.objConn = objDelivery.objConn;

        if (utils.validateSchema(objI)) {

            await gdao.controller.setConnection(objI.objConn);            
            await gdao.inserir(objI, res, next).catch((err) => { throw (err) });

        }

    }

    //-----------------------------------------------------------------------\\    
    /**
     * @description Remove o registro de importação ao final da importação da Delivery
     *
     * @async 
     * @function removeImportacao			
     * @param  {Object} objDelivery
     * @param  {string} objDelivery.CDDELIVE Código da Delivery
     * 
     * @throws {Object} Retorna a descrição do erro
     *
     * @requires module:global/dao/GenericDAO
     * @requires module:config/logger
     *
     * @author Rafael Delfino Calzado
     * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.removeImportacao = async function (objDelivery, res, next) {

        logger.debug(`Removendo registro de importação - Delivery: ${objDelivery.CDDELIVE}`);

        var strKey = 'CDDELIVE';

        var objImporta     = { SNDELETE: 1 };
        objImporta[strKey] = `'${objDelivery[strKey]}'`;

        var objSchema   = Object.assign({}, mdl.I012);
        objSchema.key   = [strKey];
        
        objImporta = utils.setSchema(objSchema, objImporta);

        objImporta.objConn  = objDelivery.objConn;
        await gdao.controller.setConnection(objImporta.objConn);

        await gdao.alterar(objImporta, res, next).catch((err) => { throw (err) });

        logger.debug(`Delivery ${objDelivery.CDDELIVE} importada`);        

    }

    //-----------------------------------------------------------------------\\    
    /**
        * @description Verifica e registra os dados da Delivery
        *
        * @async 
        * @function salvaDelivery
        * @param    {Object}    objDelivery
        * @param    {string}    objDelivery.CDDELIVE        Código da Delivery
        * @param    {Object}    objDelivery.objConn         Contém os dados para conexão com o banco de dados
        * @param    {number}    objDelivery.IDG043          ID da delivery
        * @param    {string(1)} objDelivery.STDELIVE        Status da delivery (Create, Delete, Replace)
        * 
        * @requires module:modDelivery/dao/DeliveryDAO~buscarDelivery 
        * @requires module:modDelivery/controller/DeliveryController~verificaAlteracao
        * @requires module:modDelivery/controller/DeliveryController~removeRegistros
        * @requires module:modDelivery/controller/DeliveryController~salvaDeliveryHeader
        * @requires module:modDelivery/controller/DeliveryController~insereEvento
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * 
        * @returns  {Object}    Retorna um objeto com os dados da Delivery
        * @throws   {Object}     Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.salvaDelivery = async function (objDelivery, res, next) {

        try {

            objDelivery = await this.buscarDadosDelivery(objDelivery, res, next);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            if (objDelivery.arOcorrencia.length == 0) {
    
                logger.debug(`Buscando dados prévios - Delivery: ${objDelivery.CDDELIVE}`);
    
                await gdao.controller.setConnection(objDelivery.objConn);
                var rs = await dao.buscarDelivery(objDelivery, res, next);

                var objCarga = null;
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                if (rs.length == 0) {
    
                    var blEtapaLimite = false;
                    objDelivery.DTLANCTO = tmz.dataAtualJS();
                    objDelivery.CDPRIINI = objDelivery.CDPRIORI;

                    if ((objDelivery.TPDELIVE == 3) && (objDelivery.tpFlag === undefined)) {

                        logger.debug(`Buscando Carga de Referência - Delivery #${objDelivery.IDG043RF}`);

                        await gdao.controller.setConnection(objDelivery.objConn);
                        var arDados = await cdao.buscarDadosCarga(objDelivery, res, next);

                        if (arDados.length == 0) {

                            objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, 'CARGA', 'Carga de referência não encontrada', objDelivery.CDFILIAL));

                        } else {

                            var objDados = arDados[0];
                            objDados.IDS001 = objDelivery.IDS001;
                            objDelivery.NRPROTOC = objDados.NRPROTOC;
                            
                            var objCarga = sctl.montarObjCarga(objDados, res, next);
                            var objVal   = utils.checaEsquema(objCarga, mdo.carga.columns);

                            if (!objVal.blOK)
                                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, 'CARGA', `Informações da carga estão incompletas - ${objVal.strErro}`, objDelivery.CDFILIAL));

                        }
    
                    }

                } else { 
    
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                    objDelivery.IDG043   = rs[0].ID;
                    objDelivery.IDG005RE = rs[0].IDG005RE;
                    objDelivery.IDG005DE = rs[0].IDG005DE;
                    objDelivery.IDG009PS = rs[0].IDG009PS;
                    objDelivery.STETAPA  = (rs[0].STETAPA == 6) ? rs[0].STULTETA : rs[0].STETAPA;
                    objDelivery.STULTETA = objDelivery.STETAPA;
    
                     //Etapa limite para alteração de dados
    
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                    switch (objDelivery.TPDELIVE) {
    
                        case 3: //Devolução                    
                            var blBackLog = [20,25,7].includes(objDelivery.STETAPA);
                            var blEtapaLimite = false;
                            break;
    
                        case 4: //Recusa
                            var blBackLog = [24,25].includes(objDelivery.STETAPA);
                            var blEtapaLimite = false;
                            break;
    
                        default:
                            var blBackLog = [0,1,7].includes(objDelivery.STETAPA);
                            var blEtapaLimite = [5,8].includes(objDelivery.STETAPA);
                            break;
                    }
    
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                     if (objDelivery.STDELIVE == 'D') { // Cancelamento

                        if (blBackLog)
                            objDelivery.STETAPA = (objDelivery.STETAPA == 7) ? 8 : 7;
                        else 
                            objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, 'Cancelamento', `Não é possível cancelar Delivery na Etapa ${objDelivery.STETAPA}`, objDelivery.CDFILIAL));
    
                    } else if (!blBackLog) {
    
                        objDelivery = this.verificaAlteracao(objDelivery, rs[0]);
                        if (objDelivery.arOcorrencia.length > 0) objDelivery.STETAPA = 6;
    
                    }
            
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                }        
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
                if (!blEtapaLimite) {
    
                    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                    // Salvar registros
    
                    if ((objDelivery.arOcorrencia.length == 0) || (objDelivery.hasOwnProperty('IDG043')))
                        objDelivery = await this.salvaDeliveryHeader(objDelivery, res, next);
    
                    if ((objDelivery.arOcorrencia.length == 0) && (objDelivery.hasOwnProperty('IDG043'))) {
    
                        await this.salvaAdicionaisDH(objDelivery, res, next);
                        await this.salvaDeliveryItem(objDelivery, res, next);
                        await this.insereEvento(objDelivery, res, next);

                        if (objCarga !== null)  {
                            
                            await cdao.insereContatoCliente(objDelivery, res, next);

                            objCarga.etapa[0].pedido[0].IDG043 = objDelivery.IDG043;

                            var parm = {};
                            parm.objConn  = objDelivery.objConn;
                            parm.IDG043   = objDelivery.IDG043;
                            parm.IDG043RF = objDelivery.IDG043RF;
                            parm.arDados  = [objCarga];

                            logger.debug(`Inserindo Carga - Delivery #${objDelivery.IDG043}`);
                            var objResult = await sctl.insereCarga(parm, res, next);

                            if (objResult.blOK) {

                                parm = { objConn: objDelivery.objConn };
                                parm.IDG046  = objDados.IDG046;
                                parm.IDG046N = objResult.IDG046;

                                await cdao.insereOferecimento(parm, res, next);

                                //Falta adequação
                                //objResult = await sctl.geraCanhoto(parm, res, next);

                                //if (!objResult.blOK)
                                //    objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, 'POD', `Erro: ${objResult.strMsg}`));

                            } else {

                                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, 'CARGA', 'Não foi possível inserir a carga', objDelivery.CDFILIAL));

                            }

                        }
    
                    }
                    
                }
    
                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                
            }
    
            return objDelivery;
    

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\  
    /**
        * @description Insere o evento de recebimento da Delivery
        *
        * @async 
        * @function insereEvento		
        * @param    {Object} objDelivery        Parâmetros da pesquisa
        * @param    {number} objDelivery.IDG043 ID da delivery
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:utils/DataAtual
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.insereEvento = async function (objDelivery, res, next) {

        var objTmp = 
            {
                  IDI001:   1   //Recebimento da Delivery
                , IDG043:   objDelivery.IDG043
                , DTEVENTO: tmz.dataAtualJS()                    
            }

        var objEvento = utils.setSchema(mdl.I008, objTmp);
    
        if (utils.validateSchema(objEvento)) {

            await gdao.controller.setConnection(objDelivery.objConn);
            objEvento.objConn = objDelivery.objConn;

            await gdao.inserir(objEvento, res, next).catch((err) => { throw (err) });

        }

    }
    
    //-----------------------------------------------------------------------\\
    /**
        * @description Salva os dados do Cabeçalho da Delivery

        * @async 
        * @function salvaDeliveryHeader
        * @param    {Object} objDelivery
        * @param    {Object} objDelivery.objConn    Conexão como banco de dados
        * @param    {number} objDelivery.IDG043     ID da delivery
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * 
        * @returns  {number} Retorna o ID da tabela G043
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.salvaDeliveryHeader = async function (objDelivery, res, next) {
        
        try {

            var strAcao = '';

            var objVal = utils.checaEsquema(objDelivery, mdl.G043.columns);
    
            if (objVal.blOK) {
    
                var objD = utils.setSchema(mdl.G043, objDelivery);
    
                delete objD.vlFields.item;
    
                objD.objConn = objDelivery.objConn;
                await gdao.controller.setConnection(objD.objConn);            
    
                if (objD.vlKey.hasOwnProperty('IDG043')) { //UPDATE
    
                    await gdao.alterar(objD, res, next);
                    strAcao = 'atualizado';
    
                } else { //INSERT
    
                    await gdao.inserir(objD, res,next)
    
                    .then(async (result) => {
    
                        strAcao = 'inserido';
                        objDelivery.IDG043 = result.id;
    
                    });
    
                }
    
                logger.debug(`Header ${strAcao} - ID #${objDelivery.IDG043}`);
    
            } else {
    
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, 'CHECKHEADER', objVal.strErro, objDelivery.CDFILIAL));
    
            }

            return objDelivery;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Salva os Itens contidos na Delivery
     *
     * @async 
     * @function salvaDeliveryItem	
     * @param    {Object} objDelivery
     * @param    {Object} objDelivery.objConn   Conexão como banco de dados
     * @param    {number} objDelivery.IDG043    ID da delivery
     * 
     * @requires module:global/dao/GenericDAO
     * @requires module:config/logger
     * @requires module:utils/Formatador
     * 
     * @throws   {Object} Retorna a descrição do erro
     *
     * @author Rafael Delfino Calzado
     * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.salvaDeliveryItem = async function (objDelivery, res, next) {
        
        try {

            await this.removeItensLotes(objDelivery, res, next);

            for (var item of objDelivery.item) {
    
                item.IDG043 = objDelivery.IDG043;
                
                var objVal = utils.checaEsquema(item, mdl.G045.columns);

                if (objVal.blOK) {
    
                    var objItem = utils.setSchema(mdl.G045, item);

                    delete objItem.vlFields.lote;                
        
                    objItem.objConn = objDelivery.objConn;
                    await gdao.controller.setConnection(objItem.objConn);
    
                    await gdao.inserir(objItem, res, next)
    
                    .then(async (result) => {
    
                        item.IDG045 = result.id;
                        logger.debug(`Item inserido - ID #${item.IDG045}`);
                        await this.salvaDeliveryLote(item, res, next);
    
                    });                
    
                } else {

                    objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, 'Item' , `Dados inválidos: ${objVal.strErro}`, objDelivery.CDFILIAL));

                }
    
            }
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Salva os Lotes contidos nos Itens da Delivery
        *
        * @async 
        * @function salvaDeliveryLote
        * @param    {Object} objItem
        * @param    {Object} objItem.lote         Objeto com os dados do lote
        * @param    {number} objItem.lote.IDG050  ID do lote
        * @param    {number} objItem.IDG045       ID do item
        * @param    {Object} objItem.objConn      Conexão com o banco de dados
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * @requires module:utils/Formatador
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 
    
    api.salvaDeliveryLote = async function (objItem, res, next) {
        
        try {

            for (var lote of objItem.lote) {

                lote.IDG045 = objItem.IDG045;
                
                var objVal = utils.checaEsquema(lote, mdl.G050.columns);
    
                if (objVal.blOK) {
    
                    var objLote = utils.setSchema(mdl.G050, objVal.value);
    
                    objLote.objConn = objItem.objConn;
                    await gdao.controller.setConnection(objLote.objConn);
    
                    await gdao.inserir(objLote, res, next)
    
                    .then((result) => {
                        lote.IDG050 = result.id;
                        logger.debug(`Lote inserido - ID #${lote.IDG050}`);
                    });
    
                } else {

                    objItem.arOcorrencia.push(utils.gerarOcorrencia(2, 'Lote' , `Dados inválidos: ${objVal.strErro}`));

                }
    
            }
    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Registra as ocorrências encontradas na importação da Delivery
        *
        * @async 
        * @function insereOcorrencias
        * @param    {Object} objOcorrencia
        * @param    {string} objOcorrencia.CDDELIVE     Código da Delivery
        * @param    {Array} objOcorrencia.arOcorrencia  Array de ocorrências
        * @param    {Object} objOcorrencia.objConn      Dados para conexão com o banco de dados
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * @requires module:utils/Formatador
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.insereOcorrencias = async function (objOcorrencia, res, next) {        

        try {

            logger.debug(`Inserindo ocorrências - Delivery: ${objOcorrencia.CDDELIVE}`);

            for (var o of objOcorrencia.arOcorrencia) {
    
                o.CDDELIVE = objOcorrencia.CDDELIVE;
                var objO   = utils.setSchema(mdl.I010, o);
    
                if (utils.validateSchema(objO)) {
    
                    await gdao.controller.setConnection(objOcorrencia.objConn);
                    objO.objConn = objOcorrencia.objConn;
    
                    await gdao.inserir(objO, res, next);
    
                }
                
            }

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Remove as ocorrências anteriores ao importar uma Delivery
        *
        * @async 
        * @function removeOcorrencias
        * @param    {Object} objDelivery
        * @param    {Object} objDelivery.CDDELIVE Código da Delivery
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * @requires module:utils/Formatador
        * 
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\     

    api.removeOcorrencias = async function (objDelivery, res, next) {

        logger.debug(`Removendo ocorrências - Delivery: ${objDelivery.CDDELIVE}`);

        var arKey              = ['CDDELIVE'];
        var objOcorrencia      = utils.setSchema(mdl.I010, objDelivery);

        objOcorrencia.key      = arKey;
        objOcorrencia.vlFields = { SNDELETE: 1 };
        objOcorrencia.vlKey[arKey[0]] = [`'${objDelivery[arKey[0]]}'`];

        objOcorrencia.objConn = await gdao.controller.getConnection(objDelivery.objConn);
        await gdao.controller.setConnection(objOcorrencia.objConn);

        await gdao.alterar(objOcorrencia, res, next).catch((err) => { throw (err) });
    }

    //-----------------------------------------------------------------------\\

    api.removeItensLotes = async function (objDelivery, res, next) {

        await gdao.controller.setConnection(objDelivery.objConn);
        await dao.removeLotes(objDelivery, res, next).catch((err) => { throw err });

        await gdao.controller.setConnection(objDelivery.objConn);
        await dao.removeItens(objDelivery, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca os ID's das tabelas de referências no cabeçalho da Delivery
        *
        * @async 
        * @function buscarRefHeader
        * @param  {Object}  objDelivery
        * @param  {Object}  objDelivery.objConn         Parâmetros da pesquisa
        * @param  {string}  objDelivery.unPeso          Unidade de Medida do peso da delivery
        * @param  {Array}   objDelivery.arOcorrencia    Array de ocorrências da delivery
        * @param  {number}  objDelivery.IDG014          ID da operação
        * @param  {string}  objDelivery.CDFILIAL        Código da filial
        * @param  {string}  objDelivery.CJDESTIN        CNPJ do cliente de Destino
        * @param  {string}  objDelivery.IEDESTIN        Inscrição Estadual do cliente de destino
        * @param  {number}  objDelivery.IDG005RE        ID Cliente Remetente
        * @param  {number}  objDelivery.IDG005DE        ID Cliente Destinatário
        * 
        * @requires module:modDelivery/dao/DeliveryDAO~buscarMedida
        * @requires module:modDelivery/dao/DeliveryDAO~buscarRemetente
        * @requires module:modDelivery/dao/DeliveryDAO~buscarDestinatario
        * @requires module:utils/Formatador~gerarOcorrencia
        * @requires module:utils/DataAtual~formataData
        * @requires module:utils/DataAtual~retornaData
        * @requires module:utils/Utils~dataContratada
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * @requires module:utils/Formatador
        * 
        * @returns  {Object} Retorna um objeto com os ID's preenchidos
        * @throws   {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.buscarRefHeader = async function (objDelivery, res, next) {

        try {

            switch (objDelivery.TPDELIVE) {

                case 3: //Devolução
                case 4: //Recusa
                    var arCampo = ['IDG005DE', 'IDG003DE', 'IDG005RE', 'IDG003RE'];
                    break;
    
                //case 1:  //Transferência
                //case 2:  //Distribuição
                default:
                    var arCampo = ['IDG005RE', 'IDG003RE', 'IDG005DE', 'IDG003DE'];
                    break;
            }
    
            //=======================================\\
            // Unidade de Peso
    
            objDelivery = await this.buscarPeso(objDelivery, res, next);
    
            //=======================================\\
            // Order Reason - Motivo de Devolução
    
            if ((objDelivery.arOcorrencia.length == 0) && (objDelivery.TPDELIVE > 2)) { //Devolução e Recusa
    
                objDelivery = await this.buscarOrderReason(objDelivery, res.next);
    
                //Delivery de Referência
                if ((objDelivery.arOcorrencia.length == 0) && (objDelivery.hasOwnProperty('cdDelRef'))) {  
                    objDelivery = await this.buscarDeliveryReferencia(objDelivery, res, next);
    
                    //Atualiza Delivery Espelho
                    if ((objDelivery.arOcorrencia.length == 0) && (objDelivery.TPDELIVE == 4))
                        objDelivery = await this.atualizarDeliveryEspelho(objDelivery, res, next);           
    
                }
    
            }
    
            //=======================================\\
            // Revendedor
    
            if (objDelivery.arOcorrencia.length == 0) {
    
                objDelivery.arCampo = arCampo;
                objDelivery = await this.buscarRevendedor(objDelivery, res, next);
    
                //=======================================\\
                // Cliente
    
                if (objDelivery.arOcorrencia.length == 0) {
    
                    objDelivery = await this.buscarClienteOperacao(objDelivery, res, next);

                    //=======================================\\
                    //Warehouse AG
    
                    if ((objDelivery.arOcorrencia.length == 0) && (objDelivery.hasOwnProperty('WHDEPART'))) 
                        objDelivery = await this.buscarAG(objDelivery, res, next);
    
                    //=======================================\\
                }
    
                //=======================================\\
    
            }
    
            //=======================================\\
        
            return objDelivery;
    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.atualizarDeliveryEspelho = async function (objDelivery, res, next) {

        try {

            var nmCampo = 'IDG043RF';
            var strMsg  = `ID de Referência: ${objDelivery.IDG043RF}`;
            logger.debug(`Buscando ${strMsg}`);
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var parm = {};
            parm.objConn  = objDelivery.objConn;
            parm.IDG014   = objDelivery.IDG014;
            parm.IDG043RF = objDelivery.IDG043RF;        
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            await gdao.controller.setConnection(objDelivery.objConn);
    
            var rs = await dao.buscarDeliveryEspelho(parm, res, next);
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            if (rs.length == 0) {
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));
    
            } else if (rs.length > 1) {
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(4, nmCampo, `Foram encontrados ${rs.length} registros com ${strMsg}`, objDelivery.CDFILIAL));
    
            } else if (![24,25].includes(rs[0].STETAPA)) {
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(4, nmCampo, `Delivery de Espelho está na etapa ${rs[0].STETAPA}`, objDelivery.CDFILIAL));
    
            } else {
    
                if (!objDelivery.hasOwnProperty('NRNOTA')) objDelivery.NRNOTA = rs[0].NRNOTA;
                parm.CDDELIVE = objDelivery.CDDELIVE;
                parm.IDG043 = rs[0].IDG043;
    
                await gdao.controller.setConnection(parm.objConn);
                await dao.atualizarDeliveryEspelho(parm, res, next);
    
            }
    
            return objDelivery;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscarOrderReason = async function (objDelivery, res, next) {

        try {

            var nmCampo = 'IDG074';
            var strMsg  = `Motivo de Devolução: ${objDelivery.CDMOTIVO}`;
            logger.debug(`Buscando ${strMsg}`);
    
            await gdao.controller.setConnection(objDelivery.objConn);
    
            var parm = { objConn: objDelivery.objConn, IDG014: objDelivery.IDG014, CDMOTIVO: objDelivery.CDMOTIVO };
            var rs   = await dao.buscarOrderReason(parm, res, next);
    
            if (rs.length == 0)
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));
            else 
                objDelivery[nmCampo] = rs[0].ID;
    
            return objDelivery;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscarAG = async function (objDelivery, res, next) {

        try {

            var nmCampo = 'IDG005RC';
    
            var parm = 
                { 
                    objConn:  objDelivery.objConn, 
                    IDEMPOPE: objDelivery.WHDEPART,
                    CPENDERE: objDelivery.CPWHDEPA,
                    IDG014:   objDelivery.IDG014
                };

            if (/^\d+$/.test(parm.IDEMPOPE)) parm.IDEMPOPE = parseInt(parm.IDEMPOPE);
    
            var strMsg  = `ID Externo do Warehouse: ${parm.IDEMPOPE} / CEP: ${parm.CPENDERE} / `;
                strMsg += `Tipo do Negócio ${parm.IDG014} / Operação ${objDelivery.TPDELIVE}`;
    
            logger.debug(`Buscando ${strMsg}`);
    
            var rs = await cli.buscaIdAG(parm, res, next);
    
            if (rs.length == 0) {
                
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));
    
            } else if (rs.length > 1) {  

                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, nmCampo, `Cadastro duplicado: ${strMsg}`, objDelivery.CDFILIAL));

            } else { 
    
                objDelivery[nmCampo] = rs[0].ID;
    
            }
            
            return objDelivery;

        } catch (err) {

            throw err;

        }    

    }

    //-----------------------------------------------------------------------\\

    api.buscarClienteOperacao = async function (objDelivery, res, next) {

        try {

            var arCampo = objDelivery.arCampo;
            var nmCampo = arCampo[2];
    
            var parm = 
                { 
                    objConn:  objDelivery.objConn, 
                    TPDELIVE: objDelivery.TPDELIVE,
                    CJCLIENT: objDelivery.CJCLIENT, 
                    IECLIENT: objDelivery.IECLIENT, 
                    CPCLIENT: objDelivery.CPCLIENT,
                    IDEXTCLI: objDelivery.IDEXTCLI,
                    IDG014:   objDelivery.IDG014
                };

            if (/^\d+$/.test(parm.IDEXTCLI)) parm.IDEXTCLI = objDelivery.IDEXTCLI = parseInt(parm.IDEXTCLI).toString();
            
            var strIE = (parm.IECLIENT) ? `/ I.E.: ${parm.IECLIENT} / ` : ``;
    
            var strMsg  = `ID Interno do Cliente: CPF/CNPJ ${parm.CJCLIENT} / CEP ${parm.CPCLIENT} ${strIE}`;        
                strMsg += `ID Externo do Cliente: ${parm.IDEXTCLI} / `;
                strMsg += `Tipo do Negócio ${parm.IDG014} / Operação ${parm.TPDELIVE}`;
    
            logger.debug(`Buscando ${strMsg}`);
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var rs = await cli.buscaClienteOperacao(parm, res, next);
    
            if (rs.length == 0) {
                
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));
    
            } else if (rs.length > 1) { 

                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, nmCampo, `Cadastro Duplicado: ${strMsg}`, objDelivery.CDFILIAL));

            } else {
    
                objDelivery[nmCampo]    = rs[0].ID;
                objDelivery[arCampo[3]] = rs[0].IDCIDADE;    
                
            }
            
            return objDelivery;

        } catch (err) {

            throw err;

        }
       
    }

    //-----------------------------------------------------------------------\\    

    api.buscarRevendedor = async function(objDelivery, res, next) {

        try {
        
            var arCampo = objDelivery.arCampo;
            var nmCampo = arCampo[0];
            var strMsg  = `ID do Revendedor: ${objDelivery.CDFILIAL} / CEP: ${objDelivery.CPFILIAL}`;
            logger.debug(`Buscando ${strMsg}`);
    
            var parm = {};
            parm.objConn  = objDelivery.objConn;
            parm.IDG014   = objDelivery.IDG014;
            parm.CDFILIAL = objDelivery.CDFILIAL;
            parm.CPFILIAL = objDelivery.CPFILIAL;
    
            var rs = await cli.buscaRevendedor(parm, res, next);
    
            if (rs.length == 0) {
    
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));
    
            } else if (rs.length > 1) { 
    
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(2, nmCampo, `Cadastro Duplicado: ${strMsg}`, objDelivery.CDFILIAL));
    
            } else {
                
                objDelivery[nmCampo]    = rs[0].ID;
                objDelivery[arCampo[1]] = rs[0].IDCIDADE;
    
            }
    
            return objDelivery;            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.buscarDeliveryReferencia = async function (objDelivery, res, next)  {

        try {

            var nmCampo = 'IDG043RF';
            var strMsg  = `Delivery de Referência: ${objDelivery.cdDelRef}`;
            logger.debug(`Buscando ${strMsg}`);
    
            await gdao.controller.setConnection(objDelivery.objConn);
    
            var parm = { objConn: objDelivery.objConn, CDDELIVE: objDelivery.cdDelRef };            
            var rs = await dao.buscarDelivery(parm, res, next);
    
            if ((rs.length > 0) && ([5,8].includes(rs[0].STETAPA))) {
    
                objDelivery[nmCampo] = rs[0].ID;

                if (rs[0].STRECUSA != null) {
                    objDelivery.TPDELIVE = 4; //delivery de referência foi recusada
                    objDelivery.SNFIMREC = 1;
                }

                if ((objDelivery.TPDELIVE == 4) || (objDelivery.tpFlag === undefined)) {
                    objDelivery.DTENTREG = rs[0].DTENTREG;
                    objDelivery.DTENTCON = rs[0].DTENTCON;    
                }
    
            } else {

                if ((objDelivery.TPDELIVE == 4) || (objDelivery.tpFlag === undefined))
                    objDelivery.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg, objDelivery.CDFILIAL));

            }
    
            return objDelivery;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscarMedida = async function (objDelivery, res, next) {

        var parm = {};
        parm.objConn = objDelivery.objConn;
        parm.cdPesq  = objDelivery.unMedida;
        parm.nmCampo = 'IDG009UM';

        var objRet = await this.buscarUnidade(parm, res, next).catch((err) => { throw err });

        if (objRet.arOcorrencia.length == 0) 
            objDelivery[parm.nmCampo] = objRet[parm.nmCampo];
        else
            objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objRet.arOcorrencia);

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\    

    api.buscarPeso = async function(objDelivery, res, next) {

        var parm = {};
        parm.objConn = objDelivery.objConn;
        parm.cdPesq  = objDelivery.unPeso;
        parm.nmCampo = 'IDG009PS';

        var objRet = await this.buscarUnidade(parm, res, next).catch((err) => { throw err });

        if (objRet.arOcorrencia.length == 0) 
            objDelivery[parm.nmCampo] = objRet[parm.nmCampo];
        else
            objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objRet.arOcorrencia);

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\    

    api.buscarUnidade = async function (req, res, next) {

        try {

            var objRet = { arOcorrencia: [] };

            var nmCampo = req.nmCampo;
            var strMsg  = `unidade: ${req.cdPesq} (${nmCampo})`;
            logger.debug(`Buscando ${strMsg}`);
            
            await gdao.controller.setConnection(req.objConn);
    
            var parm = { objConn: req.objConn, cdPesq: req.cdPesq };
            var rs = await dao.buscarUnidade(parm, res, next);
    
            if (rs.length == 0) 
                objRet.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg));
            else 
                objRet[nmCampo] = rs[0].ID;
    
            return objRet;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.buscarProduto = async function (objItem, res, next) {

        try {

            var nmCampo = 'IDG010';
            var strMsg  = `ID do produto: ${objItem.DSREFFAB} - item: ${objItem.NRORDITE}`;
            logger.debug(`Buscando ${strMsg}`);
    
            await gdao.controller.setConnection(objItem.objConn);
            var rs = await dao.buscarProduto(objItem, res, next);
    
            if (rs.length == 0)
                objItem.arOcorrencia.push(utils.gerarOcorrencia(3, nmCampo, strMsg));
            else
                objItem[nmCampo] = rs[0].ID;
    
            return objItem;            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca os ID's das tabelas de referências no item da Delivery
        *
        * @async 
        * @function buscarRefItem			
        * @param    {Object}  objItem		
        * @param    {string}  objItem.unPeso	    Unidade de Medida do Peso
        * @param    {number}  objItem.NRORDITE      Número da ordenação do item
        * @param    {Object}  objItem.objConn       Dados para conexão com o banco de dados
        * @param    {Array}   objItem.arOcorrencia  Array com ocorrência do item
        * @param    {string}  objItem.unMedida      Unidade de Medida
        * @param    {string}  objItem.DSREFFAB      Referência do fabricante
        * @param    {number}  objItem.IDG005RE      ID Cliente remetente
        * 
        * @requires module:modDelivery/dao/DeliveryDAO~buscarMedida
        * @requires module:modDelivery/dao/DeliveryDAO~buscarProduto
        * @requires module:utils/Formatador~gerarOcorrencia
        * 
        * @requires module:global/dao/GenericDAO
        * @requires module:config/logger
        * @requires module:utils/Formatador
        * 
        * @returns  {Object}  Retorna um objeto com os ID's preenchidos
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\      

	api.buscarRefItem = async function (objItem, res, next) {
                
        try {

            // Busca Unidade de Peso        
            objItem = await this.buscarPeso(objItem, res, next);

            // Busca Unidade de Medida
            if (objItem.arOcorrencia.length == 0) {
                objItem = await this.buscarMedida(objItem, res, next);

                // Busca do ID do Produto
                if (objItem.arOcorrencia.length == 0)
                    objItem = await this.buscarProduto(objItem, res, next);

            }

            return objItem;

        } catch (err) {

            throw err;

        }

    }
    
    //-----------------------------------------------------------------------\\ 
    /**
        * @description Verifica a estrutura e referência em banco da Delivery a ser salva
        *
        * @async 
        * @function buscarDadosDelivery
        * @param  {Object}  objDelivery              
        * @param  {Array}   objDelivery.arOcorrencia    Ocorrências da delivery
        * @param  {number}  objDelivery.IDG005RE        ID Cliente Remetente
        * @param  {Object}  objDelivery.objConn         Dados para conexão do banco
        * @param  {Object}  objDelivery.item            Dados do item
        * 
        * @requires module:modDelivery/controllers/DeliveryController~buscarRefHeader
        * @requires module:modDelivery/controllers/DeliveryController~buscarRefItem
        * 
        * @returns {Object} Retorna um objeto verificado
        * @throws  {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\   
    
    api.buscarDadosDelivery = async function (objDelivery, res, next) {

        try {

            objDelivery = await this.buscarRefHeader(objDelivery, res, next);

            if (objDelivery.arOcorrencia.length == 0) {
    
                for (var item of objDelivery.item) {
    
                    item.IDG014  = objDelivery.IDG014;
                    item.objConn = objDelivery.objConn;
    
                    item = await this.buscarRefItem(item, res, next);
                    objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(item.arOcorrencia);  
    
                } 
    
            }
    
            return objDelivery;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Compara alterações dos dados novos e prévios da Delivery a ser salva
        *
        * @function verificaAlteracao        
        * 
        * @param  {Object} objDelivery  Contém dados da delivery
        * @param  {Object} rs           Resultset para comparação
        * 
        * @requires module:utils/Formatador~gerarOcorrencia
        * 
        * @returns {Object} Retorna um objeto verificado
        * @throws  {Object} Retorna a descrição do erro        *
        * 
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\       

    api.verificaAlteracao = function (objDelivery, rs) {

        var arCompara = [];

        rs.VRDELIVE = parseFloat(rs.VRDELIVE.toFixed(2));
        rs.VRVOLUME = parseFloat(rs.VRVOLUME.toFixed(3));
        rs.PSBRUTO  = parseFloat(rs.PSBRUTO.toFixed(3));
        rs.PSLIQUID = parseFloat(rs.PSLIQUID.toFixed(3));
        
        arCompara.push(['SNLIBROT', 'TP Flag']);
        arCompara.push(['VRDELIVE', 'Valor da Delivery']);
        arCompara.push(['VRVOLUME', 'Volume da Delivery']);
        arCompara.push(['PSBRUTO',  'Peso Bruto']);
        arCompara.push(['PSLIQUID', 'Peso Líquido']);

        //Retirado na Wave 2
        //arCompara.push(['CDPRIORI', 'Prioridade da Delivery']);
        //arCompara.push(['TXINSTRU', 'Shipping Instruction']);

        for (var a of arCompara) {

            if (objDelivery[a[0]] != rs[a[0]]) {
                //objDelivery[a[0]] = rs[a[0]]; //Volta ao valor original - Wave 2                
                objDelivery.arOcorrencia.push(utils.gerarOcorrencia(4, a[0], a[1], objDelivery.CDFILIAL));
            }

        }

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\ 

    api.salvaAdicionaisDH = async function (req, res, next) {

        req.idTabela = req.IDG043;
        req.nmTabela = 'G043';

        return await fldAdd.inserirValoresAdicionais(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\ 

    api.listarOcorrenciasGrid = async function (req, res, next) {

        try {

            var rs = await dao.listarOcorrenciasGrid(req, res, next);

            var cdStatus = (rs.length == 0) ? 400 : 200;

            res.status(cdStatus).send(rs);

        } catch (err) {

            res.status(500).send(err);

        }

    };

    //-----------------------------------------------------------------------\\       
    
    return api;

}
