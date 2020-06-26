module.exports = function (app, cb) {

    const fmt = app.src.utils.Formatador;
    const mdl = app.src.modOferecimento.models.NivelModel;
    const dao = app.src.modOferecimento.dao.NivelDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de nível de aprovação
     * @function api/checkModel
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checkModel = function (req, res, next) {

        var parm = { post: req.body, model: mdl.O011.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de nível por usuário
     * @function api/checkUsuario
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checkUsuario = function (req, res, next) {

        var parm = { post: req.body, model: mdl.usuarios.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa os níveis de aprovação de acordo com os filtros da grid
        *
        * @async 
        * @function lista
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna um objecto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.lista = async function (req, res, next) {

        try {

            var arRS = await dao.lista(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa o nível de aprovação por usuário
        *
        * @async 
        * @function listaUsuario
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna um objecto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.listaUsuario = async function (req, res, next) {

        try {

            var arRS = await dao.listaUsuario(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere usuário em um nível de aprovação
        *
        * @async 
        * @function insUsuario
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna um objeto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.insUsuario = async function (req, res, next) {

        try {

            var parm = { post: req.body, UserId: req.UserId };

            await dao.insUsuario(parm, res, next);
            res.send({ blOK: true });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\  
    /**
        * @description Insere usuário em um nível de aprovação
        *
        * @async 
        * @function removeUsuario
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna um objeto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.removeUsuario = async function (req, res, next) {

        try {

            await dao.removeUsuario(req, res, next);
            res.send({blOK: true});

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere/Atualiza os dados do nível selecionado 
        *
        * @async 
        * @function edita
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res, next) {

        try {

            var objDados = fmt.setSchema(mdl.O011, req.body);
            objDados.UserId = req.UserId;

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
        * @description Remove o nível selecionado 
        *
        * @async 
        * @function remove
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.remove = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.O011.key[0]] = req.params.id;

            var objDados = fmt.setSchema(mdl.O011, parm);
            var objRet   = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}