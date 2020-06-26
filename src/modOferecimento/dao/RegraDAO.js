module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;	

    var api = {};
    api.controller = app.config.ControllerBD;
    api.alterar    = gdao.alterar;
    api.inserir    = gdao.inserir;
    api.remover    = gdao.remover;

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista frota de um participante em uma regra apontado cadastro
        *
        * @async 
        * @function listaFrota
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Array}   Retorna um array com o resultado da pesquisa
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.listaFrota = async function (req, res, next) {

        try {

            var sql = 
                `SELECT 
                    G030.IDG030,
                    G030.DSTIPVEI,
                    G030.QTCAPPES,
                    O010.IDO010
                FROM G030 
                
                LEFT JOIN O010
                    ON O010.IDG030 = G030.IDG030
                    AND O010.IDO009 = ${req.params.id}
                
                WHERE 
                    G030.SNDELETE = 0
                    AND G030.STCADAST = 'A'
                
                ORDER BY 
                    G030.QTCAPPES`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere participantes em massa na regra
        *
        * @async 
        * @function inserePart			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.inserePart = async function (req, res, next) {

        try {

            var strValor = '';

            var arCampos = ['IDO008', 'IDS001', 'IDG024', 'PCATENDE', 'DTCADAST'];

            var arValores = [];

            var sql = `INSERT INTO O009 (${arCampos.join()}) \n`;

            sql += 'WITH input_values AS ( \n';


            for (var v of req.post.ARPARTIC) {

                if (v.IDO009 === undefined) {
                    strValor = 'SELECT ';
                    strValor += `${req.post[arCampos[0]]} ${arCampos[0]}, `;
                    strValor += `${req.post[arCampos[1]]} ${arCampos[1]}, `;
                    strValor += `${v[arCampos[2]]} ${arCampos[2]}, `;
                    strValor += `'${v[arCampos[3]]}' ${arCampos[3]}, `;
                    strValor += `CURRENT_DATE ${arCampos[4]} `;
                    strValor += `FROM DUAL`;
    
                    arValores.push(strValor);
                }

            } 

            sql += arValores.join(' UNION ALL \n');

            sql += `) SELECT * FROM input_values`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Remove participante SAVE de uma regra
        *
        * @async 
        * @function removePart			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 04/04/2019
    */
    //-----------------------------------------------------------------------\\   

    api.removePart = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn, UserID: req.post.IDS001 };

            parm.sql = `DELETE FROM O009 WHERE PCATENDE = 0 AND IDO009 = ${req.post.IDO009}`;
        
            await gdao.controller.setConnection(parm.objConn);

            await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Remove toda frota de uma regra
        *
        * @async 
        * @function removeFrotaRegra			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2019
    */
    //-----------------------------------------------------------------------\\   

    api.removeFrotaRegra = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn, UserID: req.post.IDS001 };

            parm.sql = `DELETE FROM O010 WHERE IDO009 = ${req.post.IDO009}`;
        
            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\   
    /**
        * @description Insere frota permitida de um participante em uma regra
        *
        * @async 
        * @function insereFrota			
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2019
    */
    //-----------------------------------------------------------------------\\   

    api.insereFrota = async function (req, res, next) {

        try {

            var strValor = '';

            var arCampos = ['IDO009', 'IDS001', 'IDG030', 'DTCADAST'];

            var arValores = [];

            var sql = `INSERT INTO O010 (${arCampos.join()}) \n`;

            sql += 'WITH input_values AS ( \n';

            for (var v of req.post.IDG030) {

                strValor = 'SELECT ';
                strValor += `${req.post[arCampos[0]]} ${arCampos[0]}, `;
                strValor += `${req.post[arCampos[1]]} ${arCampos[1]}, `;
                strValor += `${v} ${arCampos[2]}, `;
                strValor += `CURRENT_DATE ${arCampos[3]} `;
                strValor += `FROM DUAL`;

                arValores.push(strValor);

            } 

            sql += arValores.join(' UNION ALL \n');

            sql += `) SELECT * FROM input_values`;

            var parm = { objConn: req.objConn, UserID: req.post.IDS001, sql };

            await gdao.controller.setConnection(parm.objConn);

            await gdao.executar(parm, res, next);

            return { blOK: true };

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da cidade pesquisada
        *
        * @async 
        * @function buscaCidadeRegra
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.buscaCidadeRegra = async function (req, res, next) {

        var sql =
            `SELECT
                IDG003 AS "id", NMCIDADE AS "text"
            FROM G003
            WHERE
                G003.SNDELETE = 0 AND
                G003.STCADAST = 'A' AND
                G003.IDG002 = ${req.IDG002} AND
                UPPER(G003.NMCIDADE) LIKE UPPER('%${req.BUSCA}%')`;
    
        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados do cliente pesquisado
        *
        * @async 
        * @function buscaClienteRegra
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.buscaClienteRegra = async function (req, res, next) {
        
        var sql =
            `SELECT
                G005.IDG005 AS "id", G005.NMCLIENT AS "text"
            FROM G005

            INNER JOIN G003
                ON G003.IDG003 = G005.IDG003
                AND G003.IDG002 = ${req.IDG002}

            WHERE
                G005.SNDELETE = 0 AND
                G005.STCADAST = 'A' AND
                ((UPPER(G005.NMCLIENT) LIKE UPPER('%${req.BUSCA}%')) OR
                (G005.CJCLIENT LIKE '${req.BUSCA}%'))`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca regra semelhante previamente cadastrada
        *
        * @async 
        * @function buscaRegraPrevia
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\     

    api.buscaRegraPrevia = async function (req, res, next) {
        
        try {

            var sql = 
                `SELECT IDO008, DSREGRA 
                FROM O008 
                WHERE 
                    SNDELETE = 0 
                    AND IDG014 = ${req.IDG014}
                    AND IDG028 = ${req.IDG028}
                    AND IDG002 = ${req.IDG002}
                    AND SNCARPAR = '${req.SNCARPAR}'
                    AND TPTRANSP = '${req.TPTRANSP}'`;

            sql += ` AND IDG003 `;
            sql += (req.IDG003)  ? `= ${req.IDG003}` : `IS NULL`;

            sql += ` AND IDG005 `;
            sql += (req.IDG005) ? `= ${req.IDG005}` : `IS NULL`;
    
            if (req.IDO008) sql += ` AND IDO008 <> ${req.IDO008}`;

            var parm = { objConn: req.objConn, sql };
       
            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista regras de acordo com filtro da grid
        *
        * @async 
        * @function listaRegra			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.listaRegra = async function (req, res, next) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'O008', true);

            var sql = 
                `SELECT 
                    O008.IDO008,
                    O008.IDG028,
                    O008.IDG002,
                    O008.IDG003,
                    O008.IDG005,
                    O008.IDS001,
                    O008.DSREGRA,
                    O008.SNCARPAR,
                    O008.TPTRANSP,
                    
                    G014.IDG014,
                    G014.DSOPERAC,

                    G028.NMARMAZE,

                    G002.NMESTADO,	
                    G002.CDESTADO,

                    G003.NMCIDADE,
                    G005.NMCLIENT,
                    
                    CASE 
                        WHEN O008.SNCARPAR = 'S' THEN 'LTL'
                        WHEN O008.SNCARPAR = 'N' THEN 'FTL'
                        ELSE 'ITL'
                    END TPOCUPAC,

                    CASE 
                        WHEN O008.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                        WHEN O008.TPTRANSP = 'V' THEN 'VENDA'
                        WHEN O008.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                        WHEN O008.TPTRANSP = 'G' THEN 'RETORNO AG'
                        ELSE 'OUTRO'
                    END TPOPERAC,
                        
                    TO_CHAR(O008.DTCADAST, 'DD/MM/YYYY HH24:MI') DTCADAST,

                    COUNT(*) OVER() COUNT_LINHA 
                    
                FROM O008 -- REGRAS

                INNER JOIN G014 -- CLIENTE 4PL
                    ON G014.IDG014 = O008.IDG014

                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = O008.IDG028 
                    
                INNER JOIN G002 -- UF DESTINO
                    ON G002.IDG002 = O008.IDG002
                    
                LEFT JOIN G003 -- CIDADE DE DESTINO 
                    ON G003.IDG003 = O008.IDG003
                    
                LEFT JOIN G005 -- CLIENTE DE DESTINO
                    ON G005.IDG005 = O008.IDG005
              
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;
                                
            var arRS = await gdao.executar({sql, bindValues}, res, next);

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da transportadoras não contidas na Regra
        *
        * @async 
        * @function lista3PL
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\
    
    api.lista3PL = async function (req, res, next) {

        try {

            var sql =
                `SELECT
                    G024.IDG024,
                    G024.NMTRANSP,
                    G024.CJTRANSP,
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
                    (SELECT IDG024 FROM O009 WHERE IDO008 = ${req.params.id})
                    
                ORDER BY G024.NMTRANSP`;


            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Busca dados da transportadoras contidas na Regra
        *
        * @async 
        * @function lista3PLRegra
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\          

    api.lista3PLRegra = async function (req, res, next) {

        try {

            var sql =
                `SELECT
                    G024.IDG024,
                    G024.NMTRANSP,
                    G024.CJTRANSP,
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

                WHERE 
                    O009.IDO008 = ${req.params.id}
                
                ORDER BY 
                    O009.PCATENDE DESC,
                    G024.NMTRANSP`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;
}
