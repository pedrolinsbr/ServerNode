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

			delete req.body['parameter[G024_IDG023][id]'];

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G046',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
        
      let	sql = `SELECT DISTINCT G024.NMTRANSP || '[' || G024.IDG024 || '-' ||
                    G024.IDLOGOS || ']' AS NMTRANSP,  
                    G031M1.NMMOTORI || '[' || G031M1.IDG031 || '-' ||
                    G031M1.NRMATRIC || ']' AS NMMOTORI1,
                    G031M1.CJMOTORI,
                    G032V1.DSVEICUL || '[' || G032V1.IDG032 || '-' ||
                    G032V1.NRFROTA || ']' AS DSVEICULV1,
                    G032V1.NRPLAVEI,
                    G032V1.IDS001GF || '[' || S001GF.IDS001 || ']' AS IDS001GF,
                    G024V.NMTRANSP || '[' || G024V.IDLOGOS || ']' AS NMTRANSPV,
                    G030.DSTIPVEI || '[' || G030.IDG030 || ']' AS DSTIPVEI,
                    G030.QTCAPPES,
                    
                    G046.DTCARGA,
                    G046.IDG046,
                    G046.DSCARGA,
                    G046.PSCARGA,
                    G046.VRCARGA,
                    G046.VRPOROCU,
                    G046.DTPRESAI,
                    G046.DTSAICAR,
                    G046.QTDISPER,
                    G046.QTDISBAS,
                    G046.QTVOLCAR,
                    G046.TPTRANSP,
                    G046.IDG031M1,
                    G046.IDG031M2,
                    G046.IDG031M3,
                    --G005.IDG005,
                    G046.TPMODCAR,
                    G046.STCARGA,

                    C06.QTDCTRC,
                    C07.QTDNOTA,
                    C08.QTDDELIVERY,
                    C09.QTDNOTAENTREGA

                    /* ------ */
                    /*
                    G046.IDG032V1,
                    G046.IDG032V2,
                    G046.IDG032V3,
                    G046.IDG024,
                    G046.CDVIAOTI,
                    G046.SNESCOLT,
                    G046.IDS001,
                    G046.SNDELETE,
                    G046.TPCARGA,
                    G046.DTAGENDA,
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
                    
                    G046.DTPSMANU,
                    G046.STPROXIM,
                    G046.IDG034,
                    G046.VRPERCAR,
                    G046.IDCARLOG,
                    
                    G046.CDVIATRA,
                    G046.DTINITRA,
                    G046.DTFIMTRA,
                    NVL(G046.DTCOLATU, G046.DTCOLORI) AS DTCOLETA,
                    C01.SNCRODOC,
                    C02.SNMANFES,
                    G046.SNMOBILE,
                    S001.NMUSUARI || ' [' || S001.IDS001 || ']' AS NMUSUARI,
                    G031M2.NMMOTORI AS NMMOTORI2,
                    G031M3.NMMOTORI AS NMMOTORI3,
                    G032V2.DSVEICUL AS DSVEICULV2,
                    G032V3.DSVEICUL AS DSVEICULV3,
                    C04.DESTINO,
                    C05.ORIGEM,
                    
                    '' AS QTDISTOT,
                    COUNT(G046.IDG046) OVER() AS COUNT_LINHA
                    */
                    /* ------ */

              FROM G046 G046
              LEFT JOIN G024 G024
              ON G024.IDG024 = G046.IDG024
              LEFT JOIN S001 S001
              ON S001.IDS001 = G046.IDS001
              LEFT JOIN G030 G030
              ON G030.IDG030 = G046.IDG030

              LEFT JOIN G028 G028
              ON G028.IDG028 = G046.IDG028

              LEFT JOIN G031 G031M1
              ON G031M1.IDG031 = G046.IDG031M1
              LEFT JOIN G031 G031M2
              ON G031M2.IDG031 = G046.IDG031M2
              LEFT JOIN G031 G031M3
              ON G031M3.IDG031 = G046.IDG031M3

              LEFT JOIN G032 G032V1
              ON G032V1.IDG032 = G046.IDG032V1
              LEFT JOIN G032 G032V2
              ON G032V2.IDG032 = G046.IDG032V2
              LEFT JOIN G032 G032V3
              ON G032V3.IDG032 = G046.IDG032V3

              LEFT JOIN G024 G024V
              ON G024V.IDG024 = G032V1.IDG024

              JOIN G048 G048
              ON G048.IDG046 = G046.IDG046
              JOIN G049 G049
              ON G049.IDG048 = G048.IDG048

              JOIN G005 G005
              ON (G005.IDG005 = G048.IDG005DE)

              LEFT JOIN G051 G051
              ON G051.IDG051 = G049.IDG051
              LEFT JOIN G052 G052
              ON G052.IDG051 = G051.IDG051
              LEFT JOIN G043 G043
              ON G043.IDG043 = G052.IDG043

              LEFT JOIN S001 S001GF
              ON G032V1.IDS001GF = S001GF.IDS001


              CROSS APPLY

              (SELECT NVL(SUM(IDG024), 0) AS SNCRODOC
              FROM G048 G048A
              WHERE G048A.IDG046 = G046.IDG046) C01

              CROSS APPLY

              (SELECT COUNT(F001X.IDF001) AS SNMANFES
              FROM F003 F003X
              INNER JOIN G046 G046X
              ON G046X.IDG046 = F003X.IDG046
              INNER JOIN F001 F001X
              ON F001X.IDF001 = F003X.IDF001
              WHERE F001X.STMDF NOT IN ('C', 'R')
              AND G046X.IDG046 = G046.IDG046) C02

              OUTER APPLY

              (SELECT NVL(G005DE.NRLATITU, G003DE.NRLATITU) || ',' ||
              NVL(G005DE.NRLONGIT, G003DE.NRLONGIT) AS DESTINO

              FROM G046 G046X

              JOIN G048 G048DE
              ON (G048DE.IDG046 = G046X.IDG046 AND
              G048DE.NRSEQETA =
              (SELECT MAX(G048DE_2.NRSEQETA)
                FROM G048 G048DE_2
                WHERE G048DE_2.IDG046 = G048DE.IDG046))

              JOIN G005 G005DE
              ON (G005DE.IDG005 = G048DE.IDG005DE)
              JOIN G003 G003DE
              ON (G003DE.IDG003 = G005DE.IDG003)

              WHERE G046X.IDG046 = G046.IDG046
              AND G046X.IDG024 IS NOT NULL

              ) C04

              OUTER APPLY

              (SELECT NVL(G003.NRLATITU, G003.NRLATITU) || ',' ||
              NVL(G003.NRLONGIT, G003.NRLONGIT) AS ORIGEM
              FROM G046 G046X
              JOIN G024 G024X
              ON G024X.IDG024 = G046X.IDG024
              JOIN G003 G003
              ON G003.IDG003 = G024X.IDG003
              WHERE G046X.IDG046 = G046.IDG046
              AND G046X.IDG024 IS NOT NULL

              ) C05

              OUTER APPLY

              (SELECT COUNT(*) AS QTDCTRC
                FROM (SELECT DISTINCT G051X.IDG051
                    FROM G046 G046X
                    JOIN G048 G048X
                      ON G048X.IDG046 = G046X.IDG046
                    JOIN G049 G049X
                      ON G049X.IDG048 = G048X.IDG048
                    JOIN G051 G051X
                      ON G051X.IDG051 = G049X.IDG051
                    WHERE G046X.IDG046 = G046.IDG046)) C06

              OUTER APPLY

              (SELECT COUNT(*) AS QTDNOTA
                FROM (SELECT DISTINCT G052X.IDG083
                    FROM G046 G046X
                    JOIN G048 G048X
                      ON G048X.IDG046 = G046X.IDG046
                    JOIN G049 G049X
                      ON G049X.IDG048 = G048X.IDG048
                    JOIN G051 G051X
                      ON G051X.IDG051 = G049X.IDG051
                    JOIN G052 G052X
                      ON G052X.IDG051 = G051X.IDG051
                    WHERE G046X.IDG046 = G046.IDG046)) C07

              OUTER APPLY

              (SELECT COUNT(*) AS QTDDELIVERY
                FROM (SELECT DISTINCT G049X.IDG043
                    FROM G046 G046X
                    JOIN G048 G048X
                      ON G048X.IDG046 = G046X.IDG046
                    JOIN G049 G049X
                      ON G049X.IDG048 = G048X.IDG048
                    WHERE G046X.IDG046 = G046.IDG046)) C08

              OUTER APPLY

              (SELECT COUNT(*) AS QTDNOTAENTREGA
                FROM (SELECT DISTINCT G049X.IDG043
                    FROM G046 G046X
                    JOIN G048 G048X
                      ON G048X.IDG046 = G046X.IDG046
                    JOIN G049 G049X
                      ON G049X.IDG048 = G048X.IDG048
                    JOIN G043 G043X
                      ON G043X.IDG043 = G049X.IDG043
                    WHERE G046X.IDG046 = G046.IDG046
                    AND G043X.DTENTREG IS NOT NULL)) C09

              ${sqlWhere}
              
              ORDER BY G046.IDG046 DESC
                  
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
            //return (utils.construirObjetoRetornoBD(result));
            return result;//É O QUE FAZ O EXCELSERVER FUNCIONAR!!!!!
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

        result = (utils.construirObjetoRetornoBD(result, req.body)); //É O QUE FAZ O EXCELSERVER FUNCIONAR!!!!!

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
