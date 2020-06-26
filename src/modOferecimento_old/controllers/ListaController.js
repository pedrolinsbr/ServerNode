module.exports = function (app, cb) {

    const dao = app.src.modOferecimento.dao.ListaDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista e filtra as cargas na tela de Oferecimento
     * @function api/listaCargas
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listaCargas = async function (req, res, next) {

        try {

            req.objConn = await dao.controller.getConnection();

            var arRS = await dao.listaCargas(req, res, next);

            await req.objConn.close();

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista e filtra as cargas na tela de Oferecimento
     * @function api/listaCabecalho
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listaCabecalho = async function (req, res, next) {

        try {

            var arRS = await dao.listaCabecalho(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista históricos de oferecimento da carga indicada
     * @function api/listaHistorico
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listaHistorico = async function (req, res, next) {

        try {

            var arRS = await dao.listaHistorico(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}