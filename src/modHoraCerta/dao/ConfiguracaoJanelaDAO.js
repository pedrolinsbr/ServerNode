/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/ConfiguracaoJanela
 * @description H005, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  /**
   * @description Listar um dados da tabela H005.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.listar = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H005',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select H005.IDH005, 
                        H005.IDG028, 
                        H005.NRJANELA, 
                        H005.DSJANELA, 
                        H005.DTCADAST, 
                        H005.IDS001,
                        G028.NMARMAZE, 
                        H005.STCADAST,
                        COUNT(H005.IdH005) OVER () as COUNT_LINHA
                   From H005 H005
                   Join G028 G028 on (H005.IdG028 = G028.IdG028)`+
                    sqlWhere +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    
      await con.close();
      logger.debug("Fim listar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };


  /**
   * @description Listar um dado na tabela H005.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscar = async function (req, res, next) {
    
    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDH005;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `  Select H005.IDH005, 
                       H005.IDG028, 
                       H005.NRJANELA, 
                       H005.DSJANELA, 
                       TO_CHAR(H005.DtCadast,'DD/MM/YYYY') as DtCadast, 
                       H005.IDS001,
                       G028.NMARMAZE, 
                       H005.STCADAST,
                       COUNT(H005.IdH005) OVER () as COUNT_LINHA
                  From H005 H005
                  Join G028 G028 on (H005.IdG028 = G028.IdG028)
                Where H005.IdH005   = : id
                  And H005.SnDelete = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result[0]);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      await con.close();
      logger.debug("Fim buscar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };


  /**
   * @description Salvar um dado na tabela H005.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvar = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'H005',
        colunas: {
          DsJanela : req.body.DSJANELA,
          NrJanela : req.body.NRJANELA,
          StCadast: req.body.STCADAST,
          DtCadast: new Date(),
          IdG028  : req.body.IDG028.id,
          IdS001  : req.UserId
        },
        key: 'IdH005'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.insert') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
        });
      
  
      await con.close();
      logger.debug("Fim salvar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Atualizar um dado na tabela H005, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizar = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection();
    try {

      var id = req.body.IDH005;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H005',
          colunas: {
            DsJanela:  req.body.DSJANELA,
            NrJanela:  req.body.NRJANELA,
            IdG028  : req.body.IDG028.id
          },
          condicoes: 'IdH005 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });
      
      await con.close();
      logger.debug("Fim atualizar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };

  /**
   * @description Busca situacao de um dado na tabela H005.
   *
   * @async
   * @function api/buscarSituacao
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarSituacao = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `SELECT STCADAST FROM H005 WHERE IDH005 = ${req.body.IDH005}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return  await gdao.executar(req, res, next)
                      .then((result) => result[0].STCADAST)
                      .catch((err) => { throw err });

  };

  /**
   * @description Verifica se há slots ocupados na data atual em diante.
   *
   * @async
   * @function api/verificarSlotsOcupados
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.verificarSlotsOcupados = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `SELECT COUNT(*) AS QTD_SLOTS
                 FROM H007
                WHERE IDH005 = ${req.body.IDH005}
                  AND IDH006 IS NOT NULL
                  AND TO_DATE(HOINICIO, 'DD/MM/YYY') >= TO_DATE(CURRENT_DATE, 'DD/MM/YYY')`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return  await gdao.executar(req, res, next)
                      .then((result) => result[0].QTD_SLOTS)
                      .catch((err) => { throw err });

  };

  /**
   * @description Altera situacao de um dado na tabela H005.
   *
   * @async
   * @function api/alterarSituacao
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.alterarSituacao = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `UPDATE H005 SET STCADAST = '${req.body.STCADAST}' WHERE IDH005 = ${req.body.IDH005}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  };

  /**
   * @description Delete um dado na tabela H005.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluir = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection();

    try {

      logger.debug("ID selecionados");  
      var ids = req.body.IDH005;  
    
    let result = await
      con.update({
        tabela: 'H005',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdH005 in (`+ids+`)`
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.update') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
      await con.close();
      logger.debug("Fim excluir");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }

  }; 


  return api;
};
