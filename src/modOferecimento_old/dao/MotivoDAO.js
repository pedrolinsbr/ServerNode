module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;	

    var api = {};
    api.controller = app.config.ControllerBD;
    api.alterar    = gdao.alterar;
    api.inserir    = gdao.inserir;
    
    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa os dados dos motivos de acordo com os filtros da grid
        *
        * @async 
        * @function lista
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.lista = async function (req, res, next) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'O004', true);

            var sql = 
                `SELECT 
                    O004.IDO004, 
                    O004.DSMOTIVO, 
                    O004.STCADAST,
                    O004.VRSCORE, 
                    TO_CHAR(O004.DTCADAST, 'DD/MM/YYYY HH24:MI') DTCADAST,
                    COUNT(*) OVER() COUNT_LINHA
                FROM O004 
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;
                
            var arRS = await gdao.executar({sql, bindValues}, res, next);

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err
        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;
}
