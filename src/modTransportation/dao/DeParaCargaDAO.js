/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/DeParaCarga
 * @description G058, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G058.
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G058',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select G058.IDG058,
                        G058.IDG005RE,
                        G058.IDG005DE,
                        G058.SNDELETE,
                        G058.STCADAST,
                        G058.DTCADAST,
                        G058.IDS001,
                        COUNT(G058.IdG058) OVER () as COUNT_LINHA
                   From G058 G058`+
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
   * @description Listar um dado na tabela G058.
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDG058;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G058.IDG058,
                      G058.IDG005RE,
                      G058.IDG005DE,
                      G058.SNDELETE,
                      G058.STCADAST,
                      G058.DTCADAST,
                      G058.IDS001,
                      COUNT(G058.IdG058) OVER () as COUNT_LINHA
                 From G058 G058
                Where G058.IdG058   = : id
                  And G058.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G058.
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
        tabela: 'G058',
        colunas: {

          IDG005RE: req.body.IDG005RE,
          IDG005DE: req.body.IDG005DE,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: req.UserId,
          
        },
        key: 'IdG058'
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
   * @description Atualizar um dado na tabela G058, .
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
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDG058;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G058',
          colunas: {
            IDG005RE: req.body.IDG005RE,
            IDG005DE: req.body.IDG005DE,
            STCADAST: req.body.STCADAST
          },
          condicoes: 'IdG058 = :id',
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
   * @description Delete um dado na tabela G058.
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");  
      var ids = req.body.IDG058;  
    
    let result = await
      con.update({
        tabela: 'G058',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG058 in (`+ids+`)`
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
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
