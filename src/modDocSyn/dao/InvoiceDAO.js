module.exports = function (app, cb) {

    var api  = {};
    var gdao = app.src.modGlobal.dao.GenericDAO;

    //-----------------------------------------------------------------------\\        

    api.changeInvoiceStatus = async function (req, res, next) {

        req.sql = `UPDATE G048 SET STINTINV = ${req.STINTINV} WHERE IDG048 = ${req.IDG048}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });  
        
    }

    //-----------------------------------------------------------------------\\

    api.getInvoiceData = async function (req, res, next) {

        req.sql = 
            `SELECT
                Q.IDG046    IDCARGA,
                Q.IDG048    IDETAPA,
                Q.NRSEQETA  NRETAPA,
                Q.STINTINV,
                
                SUM(Q.QTDELIVE) QTDELIVE,
                ROUND(SUM(Q.VROPERAC), 2) VRFEE,
                ROUND(SUM(Q.VRTOTFRE) - SUM(Q.VRISSQST) - SUM(Q.VROPERAC), 2) VRFREIGH
                
            FROM 
            (
                SELECT    
                    G046.IDG046,
                    G048.IDG048,
                    G048.NRSEQETA,
                    G048.STINTINV,
                    G051.IDG051,
                    G051.VROPERAC,
                    G051.VRTOTFRE,
                    NVL(G051.VRISSQST, 0) VRISSQST,
                    COUNT(G049.IDG043) QTDELIVE
        
                FROM G046 -- CARGA
                
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG046 = G046.IDG046
                    AND G046.SNDELETE = 0
            
                INNER JOIN G049 -- DELIVERY x ETAPA 
                    ON G049.IDG048 = G048.IDG048
                                                
                INNER JOIN G043 -- DELIVERY
                    ON G043.IDG043 = G049.IDG043
                    AND G043.SNDELETE = 0

                INNER JOIN G014 -- OPERACAO
                    ON G014.IDG014 = G043.IDG014

                INNER JOIN G052 -- CTE x DELIVERY
                    ON G052.IDG043 = G043.IDG043

                INNER JOIN G051 -- CTE
                    ON G051.IDG051 = G052.IDG051
                    AND G051.SNDELETE = 0
            
                WHERE 
                    G046.STCARGA <> 'C'
                    AND G046.TPMODCAR <> 1 
                    AND G048.STINTCLI = 2                
                    AND ((G048.STINTINV = 0 AND G051.STCTRC = 'A') OR
                         (G048.STINTINV = 2 AND G051.STCTRC = 'C'))
                    AND G043.TPDELIVE <> '5' -- AG
                    AND G043.STDELIVE <> 'D' -- CANCELADA
                    AND G014.IDG097DO = 145 -- CHKRDC
                                
                GROUP BY
                    G046.IDG046,
                    G048.IDG048,
                    G048.NRSEQETA,
                    G048.STINTINV,
                    G051.IDG051,
                    G051.VROPERAC,
                    G051.VRTOTFRE,
                    G051.VRISSQST
            ) Q
                        
            GROUP BY 
                Q.IDG046,
                Q.IDG048,
                Q.NRSEQETA,
                Q.STINTINV
            
            HAVING SUM(QTDELIVE) = 
            (
                SELECT COUNT(G043.IDG043) QTDELIVE
                FROM G043
                INNER JOIN G049 
                    ON G049.IDG043 = G043.IDG043
                    AND G043.SNDELETE = 0
                WHERE
                    G049.IDG048 = Q.IDG048
                    AND G043.STDELIVE <> 'D'
            )`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    return api;


}