module.exports = function (app, cb) {

    const dbg = app.src.modGlobal.controllers.dbGearController;

    var api = {};

    api.dbg = dbg;

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Verifica a situação da Delivery antes de encerrá-la
        *
        * @async 
        * @function verSitDelivery
        *
        * @returns  {Array}     Retorna um array com o resultado da pesquisa
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 28/10/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.verSitDelivery = async function (req) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = 
                `SELECT 
                    G043.IDG043, 
                    G043.TPDELIVE,
                    G043.IDG014,
                    G049.IDG048

                FROM G043 -- DELIVERIES

                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG043 = G043.IDG043

                INNER JOIN G048 -- ETAPA
                    ON G048.IDG048 = G049.IDG048

                INNER JOIN G046 -- CARGA
                    ON G046.IDG046 = G048.IDG046

                LEFT JOIN G051 -- CTE
                    ON G051.IDG051 = G049.IDG051
                    AND G051.SNDELETE = 0 

                WHERE 
                    G043.SNDELETE = 0
                    AND G046.SNDELETE = 0
                    AND G046.STCARGA <> 'C'                    
                    AND G043.STETAPA NOT IN (5, 6, 7, 8, 25)
                    AND G043.DTENTREG IS NULL 
                    AND ((G049.IDG051 IS NULL) OR (G051.STCTRC <> 'C'))
                    AND G046.TPMODCAR <> 1
                    AND G043.IDG043 = ${req.IDG043}
                `;

            await dbg.controller.setConnection(parm.objConn);

            return await dbg.execute(parm);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}