module.exports = function (app, cb) {

    const tmz  = app.src.utils.DataAtual;
    const fmt  = app.src.utils.Formatador;
    const fdao = app.src.modOferecimento.dao.CalcFreteDAO;
    const sdao = app.src.modOferecimento.dao.StatusDAO;
    const dao  = app.src.modOferecimento.dao.CargaDAO;
    const mdl  = app.src.modOferecimento.models.CargaModel;

    var api = {};
    
    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de troca de status
     * @function api/checkTrocaStatus
     * @author Rafael Delfino Calzado
     * @since 16/05/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkTrocaStatus = function (req, res, next) {

        var parm = { post: req.body, model: mdl.status.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de distribuição
     * @function api/checkDistribuicao
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkDistribuicao = function (req, res, next) {

        var parm = { post: req.body, model: mdl.distribuicao.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de oferecimento spot
     * @function api/checSpot
     * @author Rafael Delfino Calzado
     * @since 17/05/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkSpot = function (req, res, next) {

        var parm = { post: req.body, model: mdl.spot.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Realiza um oferecimento no modelo SPOT
     * @function salvaFreteSpot
     * @author Rafael Delfino Calzado
     * @since 17/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.salvaFreteSpot = async function (req, res, next) {

        try {
            
            var parm = { tpOferec: 'O', IDS001: req.body.IDS001, ttCargas: 1 };

            var objDist = 
                {

                    IDG046:   req.body.IDG046,
                    SNCARPAR: req.body.SNCARPAR,                    

                    objFreSpot: {
                        IDG085:   req.body.IDG085,
                        IDG024:   req.body.IDG024,                        
                        IDO008:   req.body.IDO008,
                        IDO009:   req.body.IDO009,
                        SNBRAVO:  req.body.SNBRAVO,
                        PCPREFRE: req.body.PCPREFRE,
                        VRFRETE:  parseFloat(req.body.VRFREPAG)
                    }

                };
            
            parm.objCalc = 
                {
                    arCargasSR: [], 
                    arCargasFO: [], 
                    arCargasCD: [objDist]
                };

            parm.objConn = await dao.controller.getConnection(null, parm.IDS001);

            var objRet = await api.triagemDistribuicao(parm, res, next);

            await parm.objConn.close();

            var cdStatus = (objRet.blOK) ? 200 : 400;

            res.status(cdStatus).send(objRet);


        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna os dados dos participantes da Carga de acordo com a regra
     * @function filtraParticipante
     * @author Rafael Delfino Calzado
     * @since 30/07/2019
     *
     * @async
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.filtraParticipante = async function (req) {

        try {

            var arFiltroRegra = api.filtraRegra(req.arDist);                
            
            var parm = { 
                post: 
                { 
                    TPOFEREC:   'O',
                    IDO008:     [arFiltroRegra[0].IDO008],   
                    IDG030:     arFiltroRegra[0].IDG030,
                    strMesRef:  tmz.tempoAtual('YYYY-MM', false)
                }
            };            
    
            return await dao.listaParticipa(parm, null, null);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Associa os dados dos participantes 3PL's aos seus respectivos fretes
     * @function associaFrete
     * @author Rafael Delfino Calzado
     * @since 30/07/2019
     *
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.associaFrete = function (ar3PL, arFrete, blIntegra = false) {

        try {

            var arRS = [];

            for (var objAssocia of ar3PL) {
    
                var arAssocia = arFrete.filter(f => { return f.IDG024 == objAssocia.IDG024 });
                if (arAssocia.length > 0) arRS.push(Object.assign(objAssocia, arAssocia[0]));
                else if (blIntegra) arRS.push(objAssocia);
    
            }
    
            return arRS;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o cálculo de frete e participação de todas transportadoras da regra
     * @function calcFreteSpot
     * @author Rafael Delfino Calzado
     * @since 17/05/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.calcFreteSpot = async function (req, res, next) {

        try {

            var objRet = { blOK: false, error: null, arRS: [] };
            var parm   = { post: { IDG046: [req.params.id] } };
            var parm2  = {};

            parm.objConn = parm2.objConn = await dao.controller.getConnection(null, req.UserId);

            parm2.arDist = await dao.listaCargasDist(parm, res, next);

            if (parm2.arDist.length == 0) {

                objRet.error = `Não existe regra para a carga #${req.params.id}`;

            } else {

                var arPart = await api.filtraParticipante(parm2);

                if (arPart.length == 0) {

                    objRet.error = `Não foram encontrados participantes para a regra #${parm2.arDist[0].IDO008}`;

                } else {
                    
                    parm.post.tpCalcFrete = 'C';
                    parm.post.SNCARPAR = parm2.arDist[0].SNCARPAR;
                    var arFreRec = await fdao.calculaFrete(parm, res, next);
    
                    if (arFreRec.length == 0) {
    
                        objRet.error = `Não foi encontrada tabela de frete a receber para a carga #${req.params.id}`;
    
                    } else {

                        objRet.blOK = true;
                        parm.post.tpCalcFrete = 'T';                        
                        parm.post.IDO008 = parm2.arDist[0].IDO008;

                        var arFrePag = await fdao.calculaFrete(parm, res, next);

                        for (var obj3PL of arPart) {
                            obj3PL.SNCARPAR = parm.post.SNCARPAR;
                            obj3PL.IDG046 = parm.post.IDG046[0];
                            if (obj3PL.SNBRAVO == 'S') arFrePag.push(api.adicionaFreteBravo(obj3PL, arFreRec[0]));
                        }

                        objRet.arRS = api.associaFrete(arPart, arFrePag, true);
        
                    }                        

                }

            }

            await parm.objConn.close();

            var cdStatus = (objRet.blOK) ? 200 : 400;

            res.status(cdStatus).send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Altera o status das cargas selecionadas 
     * @function api/trocaStatus
     * @author Rafael Delfino Calzado
     * @since 16/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.trocaStatus = async function (req, res, next) {

        try {

            var parm = { post: req.body };
            var nrRows = 0;
            var cdStatus = 200;
            var strErr = null;

            parm.objConn = await dao.controller.getConnection(null, parm.post.IDS001);

            if (parm.post.STCARGA != 'B') {

                var arRS = await sdao.checaStatusCarga(parm);

                if ((arRS[0].IDG024) ||
                    (['P','R'].includes(parm.post.STCARGA)))    
                {

                    await sdao.trocaStatusOferec(parm, res, next);
                
                } else {

                    cdStatus = 400;
                    strErr = `A Carga ${parm.post.IDG046} se encontra atualmente na etapa '${arRS[0].DSSTACAR}', sem transportadora definida`;

                }

            } 

            if (cdStatus == 200)
                nrRows = await sdao.trocaStatusCarga(parm, res, next);

            await parm.objConn.close();

            res.status(cdStatus).send({ nrRows, error: strErr });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Distribui as cargas disponíveis para oferecimento
     * @function api/distribuiCargas
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.distribuiCargas = async function (req, res, next) {

        try {
            
            req.setTimeout(300000);

            var parm     = { post: req.body };
            var tpOferec = parm.post.TPOFEREC;
            
            parm.objConn = await dao.controller.getConnection(null, req.body.IDS001);

            var arOferec = await dao.listaCargasDist(parm, res, next);

            var arCargasOf = [...new Set(arOferec.map(uk => uk.IDG046))];
            
            var arCargas = [];
            
            for (var a of parm.post.IDG046) arCargas.push(a);

            if (arCargasOf.length != arCargas.length) {

                var arCargasSR = arCargas.filter(f => { return !arCargasOf.includes(f) });

                var objRet        = {};
                objRet.blOK       = false;
                objRet.error      = 'Não foram encontradas regras para distribuição';
                objRet.arCargasSR = arCargasSR;
                objRet.arCargasST = [];
                objRet.arCargasFO = [];
                objRet.arCargasCD = [];
                
            } else {

                arOferec = api.filtraRegra(arOferec);

                parm.post.IDO008    = [...new Set(arOferec.map(uk => uk.IDO008))];
                parm.post.strMesRef = tmz.tempoAtual('YYYY-MM', false);

                var arPart = await dao.listaParticipa(parm, res, next);

                parm = { objConn: parm.objConn, tpOferec, arOferec, arPart };

                var objCalc = await api.calculaDistribuicao(parm, res, next);  
                
                parm = 
                    { 
                        objConn:    parm.objConn, 
                        IDS001:     req.body.IDS001,
                        ttCargas:   arCargas.length,
                        objCalc, 
                        tpOferec, 
                     };
                
                var objRet = await api.triagemDistribuicao(parm, res, next);
                
            }

            await parm.objConn.close();

            var cdStatus = (objRet.blOK) ? 200 : 400;

            var objResponse  = { blOK: objRet.blOK, error: objRet.error };
            objResponse.ttCD = objRet.arCargasCD.length; // Cargas distribuídas
            objResponse.ttST = objRet.arCargasST.length; // Cargas sem tabela de frete
            objResponse.ttFO = objRet.arCargasFO.length; // Cargas em fim de oferta ( sem participantes restantes )
            objResponse.ttSR = objRet.arCargasSR.length; // Cargas sem regras definidas

            res.status(cdStatus).send(objResponse);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Verifica se a carga necessita de pré-aprovação
     * @function api/triagemDistribuicao
     * @author Rafael Delfino Calzado
     * @since 15/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.triagemDistribuicao = async function (req, res, next) {

        try {

            var objCalc = req.objCalc;
            objCalc.arCargasST = [];

            if (objCalc.arCargasCD.length == 0) {

                var objRet = { blOK: false, error: 'Nenhuma carga a ser distribuída' };

            } else {

                var arCargasFR = [...new Set(objCalc.arCargasCD.map(uk => uk.IDG046))];

                var parm = { objConn: req.objConn, post: { tpCalcFrete: 'C', IDG046: arCargasFR } };
    
                var arFreRec = await fdao.calculaFrete(parm, res, next);
    
                for (a of objCalc.arCargasCD) {
    
                    var arFreRecFiltro = arFreRec.filter(f => { return f.IDG046 == a.IDG046 }); 
    
                    if (arFreRecFiltro.length == 0) { 
    
                        var objRet = { blOK: false, error: `Não foi encontrada tabela de frete a receber para a carga #${a.IDG046}` };

                        objCalc.arCargasST.push(a);
                        objCalc.arCargasCD.shift();
    
                    } else {
    
                        parm.post = { tpCalcFrete: 'T', IDG046: [a.IDG046], SNCARPAR: a.SNCARPAR };
    
                        var arFrePag = await fdao.calculaFrete(parm, res, next);

                        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                        switch (req.tpOferec) {

                            case 'S': //SAVE

                                for (var obj3PL of a.arTransp) {
                                    if (obj3PL.SNBRAVO == 'S') arFrePag.push(this.adicionaFreteBravo(obj3PL, arFreRecFiltro[0]));
                                }

                                var arFreSave = this.associaFrete(a.arTransp, arFrePag);
                                var arFrePagFiltro = this.menoValorFrete(arFreSave);                          
                                break;

                            case 'O': //SPOT
                                var arFrePagFiltro = [a.objFreSpot];

                                if (a.objFreSpot.SNBRAVO == 'S') 
                                    arFrePag.push(this.adicionaFreteBravo(a.objFreSpot, arFreRecFiltro[0]));
                                else if (a.objFreSpot.IDG085 == null) 
                                    arFrePag.push(a.objFreSpot);
                                break; 

                            case 'B': //BID
                            default:

                                if (a.SNBRAVO == 'S') 
                                    arFrePag.push(this.adicionaFreteBravo(a, arFreRecFiltro[0]));
        
                                var arFrePagFiltro = arFrePag.filter(f => { return f.IDG024 == a.IDG024 });
                                if (arFrePagFiltro.length > 0) arFrePagFiltro[0].IDO009 = a.IDO009;
                                break;

                        }

                        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                        if (arFrePagFiltro.length == 0) {

                            var objRet = { blOK: false, error: `Não foi encontrada tabela de frete a pagar para a carga #${a.IDG046}` };

                            objCalc.arCargasST.push(a);
                            objCalc.arCargasCD.shift();    

                        } else {

                            parm.post.IDG024SV = arFrePag[0].IDG024;
                            parm.post.VRFREMIN = arFrePag[0].VRFRETE;

                            parm.post.VRFREREC = arFreRecFiltro[0].VRFRETE; 
                            parm.post.VRFREPAG = arFrePagFiltro[0].VRFRETE;
                            parm.post.IDG085   = arFrePagFiltro[0].IDG085;
                            parm.post.IDO009   = arFrePagFiltro[0].IDO009;
                            parm.post.IDG024   = arFrePagFiltro[0].IDG024;
                            
                            parm.post.TPOFEREC = req.tpOferec;
                            parm.post.IDS001OF = req.IDS001; 
                            parm.post.IDG046   = a.IDG046;

                            var pcLucro = 100 * (parm.post.VRFREREC / parm.post.VRFREPAG);
                            parm.post.STCARGA = parm.post.STOFEREC = ((pcLucro < arFrePagFiltro[0].PCPREFRE) && (arFrePagFiltro[0].SNBRAVO == 'N')) ?  'P' : 'R';                    

                            var objRet = await api.novoOferecimento(parm, res, next);    

                        }
    
                    }

                    if (!objRet.blOK) break;

                }    

            }

            objCalc.blOK  = ((objRet.blOK) && (objCalc.arCargasCD.length == req.ttCargas));
            objCalc.error = objRet.error;

            return objCalc;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Muda o Status da Carga e a Transportadora, se necessário
     * @function api/mudaStatusCarga
     * @author Rafael Delfino Calzado
     * @since 14/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna uma objeto em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.mudaStatusCarga = async function (req, res, next) {

        try {

            var objDados = fmt.setSchema(mdl.statusCarga, req.post);
            objDados.objConn = req.objConn;

            await dao.controller.setConnection(objDados.objConn);
            return await dao.alterar(objDados, res, next);

        } catch (err) {

            throw err;

        }   

    } 

    //-----------------------------------------------------------------------\\
    /**
     * Faz um novo oferecimento para a carga indicada
     * @function api/novoOferecimento
     * @author Rafael Delfino Calzado
     * @since 14/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.novoOferecimento = async function (req, res, next) {

        try {

            var objVal = fmt.checaEsquema(req.post, mdl.O005.columns);
            
            if (objVal.blOK) {

                await this.mudaStatusCarga(req, res, next);

                mdl.O005.key     = ['IDG046', 'IDG024'];
                objDados         = fmt.setSchema(mdl.O005, req.post);
                objDados.objConn = req.objConn;
    
                await dao.controller.setConnection(objDados.objConn);
                await dao.remover(objDados, res, next);

                req.post.DTOFEREC = tmz.dataAtualJS();

                mdl.O005.key      = ['IDO005'];
                objDados          = fmt.setSchema(mdl.O005, req.post);
                objDados.objConn  = req.objConn;
    
                await dao.controller.setConnection(objDados.objConn);
                await dao.inserir(objDados, res, next);

            }

            var objRet = { blOK: objVal.blOK, strErro: objVal.strErro }; 

            return objRet;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Filtra regras não aplicáveis na carga
     * @function api/filtraRegra
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @return {Array}      Retorna o array filtrado
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.filtraRegra = function (arOferec) {

        try {

            var arFiltro        = [];
            var arFiltroCarga   = [];
            var arFiltroCidade  = [];
            var arFiltroCliente = [];
            var arIDCarga       = [...new Set(arOferec.map(uk => uk.IDG046))];
    
            for (var id of arIDCarga) {
    
                arFiltroCarga = arOferec.filter(f => { return f.IDG046 == id }); 
    
                arFiltroCliente = arFiltroCarga.filter(f => { return f.IDG005 == f.IDCLIENTE }); 
    
                if (arFiltroCliente.length == 0) {
    
                    arFiltroCidade = arFiltroCarga.filter(f => { return f.IDG003 == f.IDCIDADE }); 
                    arFiltro = (arFiltroCidade.length == 0) ? arFiltro.concat(arFiltroCarga) : arFiltro.concat(arFiltroCidade);
    
                } else {
    
                    arFiltro = arFiltro.concat(arFiltroCliente);
                
                }
    
            }
    
            return arFiltro;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Corrige a defasagem de peso e distribuição na matriz de participantes
     * @function api/ajusteDistribuicao
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @return {Array}      Retorna o array com peso e percentual atualizados
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.ajusteDistribuicao = function (arPart, idRegra) {

        try {

            //Soma o Total do Peso da Regra

            var arFiltroRegra = arPart.filter(f => { return (f.IDO008 == idRegra) });
            var psTotal = 0;
            var idPart  = null;
    
            for (var a of arFiltroRegra) {
    
                if (idPart !== a.IDO009) {
    
                    idPart   = a.IDO009;
                    psTotal += a.PSATUAL;
    
                }
    
            }
    
            //Atualiza peso total e percentual de distribuição
    
            for (var a of arFiltroRegra) {
    
                a.PSTOTAL = psTotal;
                a.PCATUAL = (a.PSTOTAL == 0) ? 0 : parseFloat(((a.PSATUAL * 100) / a.PSTOTAL).toFixed(2));
    
            } 
    
            return arPart;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Atualiza o peso atual oferecido ao participante
     * @function api/ajustePeso
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @return {Array}      Retorna o array com peso e percentual atualizados
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\
  
    api.ajustePeso = function (arPart, idPart, psSoma) {

        try {

            var arFiltro = arPart.filter(f => { return (f.IDO009 == idPart) });
        
            for (var a of arFiltro) a.PSATUAL += psSoma;
    
            return arPart;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna um array com dados únicos de cada carga
     * @function api/filtraDadosCarga
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async 
     * @return {Array}      Retorna o array com peso e percentual atualizados
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.filtraDadosCarga = function(arOferec) {

        try {

            var arIdCargas = [...new Set(arOferec.map(uk => uk.IDG046))];
            var arCargas   = [];
        
            for (var i of arIdCargas) {
        
                var arDadosCarga = arOferec.filter(f => { return (f.IDG046 == i) });        
                arCargas.push(arDadosCarga[0]);
        
            }
    
            return arCargas;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Realiza os cálculos de distribuição de cargas de acordo com as regras
     * @function api/calculaDistribuicao
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async
     * @return {Object}     Retorna um objeto com o resultado da distribuição
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\
    
    api.calculaDistribuicao = async function (req, res, next) {

        try {

            var arCargasSR    = []; 
            var arCargasFO    = []; 
            var arCargasCD    = []; 
        
            var arPartFiltro  = []; 
            var arOferCarga   = []; 
            var arIdPartCarga = [];
            
            var arPart   = req.arPart;
            var arOferec = req.arOferec;            

            //Dados únicos por carga
            var arCargas = this.filtraDadosCarga(arOferec);

            for (var c of arCargas) {
                
                //Filtro por regra e frota;
                arPartFiltro = arPart.filter(f => { return ((f.IDO008 == c.IDO008) && (f.IDG030 == c.IDG030)) });

                if (arPartFiltro.length == 0) {
                    
                    //Sem regra de distribuição
                    arCargasSR.push(c);

                } else {

                    //Array de oferecimentos por carga
                    arOferCarga = arOferec.filter (f => { return (f.IDG046 == c.IDG046) });

                    //Array de ID's de Participantes já ofertados na carga
                    arIdPartCarga = arOferCarga.map(uk => uk.IDO009);

                    //remove 3PL's que recusaram
                    arPartFiltro = arPartFiltro.filter(f => { return !arIdPartCarga.includes(f.IDO009) }); 

                    if (arPartFiltro.length == 0) {

                        //Cargas não distribuídas por fim de oferta
                        arCargasFO.push(c);

                    } else {

                        switch (req.tpOferec) {

                            //SAVE
                            case 'S':
                                var objDist = { IDG046: c.IDG046, IDO008: c.IDO008, SNCARPAR: c.SNCARPAR };
                                objDist.arTransp = arPartFiltro;
                                break;

                            //BID
                            //case 'B': 
                            default:
                                var objDist = this.distribuiMenorPart(arPartFiltro);
                                objDist.IDG046   = c.IDG046; 
                                objDist.SNCARPAR = c.SNCARPAR;
                                arPart = this.ajustePeso(arPart, objDist.IDO009, c.PSCARGA);
                                arPart = this.ajusteDistribuicao(arPart, objDist.IDO008);
                                break;

                        }
                
                        arCargasCD.push(objDist);
                                                
                    }
                
                }

            }

            var objRet = { arCargasCD, arCargasSR, arCargasFO };

            return objRet;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Distribui o fornecimento para o primeiro transportador 
     * com participação atual inferior à contratada 
     * @function distribuiMenorPart
     * @author Rafael Delfino Calzado
     * @since 09/05/2019
     *
     * @return {Object}     Retorna um objeto com o resultado da distribuição
     */
    //-----------------------------------------------------------------------\\

    api.distribuiMenorPart = function(arPartFiltro) {

        var objDist = {};

        //Registra o primeiro, caso não haja percentual disponível para distribuição
        //Regra de Negócio determinada pela diretoria

        objDist.IDO008   = arPartFiltro[0].IDO008;
        objDist.IDO009   = arPartFiltro[0].IDO009;
        objDist.IDG024   = arPartFiltro[0].IDG024;        
        objDist.SNBRAVO  = arPartFiltro[0].SNBRAVO;
        objDist.PCPREFRE = arPartFiltro[0].PCPREFRE;

        for (var p of arPartFiltro) {

            if (p.PCATUAL < p.PCATENDE) {

                objDist.IDO008   = p.IDO008;
                objDist.IDO009   = p.IDO009;
                objDist.IDG024   = p.IDG024;
                objDist.SNBRAVO  = p.SNBRAVO;
                objDist.PCPREFRE = p.PCPREFRE;
                break;

            }

        }

        return objDist;

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o somatório das previsões de frete
     * @function fretePanorama
     * @author Rafael Delfino Calzado
     * @since 24/05/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.fretePanorama = async function (req, res, next) {

        try {

            var arRS = await fdao.fretePanorama(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o somatório das previsões de frete
     * @function menoValorFrete
     * @author Rafael Delfino Calzado
     * @since 21/08/2019
     *
     * @return {Array}      Retorna o resultado com o menor frete, se houver
     * @throws {Object}     Retorna o objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.menoValorFrete = function (arFreteSave) {

        try {

            var arMenorFrete = arFreteSave;

            if (arFreteSave.length > 0) {

                var vrFreMin = (arFreteSave[0].VRFRETE) ? arFreteSave[0].VRFRETE : 10000000;
                
                for (var objMenorFrete of arFreteSave) {

                    if ((objMenorFrete.VRFRETE) && (objMenorFrete.VRFRETE < vrFreMin)) {
                        vrFreMin = objMenorFrete.VRFRETE;
                        arMenorFrete = [objMenorFrete];
                    }

                }

            }

            return arMenorFrete;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Função para retornar valor de Frete para 3PL Bravo
     * @function adicionaFreteBravo
     * @author Rafael Delfino Calzado
     * @since 21/08/2019
     *
     * @return {Object}     Retorna objeto utilizando valor de frete a receber
     * @throws {Object}     Retorna o objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.adicionaFreteBravo = function (obj3PL, objFreteRec) {

        try {

            var objBravo = 
            {
                IDG024:     obj3PL.IDG024,
                SNBRAVO:    obj3PL.SNBRAVO,
                PCPREFRE:   obj3PL.PCPREFRE,
                IDG046:     objFreteRec.IDG046,
                IDG085:     objFreteRec.IDG085,                
                VRFRETE:    objFreteRec.VRFRETE
            };

            return objBravo;

        } catch (err) {

            throw err;

        }

    }
 
    //-----------------------------------------------------------------------\\
    /**
     * Retorna as exigências de clientes especiais
     * @function exigenciasClientes
     * @author Rafael Delfino Calzado
     * @since 30/09/2019
     *
     * @return {Array}      Retorna o resultado com o menor frete, se houver
     * @throws {Object}     Retorna o objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.exigenciaCliente = async function (req, res, next) {

        try {

            var parm = { id: req.params.id };
            parm.objConn = await dao.controller.getConnection(null, req.UserId);

            var arRS = await dao.exigenciaCliente(parm, res, next);
            
            var arRet = [];

            while (arRS.length > 0) {

                var IDG048 = arRS[0].IDG048;

                var objHead = 
                {
                    IDG046:     arRS[0].IDG046,
                    IDG048:     arRS[0].IDG048,
                    NRSEQETA:   arRS[0].NRSEQETA,
                    IDG005:     arRS[0].IDG005,
                    NMCLIENT:   arRS[0].NMCLIENT,
                    NMCIDADE:   arRS[0].NMCIDADE,
                    CDESTADO:   arRS[0].CDESTADO,
                    AREXIGE:    []
                };

                while ((arRS.length > 0) && (IDG048 == arRS[0].IDG048)) {

                    var objExige = { IDG097: arRS[0].IDG097, DSVALUE: arRS[0].DSVALUE };
                    objHead.AREXIGE.push(objExige);
                    arRS.shift();

                }

                arRet.push(objHead);

            }

            res.send(arRet);


        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}
