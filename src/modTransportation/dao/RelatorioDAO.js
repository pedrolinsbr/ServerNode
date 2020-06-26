/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/Relatorio
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
   * @description Listar um dados da tabela G046.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G046',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
        
      let	sql = `  SELECT G046.IDG046,
                          G046.DSCARGA,
                          G024.NMTRANSP || ' [' || G046.IDG024 || ']' AS NMTRANSP,
                          G046.PSCARGA,
                          G046.VRCARGA,
                          G046.SNCARPAR,
                          G046.TPTRANSP,
                          G046.DTCARGA,
		                      G046.DTSAICAR,
                          G046.TPMODCAR,
                          G028.NMARMAZE,
                          G046.IDG028,
                          G024.NMTRANSP || ' [' || G024.IDG024 || ']' AS IDG024,
                          G030.DSTIPVEI || ' [' || G030.IDG030 || ']' AS DSTIPVEI,
                          G030.IDG030,
                          G003DE.NMCIDADE AS NMCIDADE,
                          G003RE.NMCIDADE AS NMCIDARE,
                          G002DE.CDESTADO AS CDESTADE,
                          G002RE.CDESTADO AS CDESTARE,
                          G005DE.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) ||
                          ' - ' || G005DE.IECLIENT || ']' AS NMCLIEDE,
                          G005RE.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) ||
                          ' - ' || G005RE.IECLIENT || ']' AS NMCLIERE,
                          G048.QTDISTOD,

                          (SELECT SUM(VRDELIVE)
                            FROM G043 G043
                            JOIN G049 G049
                              ON G049.IDG043 = G043.IDG043
                            WHERE G049.IDG048 = G048.IDG048) AS VRDELIVE,
                            
                          (SELECT SUM(PSBRUTO)
                            FROM G043 G043
                            JOIN G049 G049
                              ON G049.IDG043 = G043.IDG043
                            WHERE G049.IDG048 = G048.IDG048) AS PSBRUTO,
                          
                          COUNT(G046.IDG046) OVER() AS COUNT_LINHA
                    FROM G046 G046
                    
                    JOIN G048 G048
                      ON G048.IDG046 = G046.IDG046
                  
                    INNER JOIN G005 G005DE
                      ON G005DE.IDG005 = G048.IDG005DE
                  
                    INNER JOIN G003 G003DE
                      ON G003DE.IDG003 = G005DE.IDG003
                  
                    INNER JOIN G002 G002DE
                      ON G002DE.IDG002 = G003DE.IDG002
                  
                    INNER JOIN G005 G005RE
                      ON G005RE.IDG005 = G048.IDG005OR
                  
                    INNER JOIN G003 G003RE
                      ON G003RE.IDG003 = G005RE.IDG003
                  
                    INNER JOIN G002 G002RE
                      ON G002RE.IDG002 = G003RE.IDG002
                  
                    JOIN G028 G028
                      ON G028.IDG028 = G046.IDG028
                  
                    LEFT JOIN G024 G024
                      ON G024.IDG024 = G046.IDG024
                  
                    LEFT JOIN G030 G030
                      ON G030.IDG030 = G046.IDG030

                ${sqlWhere} AND G046.TPMODCAR = 2
                `;
                
          let resultCount = await con.execute(
          {
            sql: ` select count(x.IDG046) as QTD from (`+ sql +`) x `,
            param: bindValues
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            return result[0];
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

          
          let result = await con.execute(	

            {sql:sql +
            sqlOrder +
            sqlPaginate,
          param: bindValues
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            if(result.length > 0){
              result[0].COUNT_LINHA = resultCount.QTD;
            }
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

      var id = req.body.IDG046;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G046.IDG046,
                      G046.DSCARGA,
                      G046.IDG031M1,
                      G046.IDG031M2,
                      G046.IDG031M3,
                      G046.IDG032V1,
                      G046.IDG032V2,
                      G046.IDG032V3,
                      G046.IDG024,
                      G046.CDVIAOTI,
                      G046.SNESCOLT,
                      G046.DTCARGA,
                      G046.DTSAICAR,
                      G046.DTPRESAI,
                      G046.PSCARGA,
                      G046.VRCARGA,
                      G046.IDS001,
                      G046.SNDELETE,
                      G046.QTVOLCAR,
                      G046.TPCARGA,
                      G046.QTDISPER,
                      G046.VRPOROCU,
                      G046.IDG030,
                      G046.DTAGENDA,
                      G046.STCARGA,
                      G046.STINTCLI,
                      G046.SNCARPAR,
                      G046.OBCANCEL,
                      G046.IDS001CA,
                      G046.DTCANCEL,
                      G046.IDG028,
                      G046.SNURGENT,
                      G046.TPORIGEM,
                      G046.DTCOLATU,
                      G046.DTCOLORI,
                      G046.STENVLOG,
                      G046.DTPSMANU,
                      G046.IDG034,
                      G046.STPROXIM,
                      G046.VRPERCAR,
                      G046.IDCARLOG,
                      G046.NRPLARE1,
                      G046.NRPLARE2,
                      G046.NRPLAVEI,
                      G046.SNMOBILE,
                      G046.TPTRANSP,
                      G046.DTINIVIA,
                      G046.DTFIMVIA,
                      G046.TPMODCAR,
                      COUNT(G046.IdG046) OVER () as COUNT_LINHA
                From G046 G046
                Where G046.IdG046   = : id
                  And G046.SnDelete = 0`,
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
