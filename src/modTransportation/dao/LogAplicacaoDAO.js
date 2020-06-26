/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 22/11/2018
 *
*/

/**
 * @module dao/lOGAPLICACAO
 * @description G017.
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
   * @description Listar um dados da tabela G017.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
    api.listarLogAplicacao = async function(req,res,next) {

        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G017',false);

            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
            sqlOrder = ' order by G017.DTREGIST DESC'
            let result = await con.execute(
              {
                sql:`
                select to_char(G017.DTREGIST,'DD/MM/YYY - HH24:MI:SS') as DTREGIST,
                    G017.IDG017,
                    S001.IDS001,
                    S001.NMUSUARI, 
                    G017.IDUSUDB, 
                    NVL(dbms_lob.substr( G017.TXMENSAG, 4000, 1 ),' ') as TXMENSAG,
                    NVL(dbms_lob.substr( G017.TXTRACE, 4000, 1 ),' ') as TXTRACE,
                    NVL(G017.TXSQL,' ') as TXSQL,
                    G017.DSPARAME,
                    G017.DSMODULO,
                    G017.DSURL, 
                    COUNT(G017.IDG017) over() as COUNT_LINHA
                from G017 G017
                Join S001 S001 on S001.IDS001 = G017.IDS001
                `+
                        sqlWhere +
                        sqlOrder +
                        sqlPaginate,
                param: bindValues
                }, console.log(sqlWhere), console.log(bindValues),
            )
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
   * @description Listar um dado na tabela G017.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
    api.buscarLogAplicacao = async function(req,res,next){

        logger.debug("Inicio buscar");
        let con = await this.controller.getConnection(null, req.UserId);
    
        try {
    
          var id = req.body.IDG017;
          logger.debug("Parametros buscar:", req.body);
    
          let result = await con.execute(
          {
            sql: `select 
                    to_char(G017.DTREGIST,'DD/MM/YYY - HH24:MI:SS') as DTREGIST,
                    G017.IDG017,
                    S001.IDS001,  
                    G017.IDUSUDB, 
                    G017.TXMENSAG,
                    G017.TXRACE,
                    G017.TXSQL,   
                    G017.DSPARAME,
                    G017.DSMODULO,
                    G017.DSURL, 
                    COUNT(G017.IDG017) over() as COUNT_LINHA
                from G017 G017
            Join S001 S001 on S001.IDS001 = G017.IDS001`,
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

    return api;
};
