module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const utils  = app.src.utils.FuncoesObjDB;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    const acl   = app.src.modIntegrador.controllers.FiltrosController;

    var api = {};
    //-----------------------------------------------------------------------\\
    
    api.listarRelatorioCanceladas = async function (req, res, next) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

            var parm = { nmTabela: 'G043' };

            var sqlAux = `SELECT
                            G046.IDG046,
                            G046.STCARGA,
                            G046.DTCARGA,
                            G046.DTCANCEL
                                FROM G043 G043A
                                LEFT JOIN G049 ON G049.IDG043 = G043A.IDG043
                                LEFT JOIN G048 ON G048.IDG048 = G049.IDG048
                                LEFT JOIN G046 ON G046.IDG046 = G048.IDG046
                                    WHERE G043A.IDG043 = G043.IDG043
                                    AND G046.TPMODCAR <> 1`

            var sqlAuxCancel = `SELECT 
                                    G046.IDG046,
                                    G046.STCARGA,
                                    G046.DTCARGA,
                                    G046.DTCANCEL
                                        FROM G043 G043A
                                        LEFT JOIN G049 ON G049.IDG043 = G043A.IDG043
                                        LEFT JOIN G048 ON G048.IDG048 = G049.IDG048
                                        LEFT JOIN G046 ON G046.IDG046 = G048.IDG046
                                            WHERE G043A.IDG043 = G043.IDG043
                                            AND G046.STCARGA = 'C'
                                            AND G046.TPMODCAR <> 1`

            parm.sql = 
                `SELECT
                    G043.IDG043,
                    G043.CDDELIVE,
                    G043.STDELIVE,	
                    G043.VRDELIVE,
                    G043.TPDELIVE,
                    CASE
						WHEN G043.STETAPA IN (0,20) THEN 'BACKLOG'
						WHEN G043.STETAPA IN (1,21) THEN 'OTIMIZANDO'
						WHEN G043.STETAPA IN (2,22) THEN 'OFERECIMENTO'
						WHEN G043.STETAPA IN (3,23) THEN 'AGENDAMENTO'
						WHEN G043.STETAPA IN (4,24) THEN 'TRANSPORTE'
						WHEN G043.STETAPA IN (5,25) THEN 'ENCERRADO'
						WHEN G043.STETAPA = 6 THEN 'OCORRÊNCIA'
						WHEN G043.STETAPA = 7 THEN 'A CANCELAR'
						WHEN G043.STETAPA = 8 THEN 'CANCELADA'
					END 											STETAPA,
                    TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') AS DTDELIVE,
                    TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') AS DTLANCTO,
                    
                    (SELECT MAX(IDG046)
                        FROM (${sqlAux})
                    ) AS IDG046_ATIVO,
                    
                    (SELECT MAX(TO_CHAR(DTCARGA, 'DD/MM/YYYY'))
                        FROM (${sqlAux})
                    ) AS DTCARGA_ATIVO,
                    
                    (SELECT G046.STCARGA
                        FROM G046
                        WHERE G046.IDG046 = 
                            (SELECT MAX(IDG046)
                                FROM (${sqlAux}))
                    ) AS STCARGA_ATIVO,
                    
                    (SELECT MAX(IDG046)
                        FROM (${sqlAuxCancel})  
                    ) AS IDG046_CANCELADO,
                    
                    (SELECT MAX(TO_CHAR(DTCANCEL, 'DD/MM/YYYY'))
                        FROM (${sqlAuxCancel})
                    ) AS DTCANCEL_CANCELADO,
                    
                    (SELECT G046.STCARGA
                        FROM G046
                        WHERE G046.IDG046 = 
                            (SELECT MAX(IDG046)
                                FROM (${sqlAuxCancel}))
                        ) AS STCARGA_CANCELADO,

                    (SELECT NVL(T013.DSMOTIVO, G046.OBCANCEL)
                        FROM G046
                        LEFT JOIN T013
                            ON T013.IDT013 = G046.IDT013
                        WHERE G046.IDG046 = 
                            (SELECT MAX(IDG046)
                                FROM (${sqlAuxCancel}))
                        ) AS MOTIVO_CANCELADO,

                        COUNT(G043.IDG043) OVER () AS COUNT_LINHA
                        
                        FROM G043
                            INNER JOIN G049 ON G049.IDG043 = G043.IDG043
                            INNER JOIN G048 ON G048.IDG048 = G049.IDG048 AND G048.IDG046 IS NOT NULL
                            INNER JOIN G046 ON G046.IDG046 = G048.IDG046
                           
                            ${sqlWhere}
                            AND G043.CDDELIVE IS NOT NULL
                            AND G046.DTCANCEL IS NOT NULL
                            AND G046.TPMODCAR <> 1

                        GROUP BY 
                            G043.IDG043,
                            G043.CDDELIVE,
                            G043.STETAPA,
                            G043.STDELIVE,
                            G043.DTDELIVE,
                            G043.DTLANCTO,
                            G043.VRDELIVE,
                            G043.TPDELIVE

                        ORDER BY G043.IDG043 DESC
                        ${sqlPaginate}`;

                parm.bindValues = bindValues;

            var objRet = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(objRet);    

        } catch (err) {

            throw err;

        }
    }

        //-----------------------------------------------------------------------\\

    return api;

}