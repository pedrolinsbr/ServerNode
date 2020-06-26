/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 22/11/2018
 *
*/

/**
 * @module dao/lOG
 * @description S037.
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
   * @description Listar um dados da tabela S037.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
    api.listarLog = async function(req,res,next) {

        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let sqlComplement = '';
            logger.debug("Parametros recebidos:", req.body);
            if(req.body['parameter[DSCHAVE]'] !== undefined && req.body['parameter[DSCHAVE]'] != ''){
              sqlComplement = ` S037.DSCHAVE like '%${req.body['parameter[DSCHAVE]']}%'`;
              delete req.body['parameter[DSCHAVE]'];
            }

            if(req.body['parameter[DSDETALH]'] !== undefined && req.body['parameter[DSDETALH]'] != ''){
              sqlComplement = ` S037.DSDETALH like '%${req.body['parameter[DSDETALH]']}%'`;
              delete req.body['parameter[DSDETALH]'];
            }

            var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'S037',false);
            if(sqlComplement != ''){
              if(sqlWhere ==''){
                sqlComplement = ' and '+ sqlComplement
              }else{
                sqlComplement = ' and '+ sqlComplement
              }
            }

            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
            sqlOrder = ' order by S037.DTREGIST DESC'
            let result = await con.execute(
              {
                sql:`
                select to_char(S037.DTREGIST,'DD/MM/YYY - HH24:MI:SS') as DTREGIST,
                    case
                      when S037.DSUSUARI <> 'PRD' AND S037.DSUSUARI <> 'DEV' AND S037.DSUSUARI <> 'ROOT' AND S037.DSUSUARI <> 'QAS' then (Select S001.NMUSUARI from S001 S001 where S001.IDS001 = S037.DSUSUARI)
                      else 
                      dsusuari
                      end AS DSUSUARI,
                    S037.DSACAO,
                    S037.IDS007,
                    S037.DSCHAVE,
                    S037.DSDETALH,
                    CASE
                        WHEN 
                          S037.DSTERMIN = 'SRVTERCEIRO' THEN S037.DSAPLICA || ' - 192.10.10.153'
                        WHEN 
                          S037.DSTERMIN = 'www@app1 (TNS V1-V3)' THEN S037.DSAPLICA || ' - 34.253.52.140'
                        WHEN 
                          S037.DSTERMIN = 'www@php-app1 (TNS V1-V3)' THEN S037.DSAPLICA || ' - 34.238.36.203'
                        WHEN 
                          S037.DSTERMIN = 'httpd@srvaplsl01.bravo.com.br (TNS V1-V3)' THEN S037.DSAPLICA || ' - 10.10.6.60'
                        ELSE NULL END AS DSAPLICA,
                    S037.DSUSUASO,
                    S037.DSIP,
                    S037.DSTERMIN,
                    S007.DSTABELA,
                    S007.NMTABELA,
                    COUNT(S037.IDS007) over() as COUNT_LINHA
                from S037 S037
                Join S007 S007 on S007.IDS007 = S037.IDS007
                `+
                        sqlWhere +
                        //`and S037.DSUSUARI <> 'PRD'` +
                        sqlComplement +
                        sqlOrder +
                        sqlPaginate,
                param: bindValues
                }, console.log(sqlWhere), console.log(bindValues)
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
   * @description Listar um dado na tabela S037.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
    api.buscarLog = async function(req,res,next){

        logger.debug("Inicio buscar");
        let con = await this.controller.getConnection(null, req.UserId);
    
        try {
    
          var id = req.body.IS007 +''+ req.body.DSCHAVE;
          logger.debug("Parametros buscar:", req.body);
    
          let result = await con.execute(
          {
            sql: `select S037.DSUSUARI,
                        S037.DTREGIST,
                        S037.DSACAO,
                        S037.IDS007,
                        S037.DSCHAVE,
                        S037.DSDETALH,
                        S037.DSAPLICA,
                        S037.DSUSUASO,
                        S037.DSIP,
                        S037.DSTERMIN
                    from S037 S037
                    where IDS007 || DSCHAVE = : id`,
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

    api.listarTimeLine = async function(req,res,next) {

      logger.debug("Inicio listar");
      let con = await this.controller.getConnection(null, req.UserId);

      try {
          let sqlComplement = '';
          var sqlWhere = '';
          logger.debug("Parametros recebidos:", req.body);

          if(req.body.DSCHAVE !== undefined && req.body.DSCHAVE != ''){
            sqlComplement = ` S037.DSCHAVE = ${req.body.DSCHAVE}`;
          }

          if(req.body.DSDETALH !== undefined && req.body.DSDETALH != ''){
            sqlComplement = ` S037.DSDETALH like '%${req.body.DSDETALH}%'`;
          }
        

          var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'S037',false);
          
          if(req.body.IDS007.id && req.body.IDS007.id != null && req.body.IDS007.id != undefined){
            sqlWhere +=`where s007.ids007 =${req.body.IDS007.id}`;
          }
          if(sqlComplement != ''){
            if(sqlWhere ==''){
              sqlComplement = ' and '+ sqlComplement
            }else{
              sqlComplement = ' and '+ sqlComplement
            }
          }

          sqlOrder = ' order by S037.DTREGIST DESC'
          let result = await con.execute(
            {
              sql:`
              select to_char(S037.DTREGIST,'DD/MM/YYY - HH24:MI:SS') as DTREGIST,
                  case
                    when S037.DSUSUARI <> 'PRD' AND S037.DSUSUARI <> 'DEV' AND S037.DSUSUARI <> 'ROOT' AND S037.DSUSUARI <> 'QAS' then (Select S001.NMUSUARI from S001 S001 where S001.IDS001 = S037.DSUSUARI)
                    else 
                    dsusuari
                    end AS DSUSUARI,
                  S037.DSACAO,
                  S037.IDS007,
                  S037.DSCHAVE,
                  S037.DSDETALH,
                  CASE
                    WHEN 
                      S037.DSTERMIN = 'SRVTERCEIRO' THEN S037.DSAPLICA || ' - 192.10.10.153'
                    WHEN 
                      S037.DSTERMIN = 'www@app1 (TNS V1-V3)' THEN S037.DSAPLICA || ' - 34.253.52.140'
                    WHEN 
                      S037.DSTERMIN = 'www@php-app1 (TNS V1-V3)' THEN S037.DSAPLICA || ' - 34.238.36.203'
                    WHEN 
                      S037.DSTERMIN = 'httpd@srvaplsl01.bravo.com.br (TNS V1-V3)' THEN S037.DSAPLICA || ' - 10.10.6.60'
                    ELSE '(' || S037.DSAPLICA || ' ['  || s037.DSIP || '])' END AS DSAPLICA,
                  S037.DSUSUASO,
                  S037.DSIP,
                  S037.DSTERMIN,
                  S007.DSTABELA,
                  S007.NMTABELA,
                  COUNT(S037.IDS007) over() as COUNT_LINHA
              from S037 S037
              Join S007 S007 on S007.IDS007 = S037.IDS007
              `+
                      sqlWhere +
                      //`and S037.DSUSUARI <> 'PRD'` +
                      sqlComplement +
                      sqlOrder,
              param: bindValues
              }, console.log(sqlWhere), console.log(bindValues)
          )
          .then((result) => {
              logger.debug("Retorno:", result);
              return (result);
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

    return api;
};
