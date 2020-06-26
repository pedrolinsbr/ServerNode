module.exports = function (app, cb) {

    const tmz = app.src.utils.DataAtual;
    const fmt = app.src.utils.Formatador;
    const mdl = app.src.modLogisticaReversa.models.MapTopModel;
    const dao = app.src.modLogisticaReversa.dao.MapTopDAO;
    
    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de área de atendimento da 3PL
     * @function api/checkModel
     * @author Rafael Delfino Calzado
     * @since 25/04/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkModel = function (req, res, next) {

        var parm = { post: req.body, model: mdl.I020.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Insere / Atualiza os dados da área de atendimento da 3PL
     * @function api/edita
     * @author Rafael Delfino Calzado
     * @since 25/04/2019
     *
     * @returns {Object}    Retorna um objeto com o resultado da ação
     * @throws  {Object}    Retorna um objeto em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res, next) {

        try {

            var parm = { post: req.body };
            parm.post.DTCADAST = tmz.dataAtualJS();

            var objDados = fmt.setSchema(mdl.I020, parm.post);
            objDados.UserId = parm.post.IDS001;

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
     * Remove os dados da área de atendimento da 3PL
     * @function api/remove
     * @author Rafael Delfino Calzado
     * @since 25/04/2019
     *
     * @returns {Object}    Retorna um objeto com o resultado da ação
     * @throws  {Object}    Retorna um objeto em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.remove = async function (req, res, next) {

        try {

            var objSchema = Object.assign({}, mdl.I020);
            objSchema.vlKey[objSchema.key[0]] = req.params.id;
            objSchema.UserId = req.UserId;

            var objRet = await dao.remover(objSchema, res, next);

            res.send(objRet);
            
        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista os dados da área de atendimento da 3PL
     * @function api/lista
     * @author Rafael Delfino Calzado
     * @since 25/04/2019
     *
     * @returns {Array}     Retorna um array com o resultado da pesquisa
     * @throws  {Object}    Retorna um objeto em caso de erro
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

    return api;

}