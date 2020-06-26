/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de agendamento
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module dao/Agendamento
 * @description H006/H007/H008.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  var api         = {};
  var utils       = app.src.utils.FuncoesObjDB;
  
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;

  var moment = require('moment');
  moment.locale('pt-BR');
  var db = require(process.cwd() + '/config/database');

  const gdao = app.src.modGlobal.dao.GenericDAO;

  
  /**-----------------------------------------------------------------------
   * @description Busca o agendamento de acordo com o número do agendamento e motorista
   * @async
   * @function api/mudarStFinali
   * @param {request} req - Possui o IDH006 do agendamento.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   *-----------------------------------------------------------------------*/

  api.buscarAgendamento = async function (req, res, next) {

    logger.debug("Inicio buscar Agendamento");

    logger.debug("Parametros recebidos:", req.body);

    var sql = `
                SELECT  H008.* FROM H008
                INNER JOIN H006 ON H008.IDH006 = H006.IDH006
                WHERE H008.STAGENDA > 2 AND H008.STAGENDA < 13
                AND H006.IDH006 =   ${req.body.IDH006} -- 18
                AND H006.IDG031 =   ${req.body.IDG031} -- 15
                AND H008.SNDELETE = 0
                ORDER BY H008.NRSEQMOV DESC 
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

    logger.debug("Fim buscar tomadores");
  };

    /**-----------------------------------------------------------------------
   * @description Busca o agendamento de acordo com o número do agendamento e motorista
   * @async
   * @function api/mudarStFinali
   * @param {request} req - Possui o IDH006 do agendamento.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   *-----------------------------------------------------------------------*/

  api.buscarMotorista = async function (req, res, next) {

    logger.debug("Inicio buscar Motorista");

    logger.debug("Parametros recebidos:", req.body);

    var sql = `
                SELECT IDG031, CJMOTORI, NMMOTORI FROM G031
                WHERE CJMOTORI = '${req.body.CJMOTORI}'--'08676052603'
                AND SNDELETE = 0
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

    logger.debug("Fim buscar tomadores");
  };

  api.buscarSolicitarEntrada = async function (req, res, next){

    req.sql = 
              `SELECT H008.IDH006, G031.NMMOTORI, H008.HOOPERAC, H008.TXOBSERV, H008.STAGENDA FROM H008 
                  INNER JOIN H006 ON H006.IDH006 = H008.IDH006
                  INNER JOIN G031 ON G031.IDG031 = H006.IDG031 
                  WHERE H008.IDH006 = ${req.body.IDH006} 
                  ORDER BY H008.IDH006 DESC 
                `;
    
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  api.buscarUltimosChamadosPainel = async function (req, res, next){

    req.sql = 
              `SELECT H008.IDH006, G031.NMMOTORI, H008.HOOPERAC, H008.TXOBSERV, H008.STAGENDA FROM H008 
                  INNER JOIN H006 ON H006.IDH006 = H008.IDH006
                  INNER JOIN G031 ON G031.IDG031 = H006.IDG031 
                  WHERE H008.IDH006 = ${req.body.IDH006} 
                  ORDER BY H008.IDH006 DESC 
                `;
    
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }





  return api;

};
