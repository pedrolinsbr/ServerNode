module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * Lista os contatos disponíveis da transportadora
     * @function api/listar
     * @author Rafael Delfino Calzado
     * @since 28/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G007', true);

        var sql = this.getSqlContato() +  
                `${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

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

    api.editar = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql = api.getSqlContato() + ` WHERE G007.IDG007 = ${req.params.id}`;

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

    api.listarTipo = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G008', true);

        var sql = api.getSqlTipo() + `${sqlWhere} ${sqlOrder} ${sqlPaginate}`;                

        return await objConn.execute({ sql, param: bindValues })

        .then(async (result) => {
            await objConn.close();
            return utils.construirObjetoRetornoBD(result);
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw (err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.editarTipo = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql = api.getSqlTipo() + ` WHERE G008.IDG008 = ${req.params.id}`;

        return await objConn.execute({ sql, param: []})

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw (err);
        });
    }

    //-----------------------------------------------------------------------\\

    api.listarSetor = async function (req, res, next) {
        return await utils.searchComboBox('IDG006', 'DSSETOR', 'G006', ['IDG006', 'DSSETOR'], req.body);  
    }

    //-----------------------------------------------------------------------\\

    api.listarCargo = async function (req, res, next) {
        return await utils.searchComboBox('IDG039', 'DSCARGO', 'G039', ['IDG039', 'DSCARGO'], req.body);  
    }    

    //-----------------------------------------------------------------------\\

    api.getSqlContato = function () {

        var strSQL = 
            `SELECT 

                    G007.IDG007
                ,	G007.NMCONTAT
                
                ,   G006.IDG006
                ,   G006.DSSETOR

                ,   G025.IDG024

                ,	G039.IDG039
                ,	G039.DSCARGO
                ,   COUNT(*) OVER() AS COUNT_LINHA

            FROM G007 -- CONTATOS

            INNER JOIN G006 -- SETOR
                ON G006.IDG006 = G007.IDG006

            INNER JOIN G025 -- CONTATOS x 3PL
                ON G025.IDG007 = G007.IDG007

            INNER JOIN G039 -- CARGO
                ON G039.IDG039 = G007.IDG039`;

        return strSQL;
    }

    //-----------------------------------------------------------------------\\

    api.getSqlTipo = function () {

        var strSQL = `SELECT 
                            G007.IDG007
                        ,	G007.NMCONTAT
                        
                        ,	G008.IDG008
                        ,	G008.TPCONTAT
                        ,	G008.DSCONTAT
                        
                        ,	CASE 
                                WHEN (G008.TPCONTAT = 'C') THEN 'CELULAR'
                                WHEN (G008.TPCONTAT = 'T') THEN 'TELEFONE'
                                WHEN (G008.TPCONTAT = 'E') THEN 'EMAIL'
                                ELSE 'OFERECIMENTO'
                            END CBCONTAT

                        ,   COUNT(*) OVER() AS COUNT_LINHA                            

                        FROM G007 -- CONTATOS

                        INNER JOIN G008 -- TIPOS DE CONTATOS
                            ON G008.IDG007 = G007.IDG007`;

        return strSQL;
    }

    //-----------------------------------------------------------------------\\    
    
    return api;
}