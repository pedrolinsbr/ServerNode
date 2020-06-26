module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const db = app.src.modGlobal.controllers.dbGearController;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista as ordens de pagamento a serem aprovadas
    * @function listOrders
    * @author Rafael Delfino Calzado
    * @since 24/12/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\  

    api.listOrders = async function (req, res, next) { 
    
        try { 

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);            
    
            var sql = 
                `SELECT 
                    Q1.IDG046,
                    Q1.IDG024,
                    Q1.NMTRANSP,
                    Q1.VRFREREC,
                    Q1.VRFREPAG,
                    SUM(Q2.VRFRE4PL) VRFRE4PL,
                    SUM(Q2.VRFRE3PL) VRFRE3PL,
                    LISTAGG(Q2.CDCTE4PL, ' / ') WITHIN GROUP(ORDER BY Q2.CDCTE4PL) CDCTE4PL,
                    LISTAGG(Q2.CDCTE3PL, ' / ') WITHIN GROUP(ORDER BY Q2.CDCTE3PL) CDCTE3PL,	
                    COUNT(*) OVER() COUNT_LINHA
                
                FROM
                (
            
                    SELECT
                        G046.IDG046,
                        G046.VRFREREC,
                        G024.IDG024,
                        G024.NMTRANSP,
                        O005.VRFREPAG
                
                    FROM G046 --CARGA
            
                    INNER JOIN G024 -- TRANSPORTADORA
                        ON G024.IDG024 = G046.IDG024
                    
                    INNER JOIN O005 -- HISTORICO DE OFERECIMENTO
                        ON O005.IDG046 = G046.IDG046
                        AND O005.IDG024 = G046.IDG024
                    
                    INNER JOIN G048 -- ETAPA
                        ON G048.IDG046 = G046.IDG046
                    
                    INNER JOIN G049 -- DELIVERIES X ETAPA
                        ON G049.IDG048 = G048.IDG048
                        
                    LEFT JOIN G052 -- CTE x NF
                        ON G052.IDG051 = G049.IDG051
                    
                    LEFT JOIN G083 -- NF
                        ON G083.IDG083 = G052.IDG083
                        
                    LEFT JOIN G051	-- CTE4PL
                        ON G051.IDG051 = G052.IDG051
                        
                    LEFT JOIN G064 -- CTE4PL x CTE3PL
                        ON G064.IDG051AN = G051.IDG051
                
                    ${sqlWhere}
                        AND G046.STCARGA = 'D'
                        AND G046.VRFREREC IS NOT NULL
                
                        AND (
                                (G051.IDG051 IS NULL) OR 
                                ( 
                                    (G051.SNDELETE = 0) AND 
                                    (G051.STCTRC = 'A') 
                                ) 
                            )
                    
                        AND ( 
                                (G083.IDG083 IS NULL) OR 
                                (G083.SNDELETE = 0) 
                            )	
                
                    GROUP BY
                        G046.IDG046,
                        G046.VRFREREC,
                        G024.IDG024,
                        G024.NMTRANSP,
                        O005.VRFREPAG
                
                    HAVING
                        SUM(CASE WHEN G051.IDG051 IS NULL THEN 1 ELSE 0 END) = 0
                        AND SUM(CASE WHEN G083.IDG083 IS NULL THEN 1 ELSE 0 END) = 0
                        AND SUM(CASE WHEN G064.IDG051AT IS NULL THEN 1 ELSE 0 END) = 0
                
                ) Q1
                
                INNER JOIN 
                (
                    SELECT
                        G048.IDG046,
                        CTE4PL.IDG051 IDCTE4PL,
                        CTE4PL.CDCTRC CDCTE4PL,
                        CTE4PL.VRTOTFRE VRFRE4PL,
                        SUM(CTE3PL.VRTOTFRE) VRFRE3PL,
                        LISTAGG(CTE3PL.CDCTRC, ' / ') WITHIN GROUP(ORDER BY CTE3PL.CDCTRC) CDCTE3PL

                    FROM G048

                    INNER JOIN 
                    (

                        SELECT IDG048, IDG051 
                        FROM G049
                        GROUP BY IDG048, IDG051

                    ) SQ1
                        ON SQ1.IDG048 = G048.IDG048
                
                    INNER JOIN G051 CTE4PL
                        ON CTE4PL.IDG051 = SQ1.IDG051
            
                    INNER JOIN G064 
                        ON G064.IDG051AN = CTE4PL.IDG051

                    INNER JOIN G051 CTE3PL
                        ON CTE3PL.IDG051 = G064.IDG051AT

                    WHERE
                        CTE4PL.SNDELETE = 0
                        AND CTE3PL.SNDELETE = 0
                        AND CTE4PL.STCTRC = 'A'
                        AND CTE3PL.STCTRC = 'A'

                    GROUP BY 
                        G048.IDG046,
                        CTE4PL.IDG051,
                        CTE4PL.CDCTRC,
                        CTE4PL.VRTOTFRE
                ) Q2 
                    ON Q2.IDG046 = Q1.IDG046
                
                GROUP BY 
                    Q1.IDG046,
                    Q1.IDG024,
                    Q1.NMTRANSP,
                    Q1.VRFREREC,
                    Q1.VRFREPAG
                    
                ${sqlPaginate}`;

            var objConn = await db.controller.getConnection(null, req.UserId);

            var arRS = await db.execute({ objConn, sql, bindValues });
    
            return utils.construirObjetoRetornoBD(arRS);                            
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    return api;

}