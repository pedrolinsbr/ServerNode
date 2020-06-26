module.exports = function (app, cb) {

    const dbg     = app.src.modGlobal.controllers.dbGearController;
    const utilsDB = app.src.utils.FuncoesObjDB;

    var api = {};

    api.dbg = dbg;

    //-----------------------------------------------------------------------\\
    /**
     * Retorna um sequencial do campo G097.IDKEY
     * @function maxIdKey
     * @author Rafael Delfino Calzado
     * @since 21/11/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.maxIdKey = async function (req) { 
    
        try { 
    
            var sql = 'SELECT (NVL(MAX(IDKEY), 0)+1) IDKEY FROM G097';

            await dbg.controller.setConnection(req.objConn);

            var arRS = await dbg.execute({ sql, objConn: req.objConn });

            return arRS[0].IDKEY;

        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
     * Lista os Clientes com cadastro especial
     * @function listaCliEspecial
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaCliEspecial = async function (req) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utilsDB.retWherePagOrd(req.body, 'G005', true);

            var parm = { bindValues };

            parm.sql = 
                `SELECT 
                    G005.IDG005, 
                    G005.NMCLIENT, 
                    G005.RSCLIENT, 
                    G005.TPPESSOA, 
                    G005.CJCLIENT, 
                    G005.IECLIENT,
                    G003.IDG003,
                    UPPER(G003.NMCIDADE) NMCIDADE,
                    G002.IDG002,
                    G002.CDESTADO,
                    COUNT(*) OVER() COUNT_LINHA
                    
                FROM G005 -- CLIENTES
                
                INNER JOIN G003 -- CIDADES
                    ON G003.IDG003 = G005.IDG003
                    
                INNER JOIN G002 -- ESTADOS
                    ON G002.IDG002 = G003.IDG002
                
                ${sqlWhere}
                    AND G005.STCADAST = 'A'
                    AND G005.SNESPECI = 'S'
                    
                ${sqlOrder}
                ${sqlPaginate}`;


            parm.objConn = await dbg.controller.getConnection(null, req.UserId);

            var arRS = await dbg.execute(parm);

            return utilsDB.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }
    
    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências cadastradas
     * @function listaExige
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExige = async function (req) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utilsDB.retWherePagOrd(req.body, 'G097', true);

            var parm = { bindValues };

            parm.sql = 
                `SELECT 
                    G097.IDG097,
                    G097.IDGRUPO,
                    -- G097.IDKEY,
                    G097.DSVALUE,
                    G097.SNDELETE,
                    COUNT(*) OVER() COUNT_LINHA

                FROM G097

                    ${sqlWhere}

                    AND G097.IDGRUPO = 5 -- EXIGENCIAS

                    ${sqlOrder}
                    ${sqlPaginate}`;

            parm.objConn = await dbg.controller.getConnection(null, req.UserId);

            var arRS = await dbg.execute(parm);

            return utilsDB.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências disponíveis
     * @function listaExigeDisp
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExigeDisp = async function (req) {

        try {

            var parm = {};

            parm.sql = 
                `SELECT 
                    G097.IDG097,
                    G097.DSVALUE
                FROM G097 
                WHERE 
                    G097.SNDELETE = 0
                    AND G097.IDGRUPO = 5 -- EXIGENCIAS
                    AND G097.IDG097 NOT IN (SELECT G102.IDG097 FROM G102 WHERE G102.IDG005 = ${req.params.id})
                ORDER BY G097.DSVALUE`;

            parm.objConn = await dbg.controller.getConnection(null, req.UserId);

            return await dbg.execute(parm);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências atribuídas
     * @function listaExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExigeCliente = async function (req) {

        try {

            var parm = {};

            parm.sql = 
                `SELECT 
                    G097.IDG097,
                    G097.DSVALUE,
                    G102.IDG005
                FROM G097 
                INNER JOIN G102 -- CLIENTES x EXIGENCIAS
                    ON G102.IDG097 = G097.IDG097
                WHERE
                    G097.SNDELETE = 0 AND
                    G102.IDG005 = ${req.params.id}
                ORDER BY G097.DSVALUE`;

            parm.objConn = await dbg.controller.getConnection(null, req.UserId);

            return await dbg.execute(parm);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Remove todas exigências do cliente indicado
     * @function removeExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\    

    api.removeExigeCliente = async function (req) { 
    
        try { 
    
            var parm = { objConn: req.objConn };

            parm.sql = `DELETE FROM G102 WHERE IDG005 = ${req.post.IDG005}`;

            await dbg.controller.setConnection(parm.objConn);

            return await dbg.execute(parm);
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
     * Insere as exigências informadas para o cliente indicado
     * @function InsereExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\    

    api.insereExigeCliente = async function (req) { 
    
        try { 
    
            var parm = { objConn: req.objConn };

            parm.sql = `INSERT ALL \n`;

            for (v of req.post.IDG097)
                parm.sql += `INTO G102 (IDG005, IDG097) VALUES (${req.post.IDG005}, ${v}) \n`;

            parm.sql += `SELECT * FROM DUAL`;

            await dbg.controller.setConnection(parm.objConn);

            return await dbg.execute(parm);
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\   

    return api;

}