/**
 * @module modGlobal/dao/GenericDAO
 *
 * @requires module:utils/FuncoesObjDB
 * @requires module:config/ControllerBD
*/
module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * @description Retorna a condição de WHERE do SQL de acordo com os parâmetros informados
     * @function retornaCondicoes
     * @author Rafael Delfino Calzado
     * @since 04/04/2018
     *
     * @param   {string} key   Nome do campo chave
     * @param   {string} vlKey Valor do campo chave
     * @returns {string}       Retorna string SQL
     */
    //-----------------------------------------------------------------------\\

    api.retornaCondicoes = function (param) {

        var strSQL = '';

        for (var k of param.key) {

            var v = param.vlKey[k];
            strSQL += (Array.isArray(v)) ? `${k} IN (${v.join()})` : `${k} = ${v}`;
            strSQL += ` AND `;
        }

        strSQL = strSQL.substr(0, strSQL.length - 5);

        return strSQL;
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os registros da tabela com filtro
     * @function listar
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, req.table, true);

        var sql = `SELECT ${req.columns.join()}, COUNT(*) OVER () as COUNT_LINHA
                   FROM ${req.table}
                   ${sqlWhere}
                   ${sqlOrder}
                   ${sqlPaginate}`;

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
     * @description Lista o registro com o ID especificado
     * @function editar
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.editar = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        return await objConn.execute({
            sql: `SELECT ${req.columns.join()} FROM ${req.table} WHERE ` + api.retornaCondicoes(req),
            param: []
        })

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
     * @description Insere um registro na tabela
     * @function inserir
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.inserir = async function (req, res, next) {

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);

        var objIns =
            {
                tabela:  req.table,
                colunas: req.vlFields
            };

        if (Array.isArray(req.key)) objIns.key = req.key[0];

        return await objConn.insert(objIns)

        .then(async (result) => {
            await objConn.close();
            return { id: result };
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Remove um registro específico da tabela
     * @function remover
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.remover = async function (req, res, next) {

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);

        var sql = `DELETE FROM ${req.table} WHERE ` + api.retornaCondicoes(req);

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {
            await objConn.close();
            return { blOK: true };
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Altera registro(s) da tabela
     * @function alterar
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.alterar = async function (req, res, next) {

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);

        return await objConn.update({
            tabela:     req.table,
            colunas:    req.vlFields,
            condicoes:  api.retornaCondicoes(req),
            parametros: {}
        })

        .then(async (result) => {
            await objConn.close();
            return { nrRows: result };
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Executa um comando SQL com opção de Rollback
     * @function excecutar
     * @author Rafael Delfino Calzado
     * @since 27/08/2018
     *
     * @async
     * @param   {Object} objConn Objeto de Conexão ao Banco
     * @param   {String} sql     Comando SQL
     * @param   {String} type    Tipo de Instrução SQL
     * @param   {Array}  param   Parâmetros de Bind na Instrução SQL
     * @returns {Array}          Retorna resultado da pesquisa em um array
     * @throws  {Object}         Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.executar = async function (req, res, next) {

        var objExecute = { sql: req.sql, fetchInfo: req.fetchInfo };
        objExecute.param = (req.bindValues !== undefined) ? req.bindValues : [];

        var arType = req.sql.replace(/\n+/g, ' ').replace(/\s+/g, ' ').split(' ');
        objExecute.type = arType[0].toUpperCase();

		var objConn = await this.controller.getConnection(req.objConn, req.UserId);

		return await objConn.execute(objExecute)

		.then(async (result) => {
			await objConn.close();
			return result;
		})

		.catch(async (err) => {
			await objConn.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		});

    }

    //-----------------------------------------------------------------------\\

    return api;
}