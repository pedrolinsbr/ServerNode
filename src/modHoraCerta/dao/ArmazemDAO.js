/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/Armazem
 * @description G028, .
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
   * @description Listar um dados da tabela G028.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G028',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select G028.IDG028,
                        G028.NMARMAZE,
                        G028.STCADAST,
                        G028.DTCADAST,
                        G028.IDS001,
                        G028.SNDELETE,
                        G028.NRLATITU,
                        G028.NRLONGIT,
                        nvl(G028.QTMINJAN,0) as QTMINJAN,
                        nvl(G028.QTMINARM,0) as QTMINARM,
                        nvl(G028.QTMINEDI,0) as QTMINEDI,
                        COUNT(G028.IdG028) OVER () as COUNT_LINHA
                   From G028 G028`+
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
   * @description Listar um dado na tabela G028.
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

      var id = req.body.IDG028;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G028.IDG028,
                      G028.NMARMAZE,
                      G028.STCADAST,
                      G028.DTCADAST,
                      G028.IDS001,
                      G028.SNDELETE,
                      G028.NRLATITU,
                      G028.NRLONGIT,
                      G028.NRSAFRA,
                      G028.NRESAFRA,
                      G028.SNARMBRA,
                      nvl(G028.QTMINJAN,0) as QTMINJAN,
                      nvl(G028.QTMINARM,0) as QTMINARM,
                      nvl(G028.QTMINEDI,0) as QTMINEDI,
                      COUNT(G028.IdG028) OVER () as COUNT_LINHA
                 From G028 G028
                Where G028.IdG028   = : id
                  And G028.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G028.
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

      let result = await con.insert({
        tabela: 'G028',
        colunas: {
          NMARMAZE: req.body.NMARMAZE,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          QTMINJAN: req.body.QTMINJAN,
          QTMINARM: req.body.QTMINARM,
          QTMINEDI: req.body.QTMINEDI,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          NRESAFRA: req.body.NRESAFRA,
          NRSAFRA : req.body.NRSAFRA ,
          SNARMBRA: req.body.SNARMBRA,
          IDS001  : 1,
        },
        key: 'IdG028'
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
   * @description Atualizar um dado na tabela G028, .
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

      var id = req.body.IDG028;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G028',
          colunas: {
            NMARMAZE: req.body.NMARMAZE,
            STCADAST: req.body.STCADAST,
            QTMINJAN: req.body.QTMINJAN,
            QTMINARM: req.body.QTMINARM,
            QTMINEDI: req.body.QTMINEDI,
            NRLATITU: req.body.NRLATITU,
            NRLONGIT: req.body.NRLONGIT,
            NRESAFRA: req.body.NRESAFRA,
            NRSAFRA : req.body.NRSAFRA ,
            SNARMBRA: req.body.SNARMBRA,
          },
          condicoes: 'IdG028 = :id',
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
   * @description Delete um dado na tabela G028.
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
      var ids = req.body.IDG028;  
    
    let result = await
      con.update({
        tabela: 'G028',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG028 in (`+ids+`)`
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

  /**
   * @description Buscar capacidades dos armazéns, da tabela G028.
   *
   * @async
   * @function api/buscar-capacidades
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscarCapacidades = async function (req, res, next) {
    
    logger.debug("Inicio buscar capacidades");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G028.IDG028,
                      G028.NRSAFRA,
                      G028.NRESAFRA
                 From G028 G028
                Where G028.IdG028  in (${req.body.IDG028})
                  And G028.SnDelete = 0`,
        param: { }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result);
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


  return api;
};
