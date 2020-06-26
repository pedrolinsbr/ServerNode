module.exports = function (app, cb) {

    const dao = app.src.modOferecimento.dao.RelatorioDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Relatório de Distribuição de Cargas por Regra de Oferecimento
     * @function relDistribuicao
     * @author Rafael Delfino Calzado
     * @since 29/05/2019
     *
     * @returns {Array}      Retorna um array com o resultado da pesquisa
     * @throws  {String}     Retorna uma mensagem com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.relDistribuicao = async function (req, res, next) {

        try {

            var arRet = [];
            var arRS  = await dao.relDistribuicao(req, res, next);

            while (arRS.length > 0) {

                var idRegra = arRS[0].IDO008;

                var objRegra =
                    {
                        IDO008:     arRS[0].IDO008,
                        DSREGRA:    arRS[0].DSREGRA,
                        LOADTRUCK:  arRS[0].LOADTRUCK,
                        TPOPERAC:   arRS[0].TPOPERAC,
                        CDESTADO:   arRS[0].CDESTADO,
                        NMCIDADE:   arRS[0].NMCIDADE,
                        NMCLIENT:   arRS[0].NMCLIENT,
                        TTGERAL:    arRS[0].TTGERAL,
                        PSTOTAL:    arRS[0].PSTOTAL,
                        ARDISTRI:   []
                    };

                while ((arRS.length > 0) && (idRegra == arRS[0].IDO008)) {

                    var objDist =
                        {
                            IDO009:     arRS[0].IDO009,
                            NMTRANSP:   arRS[0].NMTRANSP,
                            PCATENDE:   arRS[0].PCATENDE,
                            TTCARGA:    arRS[0].TTCARGA,
                            PSCARGA:    arRS[0].PSCARGA,
                            PCREALTC:   ((arRS[0].TTCARGA / arRS[0].TTGERAL) * 100),
                            PCREALPS:   ((arRS[0].PSCARGA / arRS[0].PSTOTAL) * 100)
                        };

                    objRegra.ARDISTRI.push(objDist);

                    arRS.shift();

                } 

                arRet.push(objRegra);

            }

            res.send(arRet);

        } catch (err) {

            res.status(500).send({ err: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Relatório Histórico de Oferecimentos
     * @function relOferecimento
     * @author Rafael Delfino Calzado
     * @since 28/08/2019
     *
     * @returns {Array}      Retorna um array com o resultado da pesquisa
     * @throws  {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.relOferecimento = async function (req, res, next) {

        try {

            var arRS = await dao.relOferecimento(req, res, next);

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ err: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}
