module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};
    
    //-----------------------------------------------------------------------\\

    api.cancelarCargaDev = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        parm.sql = 
            `UPDATE G046 SET 
                STCARGA = 'C',
                DTCANCEL = TO_DATE('${req.DTCANCEL}', 'YYYY-MM-DD HH24:MI:SS'),
                OBCANCEL = '${req.OBCANCEL}',
                IDS001CA = ${req.IDS001}
            WHERE   
                IDG046 = ${req.IDG046}`;

        await gdao.controller.setConnection(parm.objConn);

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.cancelarDeliveryDev = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        var strBusca = 
            `SELECT
                G043.IDG043    
            FROM G043 -- DELIVERY

            INNER JOIN G049 -- DELIVERY x ETAPA
                ON G049.IDG043 = G043.IDG043
                
            INNER JOIN G048 -- ETAPA
                ON G048.IDG048 = G049.IDG048
                
            WHERE G048.IDG046 = ${req.IDG046}`;

        parm.sql = 
            `UPDATE G043 
                SET STETAPA = 7, 
                CDG46ETA = NULL,
                DTCANCEL = TO_DATE('${req.DTCANCEL}', 'YYYY-MM-DD HH24:MI:SS'),
                OBCANCEL = '${req.OBCANCEL}',
                IDS001CA = ${req.IDS001}
            WHERE IDG043 IN (${strBusca})`;
                    

        await gdao.controller.setConnection(parm.objConn);

        return await gdao.executar(parm, res, next).catch((err) => { throw err });
            
    }

    //-----------------------------------------------------------------------\\

    api.setASNDeleteFlag = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        parm.sql =
            `UPDATE (
                SELECT 
                    IDG048,
                    STINTCLI,
                    CASE
                        WHEN (STINTCLI = 2) THEN 4 
                        ELSE 3
                    END STDELETE
                    
                FROM G048 -- ETAPAS 

                WHERE
                  STINTCLI IN (0, 1, 2) 
                  AND IDG046 = ${req.IDG046} 
              ) L SET L.STINTCLI = L.STDELETE`;

        await gdao.controller.setConnection(parm.objConn);

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.insereEventoCancela = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        parm.sql =
            `INSERT INTO I008 (IDG043, IDI001, DTEVENTO)
    
            SELECT 
                G049.IDG043, 
                29 IDI001, 
                TO_DATE('${req.DTCANCEL}', 'YYYY-MM-DD HH24:MI:SS') DTEVENTO
    
            FROM G049 
    
            INNER JOIN G043 ON 
                G043.IDG043 = G049.IDG043
                AND G043.SNDELETE = 0
    
            INNER JOIN G048 ON 
                G048.IDG048 = G049.IDG048
    
            WHERE G048.IDG046 = ${req.IDG046}`;

        await gdao.controller.setConnection(parm.objConn);

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.cancelarCargaRecusa = async function (req, res, next) {

        try {

            await gdao.controller.setConnection(req.objConn);

            return await gdao.alterar(req, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscaDlvRecusa = async function (req, res, next) {

        try {

            var sql = 
                `SELECT G043.IDG043,
                        G043.IDG043RF
                    FROM G043 -- DELIVERY
                INNER JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG043 = G043.IDG043
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG048 = G049.IDG048                
                WHERE 
                    G043.SNDELETE = 0
                    AND G043.TPDELIVE = '4'
                    AND G048.IDG046 = ${req.IDG046}`;

            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.cancelarDeliveryRecusa = async function (req, res, next) {

        try {

            var sql =   
                `UPDATE G043 SET 
                    STETAPA = 8,
                    IDS001CA = ${req.IDS001CA},
                    DTCANCEL = TO_DATE('${req.DTCANCEL}', 'YYYY-MM-DD HH24:MI:SS'), 
                    OBCANCEL = '${req.OBCANCEL}' 
                WHERE IDG043 = ${req.IDG043}`;

            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.buscaCteAtivo = async function (req, res, next) {

        try {

            var sql = 
                `SELECT 
                    G043.IDG043,
                    G043.IDG043RF
                FROM G043

                INNER JOIN G052 -- DELIVERY x CTE
                    ON G052.IDG043 = G043.IDG043

                INNER JOIN G051 -- CTE
                    ON G051.IDG051 = G052.IDG051
                    AND G051.SNDELETE = 0

                INNER JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG043 = G052.IDG043
                    AND G043.SNDELETE = 0

                INNER JOIN G048 -- ETAPA
                    ON G048.IDG048 = G049.IDG048

                WHERE 
                    G051.STCTRC = 'A'
                    AND G048.IDG046 = ${req.IDG046}`;

            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    return api;

}
