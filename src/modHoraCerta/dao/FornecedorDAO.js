/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 * 
*/

/** 
 * @module dao/Fornecedor
 * @description G005, .
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
  const tmz 		= app.src.utils.DataAtual;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  /**
   * @description Listar um dados da tabela G005.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G005',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select G005.IDG005,
                        G005.NMCLIENT,
                        G005.RSCLIENT,
                        G005.TPPESSOA,
                        G005.CJCLIENT,
                        G005.DSENDERE,
                        G005.NRENDERE,
                        G005.BIENDERE,
                        G005.DSEMAIL,
                        G005.CPENDERE,
                        G003.NMCIDADE,                          
                        G003.IDG003,                          
                        G005.STCADAST,
                        G005.DTCADAST,
                        G005.IDS001,  
                        G005.SNDELETE,
                        COUNT(G005.IdG005) OVER () as COUNT_LINHA
                   From G005
                   INNER JOIN G003 ON
                   G005.IDG003 = G003.IDG003`+
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
   * @description Listar um dado na tabela G00255  *
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

      var id = req.body.IDG005;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G005.IDG005,
                      G005.NMCLIENT,
                      G005.RSCLIENT,
                      G005.TPPESSOA,
                      G005.CJCLIENT,
                      G005.DSENDERE,
                      G005.NRENDERE,
                      G005.BIENDERE,
                      G005.DSEMAIL,
                      G005.CPENDERE,
                      G003.NMCIDADE, 
                      G003.IDG003,                         
                      G005.STCADAST,
                      G005.DTCADAST,
                      G005.IDS001,  
                      G005.SNDELETE,
                      COUNT(G005.IdG005) OVER () as COUNT_LINHA
                From G005
                INNER JOIN G003 ON
                G005.IDG003 = G003.IDG003    
                 
                Where G005.IdG005   = : id
                  And G005.SnDelete = 0`,
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
      logger.debug("Fim buscar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };


  api.inserir = async function (req, res, next){

    var objBanco = {
        table:    'G005'
      , key:      ['IDG005']
      , vlFields:  {}
    }

    objBanco.vlFields.NMCLIENT  =   req.body.NMCLIENT;
    objBanco.vlFields.RSCLIENT  =   req.body.RSCLIENT;
    objBanco.vlFields.TPPESSOA  =   "J";
    objBanco.vlFields.CJCLIENT  =   req.body.CJCLIENT;
    objBanco.vlFields.DSENDERE  =   req.body.DSENDERE;
    objBanco.vlFields.NRENDERE  =   req.body.NRENDERE;
    objBanco.vlFields.DSEMAIL   =   req.body.DSEMAIL;
    objBanco.vlFields.BIENDERE  =   req.body.BIENDERE;
    objBanco.vlFields.CPENDERE  =   req.body.CPENDERE;
    objBanco.vlFields.IDG003    =   req.body.IDG003;
    objBanco.vlFields.STCADAST  =   "A";
    objBanco.vlFields.DTCADAST  =   tmz.dataAtualJS();
    objBanco.vlFields.IDS001    =   req.body.IDS001;
    objBanco.vlFields.SNDELETE  =   0;
    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }


  /**
   * @description Salvar um dado na tabela G005.
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
        tabela: 'G005',
        colunas: {
          NMCLIENT  : req.body.NMCLIENT,
          RSCLIENT  : req.body.RSCLIENT,
          TPPESSOA  : 'J',
          CJCLIENT  : req.body.CJCLIENT,
          DSENDERE  : req.body.DSENDERE,
          NRENDERE  : req.body.NRENDERE,
          DSEMAIL   : req.body.DSEMAIL,
          BIENDERE  : req.body.BIENDERE,
          CPENDERE  : req.body.CPENDERE,
          IDG003    : req.body.G003_IDG003, 
          STCADAST  : req.body.STCADAST,
          DTCADAST  : new Date(),       
          IDS001    : req.body.IDS001,  
          SNDELETE  : 0,
        },
        key: 'IdG005'
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
   * @description Atualizar um dado na tabela G005, .
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

      var id = req.body.IDG005;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G005',
          colunas: {
            NMCLIENT  : req.body.NMCLIENT,
            RSCLIENT  : req.body.RSCLIENT,
            TPPESSOA  : req.body.TPPESSOA.id,
            CJCLIENT  : req.body.CJCLIENT,
            DSEMAIL   : req.body.DSEMAIL,
            DSENDERE  : req.body.DSENDERE,
            NRENDERE  : req.body.NRENDERE,
            BIENDERE  : req.body.BIENDERE,
            CPENDERE  : req.body.CPENDERE,
            IDG003    : req.body.G003_IDG003.id,                       
            IDS001    : req.body.IDS001,  
            SNDELETE  : 0,
          },
          condicoes: 'IdG005 = :id',
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
   * @description Delete um dado na tabela G005.
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
      var ids = req.body.IDG005;  
    
    let result = await
      con.update({
        tabela: 'G005',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG005 in (`+ids+`)`
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
