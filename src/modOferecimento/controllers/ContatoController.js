module.exports = function (app, cb) {

    const tmz = app.src.utils.DataAtual;    
    const fmt = app.src.utils.Formatador;    
    const mdl = app.src.modOferecimento.models.ContatoModel;
    const dao = app.src.modOferecimento.dao.ContatoDAO;
    
    var api = {};

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o modelo de preenchimento do contato
        *
        * @async 
        * @function checkModelContato
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.checkModelContato = function (req, res, next) {

        var parm = { post: req.body, model: mdl.contato.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o modelo de preenchimento do tipo de contato
        *
        * @async 
        * @function checkModelTipo
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.checkModelTipo = function (req, res, next) {

        var parm = { post: req.body, model: mdl.G008.columns };
        fmt.chkModelPost(parm, res, next);

    }
    
    //-----------------------------------------------------------------------\\
    /**
        * @description Lista contatos da transportadoras
        *
        * @async 
        * @function listaContato			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaContato = async function (req, res, next) {

        try {

            var arRS = await dao.listaContato(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista os tipos de contato cadastrados para uma pessoa
        *
        * @async 
        * @function listaTipo			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaTipo = async function (req, res, next) {

        try {

            var arRS = await dao.listaTipo(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Edita os dados do contato da transportadora
        *
        * @async 
        * @function editaContato
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.editaContato = async function (req, res, next) {

        try {

            var parm = { post: req.body, UserID: req.body.IDS001 };

            parm.post.DTCADAST = tmz.dataAtualJS();
   
            parm.objConn = await dao.controller.getConnection();        

            var key = mdl.G007.key[0];
            var objDados = fmt.setSchema(mdl.G007, parm.post);
            objDados.objConn = parm.objConn;
            objDados.UserID  = parm.UserID;
            
            if (Object.keys(objDados.vlKey).length == 0) {
    
                await dao.controller.setConnection(parm.objConn);
                var objRet = await dao.inserir(objDados, res, next);
    
                objDados = fmt.setSchema(mdl.G025, parm.post);
                objDados.vlFields[key] = objRet.id;
                objDados.objConn = parm.objConn;
                objDados.UserID  = parm.UserID;

                await dao.controller.setConnection(parm.objConn);
                await dao.inserir(objDados, res, next);

            } else {

                await dao.controller.setConnection(parm.objConn);
                var objRet = await dao.alterar(objDados, res, next);

            }

            await parm.objConn.close();

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Edita o tipo do contato da transportadora
        *
        * @async 
        * @function editaTipo
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.editaTipo = async function (req, res, next) {

        try {

            var parm = { post: req.body, UserID: req.body.IDS001 };

            parm.post.DTCADAST = tmz.dataAtualJS();
   
            var objDados = fmt.setSchema(mdl.G008, parm.post);
            objDados.UserID = parm.UserID;
            
            if (Object.keys(objDados.vlKey).length == 0) {
    
                var objRet = await dao.inserir(objDados, res, next);

            } else {

                var objRet = await dao.alterar(objDados, res, next);

            }

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Remove logicamente o contato da transportadora
        *
        * @async 
        * @function removeContato
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.removeContato = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.G007.key[0]] = req.params.id;

            var objDados    = fmt.setSchema(mdl.G007, parm);
            objDados.UserID = req.UserID;

            var objRet = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Remove logicamente o tipo do contato da transportadora
        *
        * @async 
        * @function removeTipo
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.removeTipo = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.G008.key[0]] = req.params.id;

            var objDados    = fmt.setSchema(mdl.G008, parm);
            objDados.UserID = req.UserID;

            var objRet = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;
}