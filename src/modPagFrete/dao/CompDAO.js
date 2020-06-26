module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\  
    /**
    * @description Lista componentes padrão
    * @function listarComponente
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.listarComponente = async function (req, res, next) {

        var objConn = await gdao.controller.getConnection();

        var sql = 
            `SELECT 
                
                	IDG062
                ,	NMCOMPAD
                ,	DSLEGEND
                
            FROM G062
        
            WHERE G062.SNDELETE = 0`;

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {                
            await objConn.close();
            return result;
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });         

    }

    //-----------------------------------------------------------------------\\    
    /**
    * @description Listar relação de componentes variáveis
    * @function buscarCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Object}  req.body parâmetros de pesquisa
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.buscarCompEmite = async function(req, res, next) {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G063', true);

        var objConn = await gdao.controller.getConnection();

        var sql = this.getSQL() + ` ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

        return await objConn.execute({ sql, param: bindValues })

        .then(async (result) => {                
            await objConn.close();
            return utils.construirObjetoRetornoBD(result);
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        }); 

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description edita a relação de componentes variáveis
    * @function editarCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Number}  id chave da tabela G063
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.editarCompEmite = async function(req, res, next) {

        var objConn = await gdao.controller.getConnection();

        var sql = this.getSQL() + ` WHERE G063.IDG063 = ${req.params.id}`;

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {                
            await objConn.close();
            return result;
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        }); 

    }

    //-----------------------------------------------------------------------\\ 
    
    api.getSQL = function () {
        
        var sql =         
            `SELECT 

                    G024.IDG024
                ,	G024.NMTRANSP
                
                ,	G062.IDG062
                ,	G062.NMCOMPAD
                ,	G062.DSLEGEND
                
                ,	G063.IDG063
                ,	G063.NMCOMVAR

                ,   COUNT(*) OVER() AS COUNT_LINHA
                
            FROM G063 

            INNER JOIN G062 
                ON G062.IDG062 = G063.IDG062
                AND G062.SNDELETE = 0

            INNER JOIN G024 
                ON G024.IDG024 = G063.IDG024
                AND G024.SNDELETE = 0`;

        return sql;

    }

    //-----------------------------------------------------------------------\\    

    return api;
}