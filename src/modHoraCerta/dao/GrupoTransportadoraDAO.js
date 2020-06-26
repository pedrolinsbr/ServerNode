/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/GrupoTransportadora
 * @description G023
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

  /**
   * @description Listar um dados da tabela G023.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G023',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: `  Select  G023.IDG023,
                          G023.STCADAST,
                          G023.DTCADAST,
                          G023.IDS001,
                          G023.SNDELETE,
                          G023.DSGRUTRA,
                          G023.SNTRAINT,
                          CASE 
                          	WHEN G023.SNTRAINT = 1 THEN 'Sim'
                          	WHEN G023.SNTRAINT = 0 THEN 'Não'
                          END DSSNTRAI
                     From G023 G023 `+
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
   * @description Listar um dado na tabela G023, H016.
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

      var id = req.body.IDG023;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G023.IDG023,
                      G023.STCADAST,
                      G023.DTCADAST,
                      G023.IDS001,
                      G023.SNDELETE,
                      G023.DSGRUTRA,
                      G023.SNTRAINT,
                      CASE 
                        WHEN G023.SNTRAINT = 1 THEN 'Sim'
                        WHEN G023.SNTRAINT = 0 THEN 'Não'
                      END DSSNTRAI
                From  G023 G023
                Where G023.IDG023   = : id
                  And G023.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G023.
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
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      let GrupoTransportadora = await con.insert({
        tabela: 'G023',
        colunas: {

          STCADAST: req.body.STCADAST,
          DTCADAST:new Date(),
          IDS001: 1,
          SNDELETE: 0,
          DSGRUTRA: req.body.DSGRUTRA,
          SNTRAINT: req.body.SNTRAINT.id

        },
        key: 'IdG023'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
        });
      
      await con.close();
      logger.debug("Fim salvar");
      return { response: req.__('hc.sucesso.insert') };
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Atualizar um dado na tabela G023, H016.
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

      var id = req.body.IDG023;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G023',
          colunas: {

            STCADAST: req.body.STCADAST,
            DSGRUTRA: req.body.DSGRUTRA,
            SNTRAINT: req.body.SNTRAINT.id

          },
          condicoes: 'IdG023 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return result1;  
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });
      
      await con.close();
      logger.debug("Fim atualizar");
      //return result;
      return { response: req.__('hc.sucesso.update') };
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };

  /**
   * @description Delete um dado na tabela G023.
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
      var ids = req.body.IDG023;  
    
    let result = await
      con.update({
        tabela: 'G023',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG023 in (`+ids+`)`
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
