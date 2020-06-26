/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/TempoArmazem
 * @description H014
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
   * @description Listar um dados da tabela H014.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H014',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select H014.IDH014,
                        H014.IDH002,
                        H014.VRTEMCAR,
                        H014.VRPESCAR,
                        H014.DSTIPVEI,
                        H014.STCADAST,
                        H014.DTCADAST,
                        H014.IDS001,
                        H014.SNDELETE,
                        G028.NMARMAZE,
                        H002.DSTIPCAR,
                        COUNT(*) OVER() AS COUNT_LINHA
                   From H014 H014
                   Join G028 G028 on (H014.IdG028 = G028.IdG028) 
                   Join H002 H002 on (H014.IdH002 = H002.IdH002) `+
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
   * @description Listar um dado na tabela H014, H016.
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

      var id = req.body.IDH014;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select H014.IDH014,
                      H014.IDH002,
                      H014.VRTEMCAR,
                      H014.VRPESCAR,
                      H014.DSTIPVEI,
                      H014.STCADAST,
                      H014.DTCADAST,
                      H014.IDS001,
                      G028.NMARMAZE,
                      H002.DSTIPCAR
                From H014 H014
                Join G028 G028 on (H014.IdG028 = G028.IdG028)
                Join H002 H002 on (H014.IdH002 = H002.IdH002)
               Where H014.IdH014   = : id
                 And H014.SnDelete = 0`,
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
   * @description Salvar um dado na tabela H014.
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

      let tempoArmazem = await con.insert({
        tabela: 'H014',
        colunas: {
          IDH002: req.body.IDH002.id,
          VRTEMCAR: req.body.VRTEMCAR,
          VRPESCAR: req.body.VRPESCAR,
          DSTIPVEI: req.body.DSTIPVEI,
          IDG028: 1,
          StCadast: "A",
          DtCadast: new Date(),
          IdS001: 1
        },
        key: 'IdH014'
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
   * @description Atualizar um dado na tabela H014, H016.
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

      var id = req.body.IDH015;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H014',
          colunas: {
            IDH002: req.body.IDH002.id,
            VRTEMCAR: req.body.VRTEMCAR,
            VRPESCAR: req.body.VRPESCAR,
            DSTIPVEI: req.body.DSTIPVEI,
            IDG028: 1,
            StCadast:  req.body.STCADAST
          },
          condicoes: 'IdH014 = :id',
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
   * @description Delete um dado na tabela H014.
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
      var ids = req.body.IDH014;  
    
    let result = await
      con.update({
        tabela: 'H014',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdH014 in (`+ids+`)`
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
