/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/TempoStatus
 * @description H015, H016.
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
   * @description Listar um dados da tabela H015.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H015',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select H015.IDH015,
                        H015.IDG028,
                        H015.DSCONFIG,
                        H015.STCADAST,
                        H015.DTCADAST,
                        H015.IDS001,
                        H015.SNDELETE, 
                        G028.NMARMAZE,
                        COUNT(H015.IdH015) OVER () as COUNT_LINHA
                    From H015 H015
                    Join G028 G028 on (H015.IdG028 = G028.IdG028)
               Left Join H016 H016 on (H015.IdH015 = H016.IdH015)`+
                    sqlWhere + ` Group by H015.IDH015,
                                          H015.IDG028,
                                          H015.DSCONFIG,
                                          H015.STCADAST,
                                          H015.DTCADAST,
                                          H015.IDS001,
                                          H015.SNDELETE, 
                                          G028.NMARMAZE ` +
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
   * @description Listar um dado na tabela H015, H016.
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

      var id = req.body.IDH015;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `Select H015.IDH015,
                     H015.IDG028,
                     H015.DSCONFIG,
                     H015.STCADAST,
                     H015.DTCADAST,
                     H015.IDS001,
                     H015.SNDELETE,
                     G028.NMARMAZE,
                     H016.STAGENDA,
                     H016.QTTEMPO
                From H015 H015
                Join G028 G028 on (H015.IdG028 = G028.IdG028)
           Left Join H016 H016 on (H015.IdH015 = H016.IdH015)
               Where H015.IdH015   = : id
                 And H015.SnDelete = 0`,
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
   * @description Listar um dado na tabela H015, H016.
   *
   * @async
   * @function api/status
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscarStatus = async function (req, res, next) {
    
    logger.debug("Inicio buscarStatus");
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDH015;
      logger.debug("Parametros buscarStatus:", req.body);

      let result = await con.execute(
      {
        sql: `Select H016.IDH016,
                     H015.IDG028,
                     H016.STAGENDA,
                     H016.QTTEMPO,
                     H016.IDH015
                From H015 H015
                Join H016 H016 on (H015.IdH015 = H016.IdH015)
               Where H015.IdH015   = : id
                 And H015.SnDelete = 0`,
        param: {
          id: id
        }
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
      logger.debug("Fim buscarStatus");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };

  /**
   * @description Salvar um dado na tabela H015.
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
      logger.debug("Inicio salvar >>>", req.body['QTTEMPO4']);

      let IdH015 = await con.insert({
        tabela: 'H015',
        colunas: {
          DsConfig: req.body.DSCONFIG,
          StCadast: "A",
          DtCadast: new Date(),
          IdG028  : req.body.IDG028.id,
          IdS001  : 1
        },
        key: 'IdH015'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
        //return { response: req.__('hc.sucesso.tempoStatusSalvar') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
        });
      
      let arStAgenda = [4, 5, 6, 7, 8];
      let result = [];
      for (let j = 4; j <= 8; j++) {
        
        let result2 = await con.insert({
          tabela: 'H016',
          colunas: {
            QtTempo  : req.body['QTTEMPO'+j],
            StAgenda: j,
            IdH015: IdH015
          },
          key: 'IdH016'
        })
        .then((result1) => {
          logger.debug("Retorno:", result1);
          //return { response: req.__('hc.sucesso.tempoStatusSalvar') };
          result[j] = result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });
        
        
      }

  
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
   * @description Atualizar um dado na tabela H015, H016.
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
          tabela: 'H015',
          colunas: {
            DsConfig:  req.body.DSCONFIG,
            StCadast:  req.body.STCADAST,
            IdG028  :  req.body.IDG028.id
          },
          condicoes: 'IdH015 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          //return {response: req.__('hc.sucesso.tempoStatusAtualizado')};
          return result1;  
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });
      
      
      
          let arStAgenda = [4, 5, 6, 7, 8];
          let idH016     = null;
          let resultAr   = [];
      
          for (let j = 4; j <= 8; j++) {
            
            idH016 = req.body['IDH016' + j];
            
            let result2 = await con.update({
              tabela: 'H016',
              colunas: {
                QtTempo  : req.body['QTTEMPO'+j],
                StAgenda: j
              },
              condicoes: 'IdH016 = :id ',
              parametros: {
                id: id
              }
            })
            .then((result1) => {
              logger.debug("Retorno:", result1);
              //return { response: req.__('hc.sucesso.tempoStatusSalvar') };
              //return result1;
              resultAr[j] = result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
              });
            
            
          }
      
      
      
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
   * @description Delete um dado na tabela H015.
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
      var ids = req.body.IDH015;  
    
    let result = await
      con.update({
        tabela: 'H015',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdH015 in (`+ids+`)`
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
