module.exports = function (app, cb) {

    const tmz     = app.src.utils.DataAtual;
    const utilFMT = app.src.utils.Formatador;
    const mdl     = app.src.modOferecimento.models.RegraModel;
    const dao     = app.src.modOferecimento.dao.RegraDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista regras de acordo com filtro da grid
        *
        * @async 
        * @function listaRegra			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaRegra = async function (req, res, next) {

        try {

            var rs = await dao.listaRegra(req, res, next);
            res.send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica parâmetros do modelo de Regras
        *
        * @async 
        * @function checkModelRegra			
        * 
        * @throws   {Object}  Retorna o erro de compatibilidade do modelo
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.checkModelRegra = function (req, res, next) {

        var parm = { post: req.body, model: mdl.O008.columns };
        utilFMT.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica parâmetros do modelo de Participantes da Regra
        *
        * @async 
        * @function checkModelPart			
        * 
        * @throws   {Object}  Retorna o erro de compatibilidade do modelo
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.checkModelPart = function (req, res, next) {

        var parm = { post: req.body, model: mdl.part.columns };
        utilFMT.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica parâmetros da busca por especialidade na regra
        *
        * @async 
        * @function checkModelEspec
        * 
        * @throws   {Object}  Retorna o erro de compatibilidade do modelo
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.checkModelEspec = function (req, res, next) {

        var parm = { post: req.body, model: mdl.buscaEspec.columns };
        utilFMT.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica parâmetros do modelo de Frota Permitida
        *
        * @async 
        * @function checkModelFrota
        * 
        * @throws   {Object}  Retorna o erro de compatibilidade do modelo
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.checkModelFrota = function (req, res, next) {

        var parm = { post: req.body, model: mdl.frota.columns };
        utilFMT.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista frota de um participante em uma regra apontado cadastro
        *
        * @async 
        * @function listaFrota
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Array}   Retorna um array com o resultado da pesquisa
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.listaFrota = async function (req, res, next) {

        try {

            var arRS = await dao.listaFrota(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere frota permitida em massa em uma regra
        *
        * @async 
        * @function insereFrota			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2019
    */
    //-----------------------------------------------------------------------\\   
    
    api.insereFrota = async function (req, res, next) {

        try {

            var parm = { post: req.body };

            parm.objConn = await dao.controller.getConnection(null, parm.post.IDS001);

            await dao.removeFrotaRegra(parm, res, next);
            var objRet = await dao.insereFrota(parm, res, next);

            await parm.objConn.close();
            
            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere participantes em massa na regra
        *
        * @async 
        * @function inserePart			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.inserePart = async function (req, res, next) {

        try {

            var parm = { post: req.body };

            var ttPart = 0;

            for (var a of parm.post.ARPARTIC) {
                ttPart += a.PCATENDE;
            }

            if (ttPart == 0 || ttPart == 100) {

                await dao.inserePart(parm, res, next);
                res.send({ blOK: true });

            } else {

                res.status(400).send({ error: `A margem de participação está totalizando ${ttPart.toFixed(2).replace('.',',')}%` });

            }

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Remove um participante de uma regra
        *
        * @async 
        * @function removePart			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.removePart = async function (req, res, next) {

        try {

            var key          = mdl.part.key[0]; 
            var parm         = { post: {} };
            parm.post[key]   = req.params.id;
            parm.post.IDS001 = req.UserID;

            parm.objConn = await dao.controller.getConnection(null, parm.post.IDS001);

            await dao.removeFrotaRegra(parm, res, next);

            await dao.removePart(parm, res, next);

            await parm.objConn.close();

            res.send({ blOK: true });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Inclui/Altera dados da regra
        *
        * @async 
        * @function editaRegra			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.editaRegra = async function (req, res, next) {

        try {

            var parm = req.body;       
            parm.DTCADAST = tmz.dataAtualJS();

            parm.objConn = await dao.controller.getConnection(null, parm.IDS001);

            var arRS = await dao.buscaRegraPrevia(parm, res, next);

            if (arRS.length == 0) {

                var objDados = utilFMT.setSchema(mdl.O008, parm);
                objDados.UserID = objDados.vlFields.IDS001;
                objDados.objConn;
                
                if (Object.keys(objDados.vlKey).length == 0) {

                    var objRet = await dao.inserir(objDados, res, next);
                    
                } else {

                    var objRet = await dao.alterar(objDados, res, next);

                }

                objRet.blOK = true;

            } else {

                var strErro = `A regra #${arRS[0].IDO008} - '${arRS[0].DSREGRA}' já está cadastrada com as mesmas características`;
                var objRet = { blOK: false, error: strErro};

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
        * @description Remove uma regra
        *
        * @async 
        * @function removeRegra			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.removeRegra = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.O008.key[0]] = req.params.id;

            var objDados = utilFMT.setSchema(mdl.O008, parm);
            var objRet   = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da especialidade da Regra
        *
        * @async 
        * @function buscaEspecialidade
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.buscaEspecialidade = async function (req, res, next) {

        try {

            var parm = req.body;

            if (parm.TPBUSCA == 1) {

                var arRS = await dao.buscaCidadeRegra(parm, res, next);

            } else {

                var arRS = await dao.buscaClienteRegra(parm, res, next);

            }

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da transportadoras não contidas na Regra
        *
        * @async 
        * @function lista3PL
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\          

    api.lista3PL = async function (req, res, next) {

        try { 

            var arRS = await dao.lista3PL(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }


    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da transportadoras contidas na Regra
        *
        * @async 
        * @function lista3PLRegra
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\          

    api.lista3PLRegra = async function (req, res, next) {

        try { 

            var arRS = await dao.lista3PLRegra(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }


    }

    //-----------------------------------------------------------------------\\       

    return api;

}