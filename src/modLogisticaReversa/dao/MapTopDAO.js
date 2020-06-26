module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;
    api.inserir    = gdao.inserir;
    api.alterar    = gdao.alterar;
    api.remover    = gdao.remover;    
    
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

            if (req.method == 'POST') {

                var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'I020', false);

            } else {

                var sqlWhere    = `AND I020.IDI020 = ${req.params.id}`;
                var sqlOrder    = ``;
                var sqlPaginate = ``;
                var bindValues  = [];

            }

            var sql = 
                `SELECT 
                    I020.IDI020,
                    I020.STCADAST,
                    G024.IDG024,
                    G024.CJTRANSP,
                    G024.NMTRANSP,
                    G002.IDG002,
                    G002.NMESTADO,
                    G002.CDESTADO,
                    G003.IDG003,
                    NVL(G003.NMCIDADE, 'TODAS') NMCIDADE,

                    COUNT(*) OVER() COUNT_LINHA
		
                FROM I020

                INNER JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = I020.IDG024
                    
                INNER JOIN G002 -- ESTADOS
                    ON G002.IDG002 = I020.IDG002
                    
                LEFT JOIN G003 -- CIDADES
                    ON G003.IDG003 = I020.IDG003
                    
                WHERE 1 = 1 
                    ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

            var arRS = await gdao.executar({sql, bindValues}, res, next);

            if (req.method == 'POST')                 
                return utils.construirObjetoRetornoBD(arRS);
            else 
                return arRS;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;
}
