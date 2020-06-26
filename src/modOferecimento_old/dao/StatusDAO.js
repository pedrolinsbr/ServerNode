module.exports = function (app, cb) {

    const tmz  = app.src.utils.DataAtual;
    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Altera o status das cargas selecionadas
     * @function api/trocaStatusCarga
     * @author Rafael Delfino Calzado
     * @since 16/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.trocaStatusCarga = async function (req, res, next) {

        try {

            var sqlAux = (req.post.STCARGA == 'B') ? 'IDG024 = NULL,' : '';

            var parm = { objConn: req.objConn };

            parm.sql = 
                `UPDATE G046 SET ${sqlAux} STCARGA = '${req.post.STCARGA}' 
                 WHERE IDG046 IN (${req.post.IDG046.join()})`;

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Altera o status dos oferecimentos selecionados
     * @function api/trocaStatusOferec
     * @author Rafael Delfino Calzado
     * @since 16/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.trocaStatusOferec = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql =  `UPDATE O005 SET STOFEREC = '${req.post.STCARGA}'`;

            switch (req.post.STCARGA) {

                case 'A': //Aceita
                case 'X': //Recusada
                case 'S': //Agendada
                    req.post.DTRESOFE = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
                    parm.sql += `, IDS001RE = ${req.post.IDS001}, DTRESOFE = TO_DATE('${req.post.DTRESOFE}', 'YYYY-MM-DD HH24:MI:SS')`;
                    break;

            }

            parm.sql += 
                ` WHERE IDO005 IN 

                    (SELECT O005.IDO005 
                    
                    FROM O005 -- OFERECIMENTOS

                    INNER JOIN G046 -- CARGAS 
                        ON G046.IDG046 = O005.IDG046
                        AND G046.IDG024 = O005.IDG024

                    WHERE G046.IDG046 IN (${req.post.IDG046.join()}))`;

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Confere status atual da carga
     * @function checaStatusCarga
     * @author Rafael Delfino Calzado
     * @since 17/12/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checaStatusCarga = async function (req) { 
    
        try { 

            var sql = 
                `SELECT 
                    IDG046, 
                    IDG024, 
                    STCARGA,
                    
                    CASE 
                        WHEN STCARGA = 'B' THEN 'BACKLOG'
                        WHEN STCARGA = 'R' THEN 'DISTRIBUÍDA'
                        WHEN STCARGA = 'O' THEN 'OFERECIDA'
                        WHEN STCARGA = 'X' THEN 'RECUSADA'
                        WHEN STCARGA = 'A' THEN 'ACEITA'
                        WHEN STCARGA = 'S' THEN 'AGENDADA'
                        WHEN STCARGA = 'P' THEN 'PRÉ-APROVAÇÃO'
                        WHEN STCARGA = 'T' THEN 'EM TRANSPORTE'
                        WHEN STCARGA = 'C' THEN 'CANCELADA'
                    ELSE 'OUTRO'
                END AS DSSTACAR                
               
                FROM G046 

                WHERE 
                    IDG046 = ${req.post.IDG046}`;        
    
            await gdao.controller.setConnection(req.objConn);                
            return await gdao.executar({ sql, objConn: req.objConn });

        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    return api;

}
