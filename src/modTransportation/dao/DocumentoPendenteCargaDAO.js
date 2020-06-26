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

      // delete req.body['parameter[G024_IDG023][id]'];
      // delete req.body['[G046_SNDELETE]'];
       

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G046',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
        
      let	sql = `  SELECT TEMP.*
      FROM (SELECT DISTINCT G046.IDG046,
                            G046.DSCARGA,
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
                            G046.SNURGENT,
                            G046.IDG028,
                            G028.NMARMAZE || ' [' || G046.IDG028 || ']' AS NMARMAZE,
                            G046.DTCOLORI,
                            G046.DTCOLATU,
                            G046.TPORIGEM,
                            G046.STENVLOG,
                            S001.NMUSUARI || ' [' || S001.IDS001 || ']' AS NMUSUARI,
                            G030.DSTIPVEI || ' [' || G030.IDG030 || ']' AS DSTIPVEI,
                            G046.DTPSMANU,
                            G046.STPROXIM,
                            G046.IDG034,
                            G046.VRPERCAR,
                            G046.IDCARLOG,
                            G046.TPMODCAR,
                            G046.TPTRANSP,
                            G046.CDVIATRA,
                            G046.DTINITRA,
                            G046.DTFIMTRA,
                            NVL(G046.DTCOLATU, G046.DTCOLORI) AS DTCOLETA,
                            G024.NMTRANSP || ' [' || G024.IDG024 ||
                            G024.IDLOGOS || ']' AS NMTRANSP,
                            G046.SNMOBILE,
                            G046.QTDISBAS,
                            G049.IDG043,
                            G049.IDG051,
                            G051.CDCTRC,
                            G051.DTLANCTO,
                            G043.CDDELIVE,
                            G024CT.NMTRANSP || ' [' || G024CT.IDG024 ||
                            G024CT.IDLOGOS || ']' AS NMTRANSPCT,
                            
                            (SELECT COUNT(G043X.IDG043) AS QTDD
                               FROM G043 G043X
                               JOIN G049 G049X
                                 ON G049X.IDG043 = G043X.IDG043
                               LEFT JOIN G051 G051X
                                 ON G051X.IDG051 = G049X.IDG051
                               JOIN G048 G048X
                                 ON G049X.IDG048 = G048X.IDG048
                              WHERE G048X.IDG046 = G046.IDG046) AS QTDD,
                            
                            (SELECT COUNT(G043Y.IDG043) AS QTDD
                               FROM G043 G043Y
                               JOIN G049 G049Y
                                 ON G049Y.IDG043 = G043Y.IDG043
                               JOIN G051 G051Y
                                 ON G051Y.IDG051 = G049Y.IDG051
                               JOIN G048 G048Y
                                 ON G049Y.IDG048 = G048Y.IDG048
                              WHERE G048Y.IDG046 = G046.IDG046) AS QTDC
            
              FROM G046 G046
            
              JOIN G024 G024
                ON G024.IDG024 = G046.IDG024

            
              JOIN S001 S001
                ON S001.IDS001 = G046.IDS001
            
              JOIN G030 G030
                ON G030.IDG030 = G046.IDG030
            
              JOIN G028 G028
                ON G028.IDG028 = G046.IDG028
            
              JOIN G048 G048
                ON G048.IDG046 = G046.IDG046
            
              JOIN G049 G049
                ON G049.IDG048 = G048.IDG048

              JOIN G043 G043
                ON G043.IDG043 = G049.IDG043

              LEFT JOIN G051 G051
                ON G051.IDG051 = G049.IDG051

              LEFT JOIN G024 G024CT
                ON G024CT.IDG024 = g051.IDG024
            
                ${sqlWhere} AND G046.TPMODCAR <> 1
               AND G046.STCARGA IN ('S', 'T', 'D')) TEMP
    
              
              WHERE TEMP.QTDD <> TEMP.QTDC 
              
              ORDER BY TEMP.IDG046 DESC
    
                  
                `;
                
          let resultCount = await con.execute(
          {
            sql: ` select count(*) as QTD from (`+ sql +`) x `,
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
            //sqlOrder +
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


  

  return api;
};
