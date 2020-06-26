module.exports = function (app, cb) {

    const tmz       = app.src.utils.DataAtual;
    const utilsDir  = app.src.utils.Diretorio;
    const fmt       = app.src.utils.Formatador;
    
    const mdl       = app.src.modPagFrete.models.CTEModel;
    const dao       = app.src.modPagFrete.dao.MainDAO;
    const leitorCtl = app.src.modPagFrete.controllers.LeitorController;

    const dirIn     = process.env.FOLDER_CTE_IN;
    const dirOut    = process.env.FOLDER_CTE_OUT;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista as ocorrências encontradas na importação do XML
    * @function listarOcorrencias
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.listarOcorrencias = async function (req, res, next) {

        await dao.listarOcorrencias(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });    

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Lista os CTE's 
    * @function buscarDadosCTe
    * @author Rafael Delfino Calzado
    * @since 11/06/2018
    *
    * @async
    * @param   {Object} req Parâmetros de pesquisa
    * @returns {Object} Retorna um objeto com o resultado das operações
    */
    //-----------------------------------------------------------------------\\ 

    api.buscarDadosCTe = async function (req, res, next) {

        await dao.buscarDadosCTe(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Salva em banco os CTE's informados
    * @function salvarCTe
    * @author Rafael Delfino Calzado
    * @since 11/06/2018
    *
    * @async
    * @param   {String} dir   Diretório de leitura
    * @param   {Array}  files Array com os arquivos a serem importados
    * @returns {Object} Retorna um objeto com o resultado das operações
    */    
    //-----------------------------------------------------------------------\\

    api.salvarCTe = async function (req, res, next) {
    
        var arXML = [];

        req.body.files.forEach(filename => {            

            if (utilsDir.existsPath(`${dirIn}${filename}`)) {

                var objXML = leitorCtl.lerXMLCTe({ dir: dirIn, filename }, res, next);
                arXML.push(objXML);

            }        

        });

        //================================================\\

        await api.registrarCTe(arXML, res, next)

        .then((result) => {

            var cdStatus = ((result.ttCommit == arXML.length) && 
                            (result.ttCommit > 0)) ? 200 : 500;

            res.status(cdStatus).send(result);

        })

        .catch((err) => {
            next(err);
        });
        
    }

    //-----------------------------------------------------------------------\\          
    /**
    * @description Valida todos os CTe's de entrada e os salva em banco
    * @function registrarCTe
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {Array}  req Array de objetos XML
    * @returns {Object} Retorna um objeto com o resultado das operações
    */
    //-----------------------------------------------------------------------\\ 

    api.registrarCTe = async function (req, res, next) {

        var param    = {};        
        var arOcorre = [];
        var ttCommit = 0;

        //=============================================\\

        param.objConn = await dao.getConnection();        
        await dao.setConnection(param.objConn);

        var arCompPadrao = await dao.buscarComponentes(param, res, next).catch((err) => { throw err });        

        //=============================================\\        

        for (var objXML of req) {

            var blOK = false;

            if (objXML.blOK) {            

                param.objXML = objXML;

                //=============================================\\
                //Remover ocorrências prévias

                await this.removerOcorrencias(param, res, next).catch((err) => { throw err });

                //=============================================\\
                //Checagem CTe atual e prévio                

                objXML = await this.verificarCTe(param, res, next).catch((err) => { throw err });

                if (objXML.blOK) { 
                    
                    //=============================================\\
                    //REFERÊNCIAS 

                    param.objXML = objXML;
                    objXML = await this.buscarRef(param, res, next).catch((err) => { throw err });

                    if (objXML.blOK) {
                        
                        objXML.IDG059   = objXML.CFOP;
                        objXML.VRTOTFRE = objXML.VRTOTPRE;
                        objXML.SNDELETE = 0;
                        objXML.STCTRC   = (objXML.STCTRC == 100) ? 'A' : 'C';
    
                        objXML.DTEMICTR = new Date(objXML.DTEMICTR);
                        objXML.DTLANCTO = tmz.dataAtualJS();
    
                        var objCTe = fmt.setSchema(mdl.G051, objXML);

                        //=============================================\\
                        //COMPONENTES

                        var objComp = this.relacionarComponentes({ arCompPadrao, objXML }, res, next);                                                
                        objCTe.vlFields = Object.assign(objCTe.vlFields, objComp);

                        //=============================================\\
                        //VALIDAÇÃO DE ESQUEMA

                        var objVer = fmt.validaEsquema(objCTe.vlFields, objCTe.columns);

                        if (objVer.blOK) {

                            objCTe.IDG051AN = objXML.IDG051AN;
                            objCTe.objConn  = param.objConn;

                            await this.inserirCTe(objCTe, res, next)

                            .then((result) => {
                                objCTe.IDG051 = result;
                                ttCommit++;
                                blOK = true;
                            })

                            .catch((err) => { throw (err) });
            
                        } else {
                            
                            arOcorre.push(objVer.strErro);

                        }

                        //=============================================\\

                    } else {

                        arOcorre.push(objXML.strErro);

                    }

                    //=============================================\\

                } else {

                    arOcorre.push(objXML.strErro);

                }

                //=============================================\\

                
            } else {

                arOcorre.push(objXML.strErro);

            }

            //=============================================\\

            if (objXML.hasOwnProperty('NRCHADOC')) {
                               
                param.objXML = objXML;
                if (!blOK) await this.salvarOcorrencias(param, res, next).catch((err) => { throw (err) });
                await api.moveArquivo(objXML, res, next);                
 
            }
  
        }

        //=============================================\\

        await param.objConn.close();

        return { ttCommit, arOcorre };
    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Remove as ocorrências prévias de um CTe
    * @function removerOcorrencias
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @async
    * @param   {String} NRCHADOC Número da Chave do Documento
    */
    //-----------------------------------------------------------------------\\

    api.removerOcorrencias = async function (req, res, next) {

        var strKey = 'NRCHADOC';

        var objDel = fmt.setSchema(mdl.I016, { SNDELETE: 1 });

        objDel.vlKey[strKey] = `'${req.objXML[strKey]}'`;
        objDel.key = [strKey];

        objDel.objConn = req.objConn;
        await dao.setConnection(objDel.objConn);

        await dao.alterar(objDel, res, next).catch((err) => { throw (err) });

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Salva os registros das ocorrências encontradas na importação
    * @function salvarOcorrencias
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @async
    * @param   {Number} IDG009   ID do Tipo de Ocorrência
    * @param   {String} NRCHADOC Número da Chave do Documento
    * @param   {String} NMCAMPO  Nome do Campo da Ocorrência
    * @param   {String} OBOCORRE Descrição da ocorrência
    */
    //-----------------------------------------------------------------------\\ 

    api.salvarOcorrencias = async function (req, res, next) {

        var objAdd = { NRCHADOC:req.objXML.NRCHADOC, SNDELETE: 0 };

        for (var o of req.objXML.arOcorre) {

            var objTmp = Object.assign(o, objAdd);
            var objO   = fmt.setSchema(mdl.I016, objTmp);

            if (fmt.validateSchema(objO)) {

                objO.objConn = req.objConn;
                await dao.setConnection(objO.objConn);

                await dao.inserir(objO, res, next).catch((err) => { throw (err) });

            }

        }
        
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Insere o CTe e a relação com o CTe referente
    * @function inserirCTe
    * @author Rafael Delfino Calzado
    * @since 07/06/2018
    *
    * @async
    * @param   {Object} vlFields Campos da G051
    */
    //-----------------------------------------------------------------------\\ 

    api.inserirCTe = async function (req, res, next) {    

        await dao.setConnection(req.objConn);

        return await dao.inserir(req, res, next)

        .then(async (result) => {

            var objTmp =  
                {                     
                    IDG051AT: result.id, 
                    IDG051AN: req.IDG051AN
                }; 

            var objR = fmt.setSchema(mdl.G064, objTmp);

            if (fmt.validateSchema(objR)) {

                delete objR.key;
                delete objR.vlKey;

                objR.objConn = req.objConn;
                await dao.setConnection(objR.objConn);

                await dao.inserir(objR, res, next).catch((err) => { throw (err) });

            }

            return objTmp.IDG051AT;

        })

        .catch((err) => { throw (err) });
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Move arquivo do diretório de entrada para saída adequada
    * @function moveArquivo
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param {String}  filename Nome do Arquivo
    * @param {String}  NRCHADOC Chave do documento
    */
    //-----------------------------------------------------------------------\\ 

    api.moveArquivo = async function (req, res, next) {

        var objFile = 
            { 
                dirOrigem:    dirIn, 
                dirDestino:   dirOut,
                nmArqOrigem:  req.filename,
                nmArqDestino: `cte-${req.NRCHADOC}.xml`
            }

        await utilsDir.moveFile(objFile);
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Verifica se o CTe de referência e o CTe atual constam em base
    * @function verificarCTe
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {String} NRCHADOC Chave do documento atual
    * @param   {String} NRCHAANT Chave do documento de referência
    * @returns {Object} Objeto com o resultado da pesquisa
    */
    //-----------------------------------------------------------------------\\ 

    api.verificarCTe = async function (req, res, next) {

        var objXML = req.objXML;
        objXML.blOK = false;

        var param = 
            { 
                objConn:  req.objConn, 
                arChave: [`'${objXML.NRCHADOC}'`, `'${objXML.NRCHAANT}'`]
            };

        await dao.setConnection(param.objConn);

        var rs = await dao.buscarCTe(param, res, next);

        //=============================================\\

        switch (rs.length) {

            case 0:
                objXML.strErro = `Não foi encontrado o CTe de referência ${objXML.NRCHAANT}`;
                objXML.arOcorre.push(fmt.gerarOcorrencia(3, 'NRCHAANT', objXML.strErro));                
                break;

            case 1:
                if (rs[0].NRCHADOC == objXML.NRCHAANT) {

                    objXML.blOK = true;
                    objXML.IDG051AN = rs[0].ID;

                } else {

                    objXML.strErro = `CTe ${objXML.NRCHADOC} já encontra-se cadastrado`;
                    objXML.arOcorre.push(fmt.gerarOcorrencia(2, 'NRCHADOC', objXML.strErro));

                }
                break;

            default:
                objXML.strErro = 'Operação já realizada';
                objXML.arOcorre.push(fmt.gerarOcorrencia(2, 'NRCHADOC', objXML.strErro));
                break;

        }

        //=============================================\\

        return objXML;
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Relaciona os componentes encontrados no XML com o padrão em banco
    * @function relacionarComponentes
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @param   {Array}   arCompPadrao Array com todos os componentes padrão em banco
    * @param   {Array}   arCompXML    Array com todos os componentes encontrados no XML
    * @param   {Integer} IDG024       Chave da transportadora    
    * @returns {Object} Objeto contendo nomes dos componentes e valores
    */
    //-----------------------------------------------------------------------\\ 

    api.relacionarComponentes = function (req, res, next) {        

        var objComp = {};
        objComp.VROUTROS = 0;
        objComp.VRFRETEV = 0;
        objComp.VRFRETEP = 0;
        objComp.VRPEDAGI = 0;

        for (var objC of req.objXML.ARCOMPON) {

            var arResult = req.arCompPadrao.filter((a) => { 
                return ((a.IDG024 == req.objXML.IDG024) &&
                        (a.NMCOMVAR.toUpperCase() == objC.NMCOMPON.toUpperCase())) 
            });

            if (arResult.length == 1) 
                objComp[arResult[0].NMCOMPAD] = parseFloat(objC.VRCOMPON);
            else
                objComp.VROUTROS += parseFloat(objC.VRCOMPON);
            
        }

        return objComp;
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Busca as referências em banco das entidades encontradas no XML
    * @function buscarRef
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {String} CJEMITEN CNPJ do Emitente (Transportadora)
    * @param   {String} CJREMETE CNPJ do Remetente
    * @param   {String} CJDESTIN CNPJ do Destinatário
    * @param   {String} CJTOMADO CNPJ do Tomador
    * @param   {String} CJEXPEDI CNPJ do Expedidor
    * @param   {String} CJRECEBE CNPJ do Recebedor
    * @returns {Object} Objeto com as referências encontradas
    */
    //-----------------------------------------------------------------------\\ 

    api.buscarRef = async function (req, res, next) {

        var objXML  = req.objXML;
        objXML.blOK = false;
        
        var param   = { objConn: req.objConn };       

        var nmCampo = 'CJEMITEN';
        param.CNPJ  = objXML[nmCampo];

        await dao.setConnection(param.objConn);

        await dao.buscarEmitente(param, res, next)

        .then(async (rs)=> {

            if ((rs.length > 0) && (rs[0].SNTRAINT != 1))  {
            
                objXML.IDG024 = rs[0].ID;

                //=============================================\\
                //REMETENTE

                nmCampo = 'CJREMETE';
                param.CNPJ = objXML[nmCampo];

                await dao.setConnection(param.objConn);

                await dao.buscarPessoa(param, res, next)

                .then(async (rs) => {

                    if (rs.length > 0) {

                        objXML.IDG005RE = rs[0].ID;

                        //=============================================\\
                        //DESTINATÁRIO

                        nmCampo = 'CJDESTIN';
                        param.CNPJ = objXML[nmCampo];

                        await dao.setConnection(param.objConn);

                        await dao.buscarPessoa(param, res, next)

                        .then(async (rs) => {
        
                            if (rs.length > 0) {

                                objXML.IDG005DE = rs[0].ID;

                                //=============================================\\
                                //TOMADOR
                                
                                nmCampo = 'CJTOMADO';
                                param.CNPJ = objXML[nmCampo];

                                await dao.setConnection(param.objConn);
        
                                await dao.buscarPessoa(param, res, next)

                                .then(async (rs) => {
        
                                    if (rs.length > 0) {
                                                                                
                                        objXML.IDG005CO = rs[0].ID;
                                        objXML.blOK = true;

                                        //=============================================\\
                                        //EXPEDIDOR

                                        nmCampo = 'CJEXPEDI';

                                        if (objXML.hasOwnProperty(nmCampo)) {

                                            param.CNPJ = objXML[nmCampo];

                                            await dao.setConnection(param.objConn);
                    
                                            await dao.buscarPessoa(param, res, next)

                                            .then((rs) => {
                                                objXML.IDG005EX = (rs.length > 0) ? rs[0].ID : objXML.IDG005RE;
                                            });        

                                        } else {

                                            objXML.IDG005EX = objXML.IDG005RE;

                                        }

                                        //=============================================\\
                                        //RECEBEDOR

                                        nmCampo = 'CJRECEBE';
                                        
                                        if (objXML.hasOwnProperty(nmCampo)) {

                                            param.CNPJ = objXML[nmCampo];

                                            await dao.setConnection(param.objConn);
                    
                                            await dao.buscarPessoa(param, res, next)

                                            .then((rs) => {
                                                objXML.IDG005RC = (rs.length > 0) ? rs[0].ID : objXML.IDG005DE;
                                            });

                                        } else {

                                            objXML.IDG005RC = objXML.IDG005DE;

                                        }

                                        //=============================================\\

                                    } else {

                                        objXML.strErro = 'Tomador não cadastrado';
                                        objXML.arOcorre.push(fmt.gerarOcorrencia(3, nmCampo, objXML.strErro));

                                    }

                                    //=============================================\\

                                });                

                            } else {

                                objXML.strErro = 'Destinatário não cadastrado';
                                objXML.arOcorre.push(fmt.gerarOcorrencia(3, nmCampo, objXML.strErro));

                            }

                            //=============================================\\
                            
                        });

                    } else {

                        objXML.strErro = 'Remetente não cadastrado';
                        objXML.arOcorre.push(fmt.gerarOcorrencia(3, nmCampo, objXML.strErro));

                    }

                    //=============================================\\

                });

            } else {

                objXML.strErro = 'Emitente não cadastrado';
                objXML.arOcorre.push(fmt.gerarOcorrencia(3, nmCampo, objXML.strErro));

            }

            //=============================================\\

        });
 

        return objXML;
    }

    //-----------------------------------------------------------------------\\

    return api;
}