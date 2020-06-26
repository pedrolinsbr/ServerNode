/**
 * @description Possui os métodos responsaveis por alimentar a lista de 
 * @author Everton Pessôa
 * @since 11/04/2019
 * 
*/

/** 
 * @module dao/Horario
 * @description H006.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app) {
  
  var api    = {};
  var logger = app.config.logger;
  var db     = app.config.database;
  api.controller = app.config.ControllerBD;
  
  api.buscar = async function (req, res, next) {

    logger.debug("Inicio buscar transportadoras com slots reservados");

    var strSQL = `
                    SELECT H007.*, H005.NRJANELA FROM H007
                    INNER JOIN H005 ON H005.IDH005 = H007.IDH005
                    WHERE H007.SNDELETE = 0 
                    AND IDH006 IS NULL
                    AND H005.IDG028 = ${req.body.IDG028}
                    AND TO_CHAR(H007.HOINICIO, 'YYYY-MM-DD') = '${req.body.HOINICIO}'
                    AND (H007.STHORARI IS NULL OR H007.STHORARI = 'L') 
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
  };
  
  return api;
}