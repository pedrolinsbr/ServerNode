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
  var asnDAO      = app.src.modIntegrador.dao.ASNDAO;
  var cargasDAO   = app.src.modIntegrador.dao.CargasDAO;
  var dtatu       = app.src.utils.DataAtual;
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;


  const gdao = app.src.modGlobal.dao.GenericDAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');
 
  api.inserir = async function (req, res, next){

    var objBanco = {
        table:    'H023'
      , key:      ['IDH023']
      , vlFields:  {}
    }

    objBanco.vlFields.IDH006      =     req.IDH006;
    objBanco.vlFields.IDH022      =     req.IDH022;
    objBanco.vlFields.IDG009      =     req.IDG009;
    objBanco.vlFields.QTMATERI    =     req.QTMATERI;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
        
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }


  api.listar = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H022',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select H022.IDH022,
                        H022.CDMATERI,
                        H022.DSMATERI,
                        H022.TPMATERI,
                        H022.SNPESAGE,
                        H022.SNDELETE,
                        H022.DTCADAST,
                        COUNT(H022.IdH022) OVER () as COUNT_LINHA
                   From H022`+
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
   * @description Listar um dado na tabela H022.
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

      var id = req.body.IDH022;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select H022.IDH022,
                      H022.CDMATERI,
                      H022.DSMATERI,
                      H022.TPMATERI,
                      H022.SNPESAGE,
                      H022.SNDELETE,
                      H022.DTCADAST
                   From H022
                Where IDH022   = : id
                  And H022.SnDelete = 0`,
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
   * @description Salvar um dado na tabela H022.
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
        tabela: 'H022',
        colunas: {
          CDMATERI: req.body.CDMATERI,
          DSMATERI: req.body.DSMATERI,
          TPMATERI: req.body.TPMATERI.id,
          SNPESAGE: 'N',
          SNDELETE: 0,
          DTCADAST: new Date()
        },
        key: 'IdH022'
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
   * @description Atualizar um dado na tabela H022.
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

      var id = req.body.IDH022;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H022',
          colunas: {
            CDMATERI: req.body.CDMATERI,
            DSMATERI: req.body.DSMATERI,
            TPMATERI: req.body.TPMATERI.id            
          },
          condicoes: 'IdH022 = :id',
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
   * @description Delete um dado na tabela H022.
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
      var ids = req.body.IDH022;  
    
    let result = await
      con.update({
        tabela: 'H022',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdH022 in (`+ids+`)`
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