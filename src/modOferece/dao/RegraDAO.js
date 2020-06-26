module.exports = function (app, cb) {

    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const utils = app.src.utils.FuncoesObjDB;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.listaGrid = async function (req, res, next) {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'O008', true);

        var sql =
            `SELECT
                O008.IDO008,
                O008.SNCARPAR,
                O008.DSREGRA,

            CASE
                WHEN O008.SNCARPAR = 'S' THEN 'LTL'
                ELSE 'FTL'
            END LOADTRUCK,

            O008.TPTRANSP,

            CASE
                WHEN O008.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                WHEN O008.TPTRANSP = 'V' THEN 'VENDA'
                WHEN O008.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                WHEN O008.TPTRANSP = 'G' THEN 'RETORNO AG'		
                ELSE 'OUTROS'	
            END TPOPERAC,

            G028.IDG028,
            G028.NMARMAZE,

            G002.IDG002,
            G002.CDESTADO,

            G003.IDG003,
            G003.NMCIDADE,

            G005.IDG005,
            G005.NMCLIENT,

            COUNT(*) OVER() AS COUNT_LINHA

        FROM O008

        INNER JOIN G028 -- ARMAZEM
            ON G028.IDG028 = O008.IDG028

        INNER JOIN G002 -- ESTADO
            ON G002.IDG002 = O008.IDG002

        LEFT JOIN G003 -- CIDADE
            ON G003.IDG003 = O008.IDG003

        LEFT JOIN G005 -- CLIENTE
            ON G005.IDG005 = O008.IDG005

        ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

        var objRet = await gdao.executar({sql, bindValues}, res, next).catch((err) => { throw err });

        return utils.construirObjetoRetornoBD(objRet);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna os dados do registro selecionado para edição
     * @function api/editar
     * @author Rafael Delfino Calzado
     * @since 12/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.editar = async function (req, res, next) {

        req.sql =
            `SELECT
                O008.IDO008,
                O008.DSREGRA,
                O008.SNCARPAR,

                CASE
                    WHEN O008.SNCARPAR = 'S' THEN 'LTL'
                    ELSE 'FTL'
                END LOADTRUCK,

                O008.TPTRANSP,

                CASE
                    WHEN O008.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                    WHEN O008.TPTRANSP = 'V' THEN 'VENDA'
                    WHEN O008.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                    WHEN O008.TPTRANSP = 'G' THEN 'RETORNO AG'
                    ELSE 'OUTROS'	
                END TPOPERAC,

                G028.IDG028,
                G028.NMARMAZE,

                G002.IDG002,
                G002.CDESTADO,
                G002.NMESTADO,

                G003.IDG003,
                UPPER(G003.NMCIDADE) NMCIDADE,

                G005.IDG005,
                UPPER(G005.NMCLIENT) NMCLIENT

            FROM O008 -- REGRAS

            INNER JOIN G028 -- ARMAZEM
                ON G028.IDG028 = O008.IDG028

            INNER JOIN G002 -- UF
                ON G002.IDG002 = O008.IDG002

            LEFT JOIN G003 -- CIDADE
                ON G003.IDG003 = O008.IDG003

            LEFT JOIN G005 -- CLIENTE
                ON G005.IDG005 = O008.IDG005

            WHERE O008.IDO008 = ${req.params.id}`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as 3PL's disponíveis para cadastro
     * @function api/listarR3PL
     * @author Rafael Delfino Calzado
     * @since 05/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarR3PL = async function (req, res, next) {

        var sql =
                `SELECT
                    G024.IDG024,
                    G024.NMTRANSP,
                    G003.NMCIDADE,
                    G002.CDESTADO

                FROM G024 -- 3PL

                INNER JOIN G003 -- CIDADE
                    ON G003.IDG003 = G024.IDG003

                INNER JOIN G002 -- ESTADO
                    ON G002.IDG002 = G003.IDG002

                WHERE 
                    G024.SNDELETE = 0 
                    AND G024.STCADAST = 'A' 
                    AND G024.IDG024 NOT IN 
                    (SELECT IDG024 FROM O009 WHERE IDO008 = ${req})
                    
                ORDER BY G024.NMTRANSP`;

        var parm = { sql };

        return await gdao.executar(parm, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as 3PL's que atendem a regra informada
     * @function api/listarR3PLCad
     * @author Rafael Delfino Calzado
     * @since 05/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarR3PLCad = async function (req, res, next) {

        var sql =
                `SELECT
                    G024.IDG024,
                    G024.NMTRANSP,
                    O009.IDO009,
                    O009.IDO008,
                    O009.PCATENDE,
                    G003.NMCIDADE,
                    G002.CDESTADO

                FROM G024 -- 3PL

                INNER JOIN G003 -- CIDADE
                    ON G003.IDG003 = G024.IDG003

                INNER JOIN G002 -- ESTADO
                    ON G002.IDG002 = G003.IDG002

                INNER JOIN O009 -- REGRAS x 3PL
                    ON O009.IDG024 = G024.IDG024

                WHERE O009.IDO008 = ${req}
                ORDER BY O009.PCATENDE DESC`;

        var parm = { sql };

        return await gdao.executar(parm, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as restrições de veículos na regra da 3PL informada
     * @function api/listarRTPV
     * @author Rafael Delfino Calzado
     * @since 05/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarRTPV = async function (req, res, next) {

        req.sql =
                `SELECT
                    G030.IDG030,
                    G030.DSTIPVEI,
                    G030.QTCAPPES,
                    O010.IDO010

                FROM G030

                ${req.tpJoin} JOIN O010
                    ON O010.IDG030 = G030.IDG030
                    AND O010.IDO009 = ${req.params.id}

                WHERE G030.STCADAST = 'A'
                AND G030.SNDELETE = 0

                ORDER BY G030.QTCAPPES`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.listarArmazem = async function (req, res, next) {
        return await utils.searchComboBox('IDG028', 'NMARMAZE', 'G028', ['IDG028', 'NMARMAZE'], req.body);
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista cidades ou clientes de um determinado Estado (UF)
     * @function api/buscar
     * @author Rafael Delfino Calzado
     * @since 08/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.buscar = async function (req, res, next) {

        var strSQL1 =
                    `SELECT
                        IDG003 AS "id", NMCIDADE AS "text"
                    FROM G003
                    WHERE
                        G003.SNDELETE = 0 AND
                        G003.STCADAST = 'A' AND
                        G003.IDG002 = ${req.body.IDG002} AND
                        UPPER(G003.NMCIDADE) LIKE UPPER('%${req.body.BUSCA}%')`;

        var strSQL2 =
                    `SELECT
                        G005.IDG005 AS "id", G005.NMCLIENT AS "text"
                    FROM G005

                    INNER JOIN G003
                        ON G003.IDG003 = G005.IDG003
                        AND G003.IDG002 = ${req.body.IDG002}

                    WHERE
                        G005.SNDELETE = 0 AND
                        G005.STCADAST = 'A' AND
                        ((UPPER(G005.NMCLIENT) LIKE UPPER('%${req.body.BUSCA}%')) OR
                         (G005.CJCLIENT LIKE '${req.body.BUSCA}%'))`;

        req.sql = (parseInt(req.body.TPBUSCA) == 1) ? strSQL1 : strSQL2;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.removerRTPV = async function (req, res, next) {

        req.sql =
                `DELETE FROM O010
                 WHERE IDO010 = ANY(
                    SELECT O010.IDO010
                    FROM O010
                    INNER JOIN O009
                        ON O009.IDO009 = O010.IDO009
                        AND O009.IDO008 = ${req.params.id})`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.searchUK = async function (req, res, next) {

        var sql =
                `SELECT
                    IDO008,
                    DSREGRA

                FROM O008

                WHERE
                    SNDELETE = 0 AND
                    IDG028 = ${req.IDG028} AND
                    IDG002 = ${req.IDG002} AND
                    SNCARPAR = '${req.SNCARPAR}' AND
                    TPTRANSP = '${req.TPTRANSP}'`;

        sql += ' AND IDG005 ';
        sql += (req.IDG005) ? `= ${req.IDG005}` : `IS NULL`;

        sql += ' AND IDG003 ';
        sql += (req.IDG003) ? `= ${req.IDG003}` : `IS NULL`;

        if (req.IDO008) sql += ` AND IDO008 <> ${req.IDO008}`;

        var parm = { sql };

        return await gdao.executar(parm, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    return api;
}
