/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
*/

/** 
 * @module dao/ParametrosGeraisCarga
 * @description G069.
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
   * @description Listar um dados da tabela G069.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G069',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select G069.IDG069		,
                        G069.IDG024		,
                        G069.HRPARADA	,
                        G069.HRTOLDIS	,
                        G069.KMCARREG	,
                        G069.KMDESCAR	,
                        G069.HRMAXENT	,
                        G069.HRMINENT	,
                        G069.CDPGRBRA	,
                        G069.VRAPOESC	,
                        G069.VRAPONOR	,
                        G069.VRCARESC ,
                        G069.VRCARNOR ,
                        G069.IDS001		,
                        G069.DTCADAST	,
                        G069.STCADAST	,
                        G069.SNDELETE	,
                        G069.SNMOBILE	,
                        G024.NMTRANSP || ' [' || G024.IDG024   || '-' || G024.IDLOGOS || ']' AS G024_NMTRANSP,
                        COUNT(G069.IdG069) OVER () as COUNT_LINHA
                   From G069 G069
                   Join G024 G024 on G024.IDG024 = G069.IDG024`+
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
   * @description Listar um dado na tabela G069.
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

      var id = req.body.IDG069;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G069.IDG069		,
                      G069.IDG024		,
                      G069.HRPARADA	,
                      G069.HRTOLDIS	,
                      G069.KMCARREG	,
                      G069.KMDESCAR	,
                      G069.HRMAXENT	,
                      G069.HRMINENT	,
                      G069.CDPGRBRA	,
                      G069.VRAPOESC	,
                      G069.VRAPONOR	,
                      G069.VRCARESC ,
                      G069.VRCARNOR ,
                      G069.IDS001		,
                      G069.DTCADAST	,
                      G069.STCADAST	,
                      G069.SNDELETE	,
                      G069.SNMOBILE	,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      COUNT(G069.IdG069) OVER () as COUNT_LINHA
                 From G069 G069
                 Join G024 G024 on G024.IDG024 = G069.IDG024
                Where G069.IdG069   = : id
                  And G069.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G069.
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
        tabela: 'G069',
        colunas: {


          IDG024	: req.body.IDG024.id,	
          HRPARADA: req.body.HRPARADA,	
          HRTOLDIS: req.body.HRTOLDIS,	
          KMCARREG: req.body.KMCARREG,	
          KMDESCAR: req.body.KMDESCAR,	
          HRMAXENT: req.body.HRMAXENT,	
          HRMINENT: req.body.HRMINENT,	
          CDPGRBRA: req.body.CDPGRBRA,	
          VRAPOESC: req.body.VRAPOESC,	
          VRAPONOR: req.body.VRAPONOR,	

          VRCARESC: req.body.VRCARESC,	
          VRCARNOR: req.body.VRCARNOR,
          
          
          SNMOBILE: req.body.SNMOBILE.id,

          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: req.UserId,
          
        },
        key: 'IdG069'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('tp.sucesso.insert') };
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
   * @description Atualizar um dado na tabela G069, .
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

      var id = req.body.IDG069;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G069',
          colunas: {

            IDG024	: req.body.IDG024.id,	
            HRPARADA: req.body.HRPARADA,	
            HRTOLDIS: req.body.HRTOLDIS,	
            KMCARREG: req.body.KMCARREG,	
            KMDESCAR: req.body.KMDESCAR,	
            HRMAXENT: req.body.HRMAXENT,	
            HRMINENT: req.body.HRMINENT,	
            CDPGRBRA: req.body.CDPGRBRA,	
            VRAPOESC: req.body.VRAPOESC,	
            VRAPONOR: req.body.VRAPONOR,
            
            VRCARESC: req.body.VRCARESC,	
            VRCARNOR: req.body.VRCARNOR,	

            SNMOBILE: req.body.SNMOBILE.id,
            
            STCADAST: req.body.STCADAST,
            
          },
          condicoes: 'IdG069 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('tp.sucesso.update')};
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
   * @description Delete um dado na tabela G069.
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
      var ids = req.body.IDG069;  
    
    let result = await
      con.update({
        tabela: 'G069',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG069 in (`+ids+`)`
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('tp.sucesso.delete') };
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
