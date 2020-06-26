/**
 * @description Possui os métodos responsaveis por validar e reagendar uma carga
 * @author Everton
 * @since 25/04/2018
 * 
*/

/** 
 * @module dao/Reagendamento
 * @description H006/H007/H008.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  
  var api          =    {};
  var logger       =    app.config.logger;
  api.controller   =    app.config.ControllerBD;
  var db           =    require(process.cwd() + '/config/database');
  
/**
 * @description Busca o mapa de uma carga.
 *
 * @async
 * @function api/buscarMapa
 * @param {request} req - Possui as requisições para a função, {IDG046}.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON contendo os dados para o mapa da carga.
 * @throws Caso falso, o número do log de erro aparecerá no console.
 * @since 0108-2018
 * @author Everton Pessoa
*/ 
 api.buscarMapa = async function (req, res, next) {

  logger.debug("Inicio buscarMapa");

  sql = `
          SELECT  G043.NRNOTA 
                , G005RE.NMCLIENT AS REMETENTE
                , G005DE.NMCLIENT AS DESTINATARIO
                , G003.NMCIDADE
                , G005DE.DSENDERE
                , G045.VRVOLUME
                , G045.PSBRUTO
                , G045.IDG045
                , G045.DSPRODUT
                , G045.NRONU
                , G050.DSLOTE
                , G050.QTPRODUT
          FROM G049
            INNER JOIN G048
              ON G049.IDG048 = G048.IDG048
            INNER JOIN G046
              ON G048.IDG046 = G046.IDG046
            INNER JOIN G043
              ON G043.IDG043 = G049.IDG043 
            INNER JOIN G045
              ON G045.IDG043 = G043.IDG043
            INNER JOIN G050
              ON G050.IDG045 = G045.IDG045
            INNER JOIN G005 G005RE
              ON G005RE.IDG005 = G043.IDG005RE
            INNER JOIN G005 G005DE
            ON G005DE.IDG005 = G043.IDG005DE
            INNER JOIN G003
            ON G003.IDG003 = G005DE.IDG003
          WHERE G046.IDG046 = ${req.IDG046}
        `

  return await db.execute(
    {
      sql,
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

  logger.debug("Fim buscarHorarioReagendar");
};
  
  return api;

};
