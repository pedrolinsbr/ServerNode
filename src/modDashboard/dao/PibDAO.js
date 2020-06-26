/**
 * @description Possui os métodos responsaveis por alimentar gráficos do dassboard de Transferencia
 * @author Germano / Adryell
 * @since 01/10/2018
 *
*/

/**
 * @module dao/Transferencia
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
  api.controller = app.config.ControllerBD;
  
  const gdao = app.src.modGlobal.dao.GenericDAO;
  const TPTRANSP = "'V','T'";
  /**
   * @description Lista.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.pibGeral = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

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
      if(typeof sqlWhereAcl == 'undefined'){
        sqlWhereAcl = '';
      }

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` 	
              SELECT 
                STETAPA, 
              
                CASE 
                  WHEN (STETAPA = 0) THEN 'BACKLOG'
                  WHEN (STETAPA = 1) THEN 'OTIMIZANDO'
                  WHEN (STETAPA = 2) THEN 'OFERECIMENTO'
                  WHEN (STETAPA = 3) THEN 'AGENDADO'
                  ELSE 'OUTRO'
                END DSETAPA,
                
                /** BACKLOG || OTIMIZANDO **/
                SUM(D0) TTD0,
                SUM(D1) TTD1,
                SUM(D2) TTD2,
                SUM(D3M) TTD3M,

                /** OFERECIMENTO **/
                SUM(H0) TTH0,
                SUM(H1) TTH1,
                SUM(AC) TTAC,
                SUM(RC) TTRC,

                /** AGENDADO **/
                SUM(AD0) TTAD0,
                SUM(AD1) TTAD1,
                SUM(AD2) TTAD2,
                SUM(AD3M) TTAD3M,


                SUM(TTVRDELI) TTVRDELI
              
              FROM (
              
                SELECT 
                  G043.IDG043,
                  G043.STETAPA,

                  /*** **** BACKLOG || OTIMIZANDO ***** ***/
                    CASE 
                      WHEN (ROUND((TRUNC(CURRENT_DATE) - G043.DTLANCTO), 0) <= 0) THEN 1 ELSE 0
                    END D0,
                    
                    CASE 
                      WHEN (ROUND((TRUNC(CURRENT_DATE) - G043.DTLANCTO), 0) = 1) THEN 1 ELSE 0
                    END D1,
                    
                    CASE 
                      WHEN (ROUND((TRUNC(CURRENT_DATE) - G043.DTLANCTO), 0) = 2) THEN 1 ELSE 0
                    END D2,
                    
                    CASE 
                      WHEN (ROUND((TRUNC(CURRENT_DATE) - G043.DTLANCTO), 0) >= 3) THEN 1 ELSE 0
                    END D3M,		
                  /*** **** **** ***** ***/

                  /*** **** OFERECIMENTO ***** ***/
                    CASE 
                      WHEN (24*(CURRENT_DATE - O005.DTOFEREC) < 2) AND O005.STOFEREC = 'O' THEN 1 ELSE 0
                    END H0,
                    CASE 
                      WHEN (24*(CURRENT_DATE - O005.DTOFEREC) > 2) AND O005.STOFEREC = 'O' THEN 1 ELSE 0
                    END H1,
                    CASE 
                      WHEN O005.STOFEREC = 'A' THEN 1 ELSE 0
                    END AC,
                    CASE 
                      WHEN O005.STOFEREC = 'X' THEN 1 ELSE 0
                    END RC,
                  /*** **** **** ***** ***/

                  /*** **** AGENDADO ***** ***/                 
                    CASE 
                      WHEN (ROUND(TRUNC(H007.HOINICIO) - TRUNC(CURRENT_DATE), 0) = 0) THEN 1 ELSE 0
                    END AD0,
                    
                    CASE 
                      WHEN (ROUND(TRUNC(H007.HOINICIO) - TRUNC(CURRENT_DATE), 0) = 1) THEN 1 ELSE 0
                    END AD1,
                    
                    CASE 
                      WHEN (ROUND(TRUNC(H007.HOINICIO) - TRUNC(CURRENT_DATE), 0) = 2) THEN 1 ELSE 0
                    END AD2,
                    
                    CASE 
                      WHEN (ROUND(TRUNC(H007.HOINICIO) - TRUNC(CURRENT_DATE), 0) >= 3) THEN 1 ELSE 0
                    END AD3M,
                  /*** **** **** ***** ***/

                
                  SUM(G043.VRDELIVE) TTVRDELI 
                
                FROM G043 
                
                Left Join G014 G014   On (G043.IDG014 = G014.IDG014)

                LEFT JOIN G049 G049 ON G049.IDG043 = G043.IDG043
                LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
                LEFT JOIN G046 G046 ON G046.IDG046 = G048.IDG046
                
                /******** OFERECIMENTO ********/
                LEFT JOIN O005 O005 ON O005.IDG046 = G046.IDG046 AND O005.STOFEREC IN ('O', 'A', 'X')

                /******** AGENDAMENTO ********/
                LEFT JOIN H006 H006 ON H006.IDG046 = G046.IDG046
                LEFT JOIN (SELECT IDH006, MIN(HOINICIO) AS HOINICIO FROM H007 GROUP BY IDH006) H007 ON H007.IDH006 = H006.IDH006
                
                ${sqlWhere}
                ${sqlWhereAcl}
                --AND G046.TPTRANSP IN (${TPTRANSP})
                  And TO_CHAR(G043.DTLANCTO,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
                  AND G043.STETAPA IN (0,1,2,3)
                  AND NVL(G046.STCARGA, 'A') <> 'C'
                GROUP BY 
                  G043.IDG043,
                  G043.STETAPA,
                  G043.DTLANCTO,
                  O005.DTOFEREC,
                  O005.STOFEREC,
                  H007.HOINICIO
              ) 
              
              GROUP BY STETAPA
              
              ORDER BY STETAPA`,
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

    }

  };

   /**
   * @description Listar um dados da tabela G047.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.pibQualidadeOfericimento = async function (req, res, next) {
    
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
        if(typeof sqlWhereAcl == 'undefined'){
          sqlWhereAcl = '';
        }

        logger.debug("Parametros recebidos:", req.body);
  
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
  
        logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
        let sql = ` 	
        SELECT
        COUNT(IDG046) TT_CARGAS,
        SUM(TT_PS_FTL) TT_PS_FTL,
        SUM(TT_PS_LTL) TT_PS_LTL,        
        SUM(SOMA_LTL) TT_LTL,
        SUM(SOMA_FTL) TT_FTL

        FROM (     
            SELECT DISTINCT 
              G046.IDG046 ,                  
              CASE
              WHEN G046.SNCARPAR = 'S'  THEN 1
              ELSE 0
            END SOMA_LTL,
            CASE
              WHEN G046.SNCARPAR = 'N'  THEN 1
              ELSE 0
            END SOMA_FTL,
            CASE 
            	WHEN G046.SNCARPAR = 'S' THEN G046.PSCARGA
            	ELSE 0 
            END TT_PS_LTL,
            CASE 
            	WHEN G046.SNCARPAR = 'N' THEN G046.PSCARGA
            	ELSE 0 
            END TT_PS_FTL
            FROM G046          
            
            INNER JOIN G048 G048 -- PARADAS
              ON G048.IDG046 = G046.IDG046
              
            INNER JOIN G049 G049
              ON G049.IDG048 = G048.IDG048            
              
            INNER JOIN G043 G043
              ON G049.IDG043 = G043.IDG043

            Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
              
            ${sqlWhere}
            ${sqlWhereAcl}
            AND G046.TPTRANSP IN (${TPTRANSP})
            AND G046.TPTRANSP IN ('V', 'T')
            AND TO_CHAR(G046.DTCARGA,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')                          
          )                
          `;
        let result = await con.execute(
          {
            sql,
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
  
      }
  
    };



    /**
   * @description Listar um dados da tabela G047.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.pibTipoVeiculo = async function (req, res, next) {
    
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
        if(typeof sqlWhereAcl == 'undefined'){
          sqlWhereAcl = '';
        }

        logger.debug("Parametros recebidos:", req.body);
  
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
  
        logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
  
        let result = await con.execute(
          {
            sql: ` 	
              SELECT
              COUNT(IDG046) TT_CARGAS,
              IDG030,
              DSTIPVEI,
              SUM(PSCARGA) TT_PESO,
              SUM(QTCAPPES) TT_CAPACIDADE
  
              FROM (     
                  SELECT DISTINCT 
                      G046.IDG046,
                      G046.PSCARGA,
                      G030.IDG030,
                      G030.DSTIPVEI,
              	      G030.QTCAPPES
                  
                  FROM G046
                  
                  INNER JOIN G030 G030 -- TIPO VEÍCULO
                    ON G046.IDG030 = G030.IDG030
                    
                  INNER JOIN G048 G048 -- PARADAS
                    ON G048.IDG046 = G046.IDG046
                    
                  INNER JOIN G049 G049
                    ON G049.IDG048 = G048.IDG048            
                    
                  INNER JOIN G043 G043 -- NF || DELIVERY
                    ON G049.IDG043 = G043.IDG043
                  
                  Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
                  
                  ${sqlWhere}
                  ${sqlWhereAcl}
                  AND G046.TPTRANSP IN (${TPTRANSP})
                  AND G046.SNCARPAR = 'N'
                  And TO_CHAR(G046.DTCARGA,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
                  --AND G046.SNCARPAR = 'N'
                )  
                GROUP BY 
                  IDG030,
                  DSTIPVEI
                ORDER BY TT_CARGAS DESC
                    
                `,
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
  
      }
  
    };

    /**
   * @description Listar .
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.pibTransportadora = async function (req, res, next) {
    
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
        if(typeof sqlWhereAcl == 'undefined'){
          sqlWhereAcl = '';
        }

        logger.debug("Parametros recebidos:", req.body);
  
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
  
        logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
  
        let result = await con.execute(
          {
            sql: ` 	
              SELECT
              IDG024,
              NMTRANSP,
              SUM(SOMA_RECUSA) TT_RECUSA,
              SUM(SOMA_ACEITA) TT_ACEITA
                  FROM (
                      SELECT DISTINCT
                          G046.IDG046,
                          G024.IDG024,
                          G024.NMTRANSP,

                          CASE
                            WHEN O005.STOFEREC = 'X'  THEN 1
                            ELSE 0
                          END SOMA_RECUSA,
                          CASE
                            WHEN O005.STOFEREC = 'A'  THEN 1
                            ELSE 0
                          END SOMA_ACEITA

                      FROM G046

                      INNER JOIN G048
                        ON G048.IDG046 = G046.IDG046

                      INNER JOIN G049
                        ON G049.IDG048 = G048.IDG048

                      INNER JOIN G043
                        ON G049.IDG043 = G043.IDG043

                      INNER JOIN O005
                        ON O005.IDG046 = G046.IDG046

                      INNER JOIN G024
                        ON G024.IDG024 = O005.IDG024

                      LEFT JOIN G014
                        ON (G043.IDG014 = G014.IDG014)

                      ${sqlWhere}
                      ${sqlWhereAcl}
                      And TO_CHAR(G046.DTCARGA,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
                      AND O005.STOFEREC IN ('X', 'A')
                    )  
                    GROUP BY 
                      IDG024,
                      NMTRANSP
                `,
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
  
      }
  
    };


  api.gridPib = async function (req, res, next) {
   
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
            if(typeof sqlWhereAcl == 'undefined'){
              sqlWhereAcl = '';
            }
          
          let sqlComplement = '';
          logger.debug("Parametros recebidos:", req.body);
          if(req.body['parameter[SQLCOMPLEMENT]'] != ''){
            sqlComplement = req.body['parameter[SQLCOMPLEMENT]'];
            delete req.body['parameter[SQLCOMPLEMENT]'];
          }
          var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G043',true);
          
          logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

          let result = await con.execute(
            {
              sql: `  

                SELECT 
                      G043.IDG043,
                      G043.NRNOTA,
                      G043.CDDELIVE,
                      G043.STETAPA,
                      G014.DSOPERAC AS G014_DSOPERAC,
                      G043.TPDELIVE,
                      G005RE.NMCLIENT AS NMCLIENTRE,
                      G005DE.NMCLIENT AS NMCLIENTDE,
                      UPPER(G003DE.NMCIDADE) || ' / ' || G002DE.CDESTADO AS G003DE_NMCIDADE,
                      G043.DTLANCTO,
                      O005.DTOFEREC AS O005_DTOFEREC,
                      H007.HOINICIO AS H007_HOINICIO,
                      COUNT(G043.IDG043) OVER() COUNT_LINHA
                FROM G043 
                
                Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
                      
                INNER JOIN G005 G005RE 
                ON G005RE.IDG005 = G043.IDG005RE
                --AND G043.TPDELIVE IN ('1', '2', '3', '4', '5')
                --AND G043.CDDELIVE IS NOT NULL
                
              INNER JOIN G005 G005DE 
                ON G005DE.IDG005 = G043.IDG005DE
                
              INNER JOIN G003 G003DE
                ON G003DE.IDG003 = G005DE.IDG003
                AND G003DE.SNDELETE = 0

              INNER JOIN G002 G002DE ON
                G003DE.IDG002 = G002DE.IDG002
                AND G003DE.SNDELETE = 0

                LEFT JOIN G049 G049 ON G049.IDG043 = G043.IDG043
                LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
                LEFT JOIN G046 G046 ON G046.IDG046 = G048.IDG046  
                LEFT JOIN O005 O005 ON O005.IDG046 = G046.IDG046 AND O005.STOFEREC IN ('O', 'A', 'X')

                /******** AGENDAMENTO ********/
                LEFT JOIN H006 H006 ON H006.IDG046 = G046.IDG046
                LEFT JOIN (SELECT IDH006, MIN(HOINICIO) AS HOINICIO FROM H007 GROUP BY IDH006) H007 ON H007.IDH006 = H006.IDH006
              
                ${sqlWhere} 
                ${sqlWhereAcl}
                ${sqlComplement}
                AND G046.TPTRANSP IN (${TPTRANSP})
               And TO_CHAR(G043.DTLANCTO,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
               AND G043.STETAPA IN (0,1,2,3)
               AND (H006.STAGENDA NOT IN (9,10) OR H006.STAGENDA IS NULL)
               AND NVL(G046.STCARGA, 'A') <> 'C'

               AND (H006.STAGENDA NOT IN (9,10) OR H006.STAGENDA IS NULL)
               AND NVL(G046.STCARGA, 'A') <> 'C'

                ${sqlOrder} ${sqlPaginate}
              `,
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

//*-=-=-=-=-=- NOVOS SQLS -=-=-=-=--==-=-=-=-=-==-=

 api.buscarPib = async function (req, res, next) {

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

  await this.controller.setConnection(req.objConn);

  req.sql = `
            SELECT
                G043.IDG043
              , G043.NRNOTA
              , G043.CDDELIVE
              , G043.STETAPA
              , G014.DSOPERAC AS G014_DSOPERAC
              , G043.TPDELIVE
              , G043.VRDELIVE
              , G043.PSBRUTO
              , G043.DTVENROT
              , G005RE.NMCLIENT AS NMCLIENTRE
              , G005DE.NMCLIENT AS NMCLIENTDE
              , UPPER(G003DE.NMCIDADE) || ' / ' || G002DE.CDESTADO AS G003DE_NMCIDADE
              , G043.DTLANCTO
              , G046.STCARGA
              , MIN(H007.HOINICIO) as DTAGENDAMENTO

              FROM G043 

              INNER JOIN G014 
              ON G014.IDG014 = G043.IDG014

              INNER JOIN G005 G005RE 
              ON G005RE.IDG005 = G043.IDG005RE

              INNER JOIN G005 G005DE 
              ON G005DE.IDG005 = G043.IDG005DE

              INNER JOIN G003 G003DE
              ON G003DE.IDG003 = G005DE.IDG003
              AND G003DE.SNDELETE = 0

              INNER JOIN G002 G002DE ON
              G003DE.IDG002 = G002DE.IDG002
              AND G003DE.SNDELETE = 0

              /*JUNÇÃO DE CARGA*/
              LEFT JOIN G049 G049 ON G049.IDG043 = G043.IDG043 
              LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
              LEFT JOIN G046 G046 ON G046.IDG046 = G048.IDG046  
              /*=-=-=-=-=-=-=-=-=*/

              --LEFT JOIN O005 ON O005.IDG046 = G046.IDG046
              
              /*JUNÇÃO AGENDAMENTO*/
              LEFT JOIN H024 ON H024.IDG046 = G046.IDG046 AND H024.SNDELETE = 0
              LEFT JOIN H006 ON H006.IDH006 = H024.IDH006 AND H006.SNDELETE = 0
              LEFT JOIN H007 ON H007.IDH006 = H006.IDH006 AND H007.SNDELETE = 0
              
              WHERE G043.SNDELETE = 0 
              ${sqlWhereAcl}
              And TO_CHAR(G043.DTLANCTO,'MM/YYYY') =  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
              ${req.body.aux}
              AND G043.TPDELIVE IN (1,2,3,4,5)
              AND G014.SN4PL = 1 -- CHKRDC

              GROUP BY
              G043.IDG043
              , G043.NRNOTA
              , G043.CDDELIVE
              , G043.STETAPA
              , G014.DSOPERAC
              , G043.TPDELIVE
              , G005RE.NMCLIENT
              , G005DE.NMCLIENT
              , G043.DTLANCTO
              , G043.DTVENROT
              , G003DE.NMCIDADE
              , G002DE.CDESTADO
              , G043.VRDELIVE
              , G043.PSBRUTO
              , G046.STCARGA

              Order by G043.IDG043 DESC
        `;
              
  return await gdao.executar(req, res, next).catch((err) => { throw err });
};

  return api;
};
