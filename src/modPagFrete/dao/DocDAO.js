module.exports = function (app, cb) {

    const db  = app.src.modGlobal.controllers.dbGearController;
    const tmz = app.src.utils.DataAtual;
    const utilsDB = app.src.utils.FuncoesObjDB;
    
    var api = {};

    api.db  = db;
    api.tmz = tmz;

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista ocorrências na importação do documento XML
    * @function listaOcorrencia
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\

    api.listaOcorrencia = async function (req) { 
    
        try { 
    
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utilsDB.retWherePagOrd(req.body, 'I016', true);

            var sql = 
                `SELECT
                    I016.IDI016,
                    I016.NRCHADOC,
                    I016.NMCAMPO,
                    I016.OBOCORRE,                    
                    TO_CHAR(I016.DTCADAST, 'DD/MM/YYYY HH24:MI:SS') DTCADAST,
                    I009.IDI009,
                    I009.DSOCORRE,
                    COUNT(*) OVER() COUNT_LINHA
    
                FROM I016 -- OCORRENCIAS CTe
    
                INNER JOIN I009 -- TIPO DE OCORRENCIA
                    ON I009.IDI009 = I016.IDI009
    
                ${sqlWhere}
                ${sqlOrder}
                ${sqlPaginate}
                `;

            var objConn = await db.controller.getConnection(null, req.UserId);

            var arRS = await db.execute({ sql, bindValues, objConn });

            return utilsDB.construirObjetoRetornoBD(arRS);
        
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
	//-----------------------------------------------------------------------\\
    /**
    * @description Remove todas as ocorrências do documento informado
    * @function removeOcorrencias
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Object} Objeto com o resultado da operação
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\

    api.removeOcorrencias = async function (nrChave, objConn) {

        try {

            var sql = `UPDATE I016 SET SNDELETE = 1 WHERE NRCHADOC = '${nrChave}'`;

            await db.controller.setConnection(objConn);

            return await db.execute({ sql, objConn });

        } catch (err) {

            throw err;

        }

    }

	//-----------------------------------------------------------------------\\
    /**
    * @description Insere todas as ocorrências listadas em um documento
    * @function insereOcorrencias
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Object} Objeto como resultado da operação
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\

    api.insereOcorrencias = async function (objDoc, objConn) { 
    
        try { 

            var dtCad = null;
            var sql   = `INSERT ALL `;

            for (v of objDoc.arOccurrence) {

                dtCad = tmz.formataData(v.DTCADAST, 'YYYY-MM-DD HH:mm:ss');

                sql += `INTO I016 (NRCHADOC, IDI009, DTCADAST, NMCAMPO, OBOCORRE) VALUES `;
                sql += `('${objDoc.NRCHADOC}', ${v.IDI009}, TO_DATE('${dtCad}', 'YYYY-MM-DD HH24:MI:SS'), '${v.NMCAMPO}', '${v.OBOCORRE}') \n`;

            }

            sql += `SELECT * FROM DUAL`;

            await db.controller.setConnection(objConn);

            return await db.execute({ sql, objConn });            
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 

	//-----------------------------------------------------------------------\\
    /**
    * @description Remove relação entre o CT-e importado e o CT-e de referência
    * @function removeRelCTe
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Object} Objeto como resultado da operação
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\ 
    
    api.removeRelCTe = async function (parm) {

        try {

            var sql = `DELETE FROM G064 WHERE IDG051AT = ${parm.IDG051AT}`;

            await db.controller.setConnection(parm.objConn);
            
            return await db.execute({ sql, objConn: parm.objConn });

        } catch (err) {

            throw err;

        }

    }

	//-----------------------------------------------------------------------\\
    /**
    * @description Busca todos os componentes de preço cadastrados por 3PL
    * @function buscaComponente
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Array}  Array com o resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\ 
    
    api.buscaComponente = async function (objConn) {

        try {

            var sql =
                `SELECT
                    G063.IDG063,
                    G063.IDG024,
                    G063.NMCOMVAR,
                    G062.IDG062,
                    G062.NMCOMPAD

                FROM G063 -- COMPONENTES x 3PL

                INNER JOIN G062 -- COMPONENTES PADRÃO DA PRESTAÇÃO DE SERVIÇO
                    ON G062.IDG062 = G063.IDG062

                WHERE
                    G063.SNDELETE = 0 
                    AND G062.SNDELETE = 0

                ORDER BY
                    G063.IDG024,
                    G062.IDG062`;

            await db.controller.setConnection(objConn);
            
            return await db.execute({ sql, objConn });

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Procura importação prévia do CT-e e de seu documento de referência
    * @function buscaCTe
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Array}  Array com o resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\   
    
    api.buscaCTe = async function (parm, objConn) {

        try {

            var sql = 
                `SELECT 
                    IDG051, 
                    NRCHADOC 

                FROM G051
                
                WHERE 
                    SNDELETE = 0
                    AND NRCHADOC IN (${parm.join()})`;

            await db.controller.setConnection(objConn);

            return await db.execute({ sql, objConn });

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Busca dados do emitente do CT-e
    * @function buscaEmitente
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Array}  Array com o resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\ 

    api.buscaEmitente = async function (objDoc, objConn) {

        try {

            var sql = 
                `SELECT
                    G024.IDG024,
                    G024.NMTRANSP,
                    NVL(G023.SNTRAINT, 0) SNTRAINT

                FROM G024

                LEFT JOIN G023
                    ON G023.IDG023 = G024.IDG023
                    AND G023.SNDELETE = 0

                WHERE 
                    G024.SNDELETE = 0
                    AND G024.STCADAST = 'A'
                    AND CJTRANSP = '${objDoc.CJEMITEN}'  
                    AND LPAD(G024.IETRANSP, 15, '0') = LPAD('${objDoc.IEEMITEN}', 15, '0')  
                    AND G024.CPENDERE = '${objDoc.CPEMITEN}'
                `;

            await db.controller.setConnection(objConn);

            return await db.execute({ sql, objConn });

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Busca dados para Remetentes, Destinatários, Tomadores, etc.
    * @function buscaPessoa
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
    * @async
    * @returns {Array}  Array com o resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\ 

    api.buscaPessoa = async function (objPesq, objConn) {

        try {

            var arCols = 
                [
                    'IDLOGOS',
                    'CDCLISAP',
                    'CJCLIENT',
                    'CPENDERE'
                ];

        
            var sqlAux = (objPesq.IECLIENT) ? `AND LPAD(IECLIENT, 15, '0') = LPAD('${objPesq.IECLIENT}', 15, '0') ` : ``;

            var sql = 
                `SELECT 
                    ${arCols.join()},
                    MAX(IDG005) IDG005
                FROM G005
                WHERE 
                    SNDELETE = 0
                    AND STCADAST = 'A'
                    AND CJCLIENT = '${objPesq.CJCLIENT}'
                    AND CPENDERE = '${objPesq.CPENDERE}'
                    ${sqlAux}

                GROUP BY ${arCols.join()}`;

            await db.controller.setConnection(objConn);

            return await db.execute({ sql, objConn });
            
        } catch (err) {

            throw err;

        }
        
    } 

    //-----------------------------------------------------------------------\\  

    return api;

}