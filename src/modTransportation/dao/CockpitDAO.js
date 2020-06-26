/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/DeParaCarga
 * @description S033, .
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
   * @description Listar um dados da tabela S033.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'S033',false);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      var tpInterf = '';

      if(req.body.TPINTERF){
        tpInterf = req.body.TPINTERF;
      }else{
        tpInterf = '11,12,13';
      }
      
      let result = await con.execute(
        {
          sql: ` Select S033.IDS032,
                        S033.IDS001,
                        S033.STATREQ,
                        S033.DTGERLOG,
                        S033.IDS033,
                        S032.URL,
                        S032.DSFUNCAO,
                        S033.CDRETORN,
                        (SELECT COUNT(S034.IDS034) FROM S034 WHERE S034.IDS033 = S033.IDS033) AS QTIDS34,
                        COUNT(S033.IDS033) OVER () as COUNT_LINHA
                  From S033 S033 
                  Join S032 S032 on S032.IDS032 = S033.IDS032  
                       ${sqlWhere}  
                   and S032.IDS025 = 7 
                   and S032.IDS032 in (${tpInterf})  
              Order by S033.IDS033 desc` +
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
   * @description Listar um dado na tabela S033.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscarDetalhe = async function (req, res, next) {
    
    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDS033;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select s034.ids034,
                      s034.dtgerlog,
                      s034.txtmensag,
                      s034.ids033,
                      s034.statdeta,
                      count(s034.ids034) over () as count_linha
                from s034 s034
                where s034.ids033  = : id `,
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


  return api;
};
