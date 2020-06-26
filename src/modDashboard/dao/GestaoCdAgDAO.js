/**
 * @description Possui os métodos responsaveis por alimentar gráficos do dassboard de Transferencia
 * @author Germano / Adryell
 * @since 01/10/2018
 *
*/

/**
 * @module dao/Gestao-de-CD
 * @description .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu = app.src.utils.DataAtual;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  var logger = app.config.logger;
  var xlsxj = require("xlsx-to-json");
  api.controller = app.config.ControllerBD;

  /**
   * @description Lista NOTAS EM TRANSITO.
   *
   * @async
   * @function api/emTransito
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.inOutGeral = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {
      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });

      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      let campo = 'PSBRUTO';

      if (req.body.valor) {
        campo = 'VRDELIVE';
      }
      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

      //logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: `
          SELECT
            COUNT(IDG043) TT_NOTAS,
            SUM(SOMA_TT_IN) TT_IN,
            SUM(SOMA_TT_OUT) TT_OUT

          FROM (

          SELECT
            G043.IDG043,
            CASE
              WHEN H006.TPMOVTO = 'C' THEN G043.${campo}
              ELSE 0
            END SOMA_TT_IN,
            CASE
              WHEN H006.TPMOVTO = 'D' THEN G043.${campo}
              ELSE 0
            END SOMA_TT_OUT
          FROM G043 G043

          INNER JOIN G052 G052 -- DELIVERIES x ETAPA
            ON G052.IDG043 = G043.IDG043
    
          INNER JOIN G051 G051 -- DELIVERIES x ETAPA
            ON G051.IDG051 = G052.IDG051
              
          INNER JOIN G049 -- DELIVERIES x ETAPA 
            ON G049.IDG051 = G051.IDG051

          INNER JOIN G048 -- ETAPAS
                ON G048.IDG048 = G049.IDG048

          INNER JOIN G046 -- CARGAS
              ON G046.IDG046 = G048.IDG046
              AND G046.SNDELETE = 0
              AND G046.STCARGA <> 'C'

           INNER JOIN H006 -- AGENDAMENTO
            ON H006.IDG046 = G046.IDG046
            AND H006.SNDELETE = 0

            INNER JOIN H008 H008--
            ON H008.IDH006 = H006.IDH006
            AND H008.SNDELETE = 0

          Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
          ${sqlWhere}
          ${sqlWhereAcl}
      

          )
          `,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (result[0]);
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
   * @description Lista NOTAS EM TRANSITO.
   *
   * @async
   * @function api/emTransito
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.inOutFiliais = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }


      let campo = 'PSBRUTO';

      if (req.body.valor) {
        campo = 'VRDELIVE';
      }
      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);

      //logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let query = `
      SELECT
        IDG028,
        NMARMAZE,
        COUNT(IDG043) TT_NOTAS,
        SUM(SOMA_TT_IN) TT_IN,
        SUM(SOMA_TT_OUT) TT_OUT

      FROM (

      SELECT
        G043.IDG043,
        G028.IDG028,
        G028.NMARMAZE,
        CASE
          WHEN H006.TPMOVTO = 'C' THEN G043.${campo}
          ELSE 0
        END SOMA_TT_IN,
        CASE
          WHEN H006.TPMOVTO = 'D' THEN G043.${campo}
          ELSE 0
        END SOMA_TT_OUT
      FROM G043 G043

      INNER JOIN G052 G052 -- DELIVERIES x ETAPA
        ON G052.IDG043 = G043.IDG043

      INNER JOIN G051 G051 -- DELIVERIES x ETAPA
        ON G051.IDG051 = G052.IDG051
          
      INNER JOIN G049 -- DELIVERIES x ETAPA 
        ON G049.IDG051 = G051.IDG051

      INNER JOIN G048 -- ETAPAS
            ON G048.IDG048 = G049.IDG048

      INNER JOIN G046 -- CARGAS
          ON G046.IDG046 = G048.IDG046
          AND G046.SNDELETE = 0
          AND G046.STCARGA <> 'C'

      INNER JOIN H006 -- AGENDAMENTO
        ON H006.IDG046 = G046.IDG046
        AND H006.SNDELETE = 0

      INNER JOIN H008 H008 --
        ON H008.IDH006 = H006.IDH006
        AND H008.SNDELETE = 0

      INNER JOIN G028 G028 -- ARMAZEM
        ON H006.IDG028 = G028.IDG028
      Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
      ${sqlWhere}
      ${sqlWhereAcl}
      )
      GROUP BY IDG028, NMARMAZE
      `;
      let result = await con.execute(
        {
          sql: query,
          param: bindValues
        })
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
      //closeRollback
    }

  };


  /**
* @description Busca o planejamento de PREVISTO/CONTRATADO DA semana atual.
*
* @async
* @function api/emTransito
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.planejamentoSemanalDetalhado = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G079',false);

      let result = await con.execute(
        {
          sql: `
            SELECT 
                DTREGIST,
                HOJE,
                SOMA_PREVISTO,
                SOMA_CONTRATADO,
                SUM(NRPSCONT) NRPSCONT,
                  SUM(NRPSPREV) NRPSPREV,
                  SUM(NRPSREAL) NRPSREAL
              FROM(
              SELECT
                        G079.IDG079,
                        G079.DTREGIST,
                        G079.NRPSCONT NRPSCONT,
                        G079.NRPSPREV NRPSPREV,
                        G079.NRPSREAL NRPSREAL,
                        TO_CHAR(sysdate, 'D') HOJE,
                        SUM(G079.NRPSCONT) OVER() SOMA_CONTRATADO,
                        SUM(G079.NRPSPREV) OVER() SOMA_PREVISTO

              FROM G079 G079
              Left Join G014 G014   On (G079.IDG014 = G014.IDG014)
              
              WHERE
                DTREGIST BETWEEN
                  (sysdate  - (TO_CHAR(sysdate, 'D')))
                    AND
                    (sysdate + (7-(TO_CHAR(sysdate, 'D'))))  AND G079.SNDELETE = 0
                 ${sqlWhereAcl}

              ORDER BY DTREGIST ASC
            ) GROUP BY DTREGIST,HOJE,SOMA_PREVISTO,SOMA_CONTRATADO
            ORDER BY DTREGIST ASC
                      `,
          param: []
        })
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
  /**
  * @description Busca o planejamento REALIZADO DA semana atual.
  *
  * @async
  * @function api/emTransito
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.planejamentoSemanalRealizado = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G079',false);

      let result = await con.execute(
        {
          sql: `
            SELECT SUM(SOMA_REALIZADA) PESOKG,
            DTMOVT
      
            FROM
              (
                SELECT DISTINCT
                  H006.IDH006,
                  TO_DATE(H007.HOINICIO,'DD/MM/YY') DTMOVT,
      
                  CASE
                    WHEN H006.TPMOVTO IN ('C','D') THEN H006.QTPESO
                    ELSE 0
                  END SOMA_REALIZADA
      
      
                FROM H006 H006
            
                
                  INNER JOIN (
                    SELECT H019.IDH006, H019.IDG005 AS IDG005 FROM H019 
                    INNER JOIN G022 G022 ON H019.IDG005 = G022.IDG005
                      Left Join G014 G014   On (G022.IDG014 = G014.IDG014) ${sqlWhereAcl}
                      GROUP BY H019.IDH006, H019.IDG005
                  ) H019 
              ON H019.IDH006 = H006.IDH006
                

              INNER JOIN (SELECT IDH006, MAX(HOFINAL) AS HOINICIO FROM H007 GROUP BY IDH006) H007 
              ON H007.IDH006 = H006.IDH006

            INNER JOIN G005 G005 
              ON H019.IDG005 = G005.IDG005
          
                  INNER JOIN H008 H008
                  ON H008.IDH006 = H006.IDH006
                  AND H008.SNDELETE = 0
                  AND H008.STAGENDA = 8
                  AND H007.HOINICIO BETWEEN
                  TO_DATE((sysdate  - (TO_CHAR(sysdate, 'D') - 1)))
                      AND
                      TO_DATE((sysdate + (7-(TO_CHAR(sysdate, 'D')))))
      
      
                  INNER JOIN G022 G022 
                    ON G005.IDG005 = G022.IDG005
     
                  Left Join G014 G014   
                    On (G022.IDG014 = G014.IDG014)  
                    
                 WHERE H006.SNDELETE = 0
                    ${sqlWhereAcl}
          )
              GROUP BY DTMOVT
              ORDER BY DTMOVT asc
                      `,
          param: []
        })
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





  /**
 * @description Busca o planejamento de PREVISTO/CONTRATADO Do MES atual.
 *
 * @async
 * @function api/emTransito
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.planejamentoMensalGeral = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G079',false);

      let result = await con.execute(
        {
          sql: `
                SELECT
                  G079.IDG079,
                  G079.DTREGIST,
                  G079.NRPSCONT,
                  G079.NRPSPREV,
                  G079.NRPSREAL,
                  EXTRACT(MONTH FROM G079.DTREGIST) MES_ATUAL,
                  SUM(G079.NRPSCONT) OVER() SOMA_CONTRATADO,
                  SUM(G079.NRPSPREV) OVER() SOMA_PREVISTO

                FROM G079
                Left Join G014 G014   On (G079.IDG014 = G014.IDG014)
                WHERE
                  EXTRACT(MONTH FROM G079.DTREGIST) = TO_CHAR(sysdate, 'mm')
                  AND
                    G079.SNDELETE = 0
                  ${sqlWhereAcl}
                ORDER BY DTREGIST ASC
                      `,
          param: []
        })
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
  /**
* @description Busca o planejamento de REALIZADO Do MES atual.
*
* @async
* @function api/emTransito
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.planejamentoMensalRealizado = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G079',false);

      let result = await con.execute(
        {
          sql: `
          SELECT SUM(SOMA_REALIZADA) PESOKG,
          DTMOVT

         FROM
           (
             SELECT
               H006.IDH006,
               EXTRACT(MONTH FROM H007.HOINICIO) DTMOVT,

               CASE
                 WHEN H006.TPMOVTO IN ('C','D') THEN H006.QTPESO
                 ELSE 0
               END SOMA_REALIZADA


             FROM H006 H006


               INNER JOIN H008 H008
                 ON H008.IDH006 = H006.IDH006
                 AND H008.SNDELETE = 0
                 AND H008.STAGENDA = 8
                 

               INNER JOIN (SELECT IDH006, MIN(IDG005) AS IDG005 FROM H019 GROUP BY IDH006) H019 
                 ON H019.IDH006 = H006.IDH006

              INNER JOIN (SELECT IDH006, MAX(HOFINAL) AS HOINICIO FROM H007 GROUP BY IDH006) H007 
              ON H007.IDH006 = H006.IDH006
              AND EXTRACT(MONTH FROM H007.HOINICIO) = TO_CHAR(sysdate, 'mm')
            
               INNER JOIN G005 G005 
                 ON H019.IDG005 = G005.IDG005

                 INNER JOIN G022 G022 
                 ON G005.IDG005 = G022.IDG005
  
               Left Join G014 G014   
                 On (G022.IDG014 = G014.IDG014)  
                 
              WHERE H006.SNDELETE = 0
                 ${sqlWhereAcl}
              
                )
                    GROUP BY DTMOVT
                    `,
          param: []
        })
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


  /**
     * @description Lista CARGAS DA GRID.
     *
     * @async
     * @function api/emTransito
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
  api.gestaoCdGrid = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {
      let sqlWhereAcl = await acl.montar({
        ids001: req.UserId,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }
      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'H006', true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      var hIn = req.body['parameter[H006_IN]'];
      var hOut = req.body['parameter[H006_OUT]'];
      var hInOut = req.body['parameter[H006_INOUT]'];
      var hType = bindValues.H006_TPMOVTO;

      var sql = `
        SELECT DISTINCT (H006.IDH006)
              , H006.QTPESO 
              , H006.TPMOVTO
              , H006.LSNOTAS AS H006_LSNOTAS
              , G005.NMCLIENT AS G005_NMCLIENT
              , G030.DSTIPVEI AS G030_DSTIPVEI
              , G046.IDG046   AS G046_IDG046
              , G028.IDG028
              , G028.NMARMAZE AS G028_NMARMAZE
              , G024.NMTRANSP AS G024_NMTRANSP
              , COUNT(H006.IDH006) OVER() as COUNT_LINHA,
              H006.STAGENDA
              FROM H006 H006
              
              INNER JOIN (
                SELECT H019.IDH006, H019.IDG005 AS IDG005 FROM H019 
                INNER JOIN G022 G022 ON H019.IDG005 = G022.IDG005
                  Left Join G014 G014   On (G022.IDG014 = G014.IDG014) ${sqlWhereAcl}
                  GROUP BY H019.IDH006, H019.IDG005
              ) H019 
                ON H019.IDH006 = H006.IDH006
                      
              INNER JOIN (SELECT IDH006, MAX(HOFINAL) AS HOINICIO FROM H007 GROUP BY IDH006) H007 
                ON H007.IDH006 = H006.IDH006
                      
              INNER JOIN G005 G005 
                ON H019.IDG005 = G005.IDG005
            
              INNER JOIN G022 G022 
                ON G005.IDG005 = G022.IDG005
        
              LEFT JOIN G014 G014   On (G022.IDG014 = G014.IDG014)  
            
            LEFT JOIN G028 G028 
              ON H006.IDG028 = G028.IDG028
                        
          LEFT JOIN G046
                  ON G046.IDG046 = H006.IDG046
                  
              LEFT JOIN G030
                ON H006.IDG030 = G030.IDG030
                AND G030.SNDELETE = 0
                
                
                
              LEFT JOIN H008 CHE
                  ON H006.IDH006 = CHE.IDH006
                  AND CHE.STAGENDA = 4
      
                LEFT JOIN H008 ENT
                  ON (H006.IDH006 = ENT.IDH006
                  AND ENT.STAGENDA = 5)
      
                LEFT JOIN H008 INI
                  ON (H006.IDH006 = ENT.IDH006
                  AND ENT.STAGENDA = 6)
      
                LEFT JOIN H008 FIN
                  ON (H006.IDH006 = FIN.IDH006
                  AND FIN.STAGENDA = 7)
      
                LEFT JOIN H008 SAI
                  ON (H006.IDH006 = SAI.IDH006
                  AND SAI.STAGENDA = 8)
                  
                LEFT JOIN G024
                  ON H006.IDG024 = G024.IDG024
                  AND G024.SNDELETE = 0
                        
            WHERE H006.SNDELETE = 0
              AND TO_CHAR(H007.HOINICIO, 'YYYY-MM-DD') = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
              ${sqlWhereAcl}
              ${hIn && 'AND H006.STAGENDA = 8'}
              ${hOut && 'AND H006.STAGENDA <> 8  AND (H007.HOINICIO < CURRENT_DATE)'}
              ${hInOut && 'AND H006.STAGENDA <> 8  AND (H007.HOINICIO >= CURRENT_DATE)'}
              ${hType && `AND H006.TPMOVTO = '${hType}'`}
              ${sqlOrder}  
              ${sqlPaginate}
      `;
      let result = await con.execute(
        {
          sql: sql,
          param: []
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
  * @description Busca o planejamento de REALIZADO Do MES atual.
  *
  * @async
  * @function api/emTransito
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.detailAgendamento = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }
      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H006',true);

      let result = await con.execute(
        {
          sql: `
           SELECT   IDG024,
            NMTRANSP,
            SUM(TT_SOMA_FALTOU) TT_FALTOU,
            SUM(TT_SOMA_PRAZO) TT_PRAZO,
            SUM(TT_SOMA_ATRASO) TT_ATRASO
          FROM (
            SELECT 
                  G024.IDG024,
                    G024.NMTRANSP,
                    H006.IDG046,

                    CASE
                    WHEN H006.STAGENDA = 9 THEN 1
                      ELSE 0
                  END TT_SOMA_FALTOU,

                  CASE
                    WHEN H008.HOOPERAC <= H007.HOINICIO THEN 1
                      ELSE 0
                  END TT_SOMA_PRAZO,

                  CASE
                    WHEN ((H006.STAGENDA NOT IN (8,9)) AND (H007.HOINICIO < CURRENT_DATE)) OR  
                    ((H006.STAGENDA IN (8)) AND H007.HOINICIO < H008.HOOPERAC)THEN 1
                      ELSE 0
                  END TT_SOMA_ATRASO

              FROM H006 H006
                  INNER JOIN (SELECT IDH006, MIN(IDG005) AS IDG005 FROM H019 GROUP BY IDH006) H019 
                    ON H019.IDH006 = H006.IDH006
                  
                  LEFT JOIN (SELECT MAX(IDH008) IDH008, HOOPERAC, STAGENDA, SNDELETE, IDH006 FROM H008 WHERE STAGENDA = 4 GROUP BY HOOPERAC, STAGENDA, SNDELETE, IDH006 ) H008
                    ON H008.IDH006 = H006.IDH006
                    AND H008.SNDELETE = 0

                  LEFT JOIN (SELECT MIN(IDH007) IDH007, MIN(HOINICIO) HOINICIO, SNDELETE, IDH006 FROM H007  GROUP BY  SNDELETE, IDH006 ) H007
                    ON H007.IDH006 = H006.IDH006
                    AND H007.SNDELETE = 0
                  
                  INNER JOIN G005 G005 
                    ON H019.IDG005 = G005.IDG005
            
                    
                      INNER JOIN G024 -- TRANSPORTADORA
                      ON G024.IDG024 = H006.IDG024
                      AND G024.SNDELETE = 0

                    
                      INNER JOIN G022 G022 
                      ON G005.IDG005 = G022.IDG005
     
                   Left Join G014 G014   On (G022.IDG014 = G014.IDG014)  

                      
                 WHERE H006.SNDELETE = 0
                 AND H008.HOOPERAC IS NOT NULL
                    ${sqlWhereAcl}
        
                  AND TO_CHAR(H007.HOINICIO, 'YYYY-MM-DD') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') -- DIA ATUAL
                  
                  GROUP BY
                    G024.IDG024,
                    G024.NMTRANSP,
                    H006.IDG046,
                    H008.HOOPERAC,
                    H006.STAGENDA,
                    H007.HOINICIO
                  
          )GROUP BY IDG024,NMTRANSP
          ORDER BY NMTRANSP ASC
                       `,
          param: []
        })
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

  // ##################################################
  // ##################################################
  // ####### ENDPOINTS OCUPAÇÃO/ARMAZENAGEM ###########
  // ##################################################
  // ##################################################


  /**
* @description Busca o planejamento de REALIZADO Do MES atual.
*
* @async
* @function api/emTransito
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.ocupacaoGeral = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      // var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G079',false);

      let result = await con.execute(
        {
          sql: `
              SELECT 
                  G080.IDG080
                
                , G080.DTOCUPAC
                , G080.IDG028
                , G080.IDG005 
                , G080.NRPESO
                , G080.QTKGLITR
                , G080.QTPALETE
                , G080.TPCDAG
              FROM G080 G080
              
            WHERE G080.DTOCUPAC = (select max(G080.DTOCUPAC) from G080) 
                        `,
          param: []
        })
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



  /**
* @description Lista NOTAS EM TRANSITO.
*
* @async
* @function api/emTransito
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.inOutGeralNovo = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'H006', true);

      //logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      var sql = `
          SELECT 
          SUM(QTPESO) QTPESO
        , SUM(NO_PRAZO) TT_PRAZO
        , SUM(ATRASO) TT_ATRASO
        , TPMOVTO
        , STAGENDA
        , IDG028
        , NMARMAZE 
                FROM (
                  SELECT DISTINCT
                  H006.IDH006, NVL(H006.QTPESO,0) AS QTPESO, H006.TPMOVTO,
                  HOINICIO,
                  G005.NMCLIENT AS G005_NMCLIENT,
                  CURRENT_DATE,
                         CASE WHEN H006.STAGENDA = 8 THEN 8 ELSE 3 END AS STAGENDA, 
                         
                         CASE 
                           WHEN H006.STAGENDA <> 8  AND (HOINICIO > CURRENT_DATE)
                           THEN H006.QTPESO 
                           ELSE 0 
                           END AS NO_PRAZO,
                         CASE 
                           WHEN H006.STAGENDA <> 8  AND (HOINICIO < CURRENT_DATE)
                           THEN H006.QTPESO 
                           ELSE 0 
                           END AS ATRASO,
                         G028.IDG028,
                         G028.NMARMAZE
                         FROM H006 H006
                         INNER JOIN (
                          SELECT H019.IDH006, H019.IDG005 AS IDG005 FROM H019 
                          INNER JOIN G022 G022 ON H019.IDG005 = G022.IDG005
                            Left Join G014 G014   On (G022.IDG014 = G014.IDG014) ${sqlWhereAcl}
                            GROUP BY H019.IDH006, H019.IDG005
                         ) H019 
                           ON H019.IDH006 = H006.IDH006
                         
                         INNER JOIN (SELECT IDH006, MAX(HOFINAL) AS HOINICIO FROM H007 GROUP BY IDH006) H007 
                           ON H007.IDH006 = H006.IDH006
                         
                         INNER JOIN G005 G005 
                           ON H019.IDG005 = G005.IDG005
               
                           INNER JOIN G022 G022 
                           ON G005.IDG005 = G022.IDG005
          
                        Left Join G014 G014   On (G022.IDG014 = G014.IDG014)  
               
                         INNER JOIN G028 G028 
                           ON H006.IDG028 = G028.IDG028
                           
                         ${sqlWhere}
                         ${sqlWhereAcl} 
                        AND TO_CHAR(H007.HOINICIO, 'YYYY-MM-DD') = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        
                         
                 ) GROUP BY 
                      TPMOVTO
                   , STAGENDA
                   , IDG028
                   , NMARMAZE                
            `;
      let result = await con.execute(
        {
          sql,
          param: bindValues
        })
        .then((result) => {

          return result;
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
 * @description Lista NOTAS EM TRANSITO.
 *
 * @async
 * @function api/emTransito
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.inOutGeralTotal = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }

      //var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);

      //logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      var sql = `
      SELECT 
          SUM(QTPESO) QTPESO
        , SUM(NO_PRAZO) TT_PRAZO
        , SUM(ATRASO) TT_ATRASO
        , TPMOVTO
        , STAGENDA
        , IDG028
        , NMARMAZE 
                FROM (
                  SELECT NVL(H006.QTPESO,0) AS QTPESO, H006.TPMOVTO,
                  HOINICIO,
                  CURRENT_DATE,
                         CASE WHEN H006.STAGENDA = 8 THEN 8 ELSE 3 END AS STAGENDA, 
                         
                         CASE 
                           WHEN H006.STAGENDA <> 8  AND (HOINICIO >= CURRENT_DATE)
                           THEN H006.QTPESO 
                           ELSE 0 
                           END AS NO_PRAZO,
                         CASE 
                           WHEN H006.STAGENDA <> 8  AND (HOINICIO < CURRENT_DATE)
                           THEN H006.QTPESO 
                           ELSE 0 
                           END AS ATRASO,
                         G028.IDG028,
                         G028.NMARMAZE
                         FROM H006 H006
                         INNER JOIN (SELECT IDH006, MIN(IDG005) AS IDG005 FROM H019 GROUP BY IDH006) H019 
                           ON H019.IDH006 = H006.IDH006
                         
                         INNER JOIN (SELECT IDH006, MAX(HOFINAL) AS HOINICIO FROM H007 GROUP BY IDH006) H007 
                           ON H007.IDH006 = H006.IDH006
                         
                         INNER JOIN G005 G005 
                           ON H019.IDG005 = G005.IDG005
               
                           INNER JOIN G022 G022 
                           ON G005.IDG005 = G022.IDG005
          
                        Left Join G014 G014   On (G022.IDG014 = G014.IDG014)  
               
                         INNER JOIN G028 G028 
                           ON H006.IDG028 = G028.IDG028
                           
                      WHERE H006.SNDELETE = 0
                         ${sqlWhereAcl} 
                        AND TO_CHAR(H007.HOINICIO, 'YYYY-MM-DD') = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        
                         
                 ) GROUP BY 
                      TPMOVTO
                   , STAGENDA
                   , IDG028
                   , NMARMAZE
        `;
      let result = await con.execute(
        {
          sql,
          param: []
        })
        .then((result) => {

          return result;
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
   * @description Listar dados da tabela G080.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarOcupacao = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {
      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if (typeof sqlWhereAcl == 'undefined') {
        sqlWhereAcl = '';
      }
      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G080', false);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let query = ` 
        SELECT
            IDG028
          , NMARMAZE
          , SUM(QTPALETE) QTPALLET
          , SUM(QTKGLITR) QTKGLITR
          , SUM(NRPESO) NRPESO
          , TPCDAG
        FROM (
        Select 
            G080.IDG080 
          , G028.IDG028
          , G080.DTOCUPAC
          , G005.IDG005
          , G080.NRPESO
          , G080.QTKGLITR
          , G080.QTPALETE
          , G080.TPCDAG
          , G028.NMARMAZE
          , G005.NMCLIENT
        FROM G080 G080
        INNER JOIN G028 G028
          ON G028.IDG028 = G080.IDG028
        INNER JOIN G005 G005
          ON G080.IDG005 = G005.IDG005
        INNER JOIN G022 G022 
            ON G005.IDG005 = G022.IDG005
          LEFT JOIN G014 G014   
            ON (G022.IDG014 = G014.IDG014)

            ${sqlWhere}
            ${sqlWhereAcl}
        ) GROUP BY IDG028,NMARMAZE, TPCDAG`;
      let result = await con.execute(
        {
          sql: query,
          param: []
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
* @description Listar dados da tabela G080.
*
* @async
* @function api/listar
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.atualizaArmazenagem = async function (sql, objConn) {

    logger.debug("Inicio listar");
    let con = objConn;

    try {
      logger.debug("Parametros recebidos:", sql);

      //var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G080', false);

      // logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: sql,
          param: []
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      return result;

    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  return api;
};
