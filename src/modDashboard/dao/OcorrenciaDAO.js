module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  var logger = app.config.logger;
  api.controller = app.config.ControllerBD;
  const gdao = app.src.modGlobal.dao.GenericDAO;

  // ---------------------------------------------------------------------- NEW ------------------------------------------------------------------------------------ //

  // BUSCA DADAOS GERAIS PARA MONTAR A TELA DE OCORRENCIA
  api.getOcorrencias = async function (req, res, next) {

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
    SELECT DISTINCT 
      A001.IDA001, 
      A001.DTREGIST, 
      A001.DTFIM, 
      A002.IDA002,
      A002.DSTPMOTI,
      A008.IDA008, 
      A008.DSACAO, 
      S001.NMUSUARI,
      A006.DSSITUAC, 
      G005DE.NMCLIENT,
      G014.DSOPERAC, 
      G014.IDG014, 
      G051.CDCTRC, 
      G051.IDG051, 
      G024.NMTRANSP,
      (SELECT LISTAGG(G043.NRNOTA, ', ') WITHIN GROUP(ORDER BY G043.NRNOTA)
      FROM G052 G052
      JOIN G043 G043
        ON (G052.IDG043 = G043.IDG043) WHERE G052.IDG051 = G051.IDG051) AS NRNFE, 
      G043.DTBLOQUE,
      G043.DTDESBLO,
      G043.DTEMINOT,
      CASE /* Verifico se o retorno da quantidade de horas retornadas é 0, Porque 0 * 24 sempre será zero, então precisava realizar o cálculo diferente. */
              WHEN Trunc(Nvl(A001.DTFIM, CURRENT_DATE) - 
                        Add_Months(A001.DTREGIST, 
                                    Months_Between(Nvl(A001.DTFIM, CURRENT_DATE), 
                                                  A001.DTREGIST))) = 0 THEN 
              /* Se for 0, cálculo as horas dessa forma: */ 
              Lpad(Trunc(24 * 
                          MOD(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1)), 
                    2, 
                    0) || ':' || /* Concatena os Minutos */ 
              Lpad(Trunc(MOD(MOD(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 
                                  1) * 24, 
                              1) * 60), 
                    2, 
                    0) || ':' || /* Concatena os Segundos */ 
              Lpad(MOD(MOD(MOD(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24, 
                            1) * 60, 
                        1) * 60, 
                    2, 
                    0) 
              ELSE /* Se não for 0 o retorno da quantidade de horas ( No caso, quando der mais de um dia ) */
              /* Faço cálculo das horas abaixo:  */ 
              Lpad(Trunc(Nvl(A001.DTFIM, CURRENT_DATE) - 
                          Add_Months(A001.DTREGIST, 
                                    Months_Between(Nvl(A001.DTFIM, CURRENT_DATE), 
                                                    A001.DTREGIST))) * 24, 
                    2, 
                    0) || ':' || /* Concateno os minutos  */ 
              Lpad(Trunc(MOD(MOD(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 
                                  1) * 24, 
                              1) * 60), 
                    2, 
                    0) || ':' || /* Concateno os segundos  */ 
              Lpad(MOD(MOD(MOD(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24, 
                            1) * 60, 
                        1) * 60, 
                    2, 
                    0) 
            END AS TEMPO /* Fim do Tempo  */ 
  
        FROM A001 A001 /* Atendimentos  */ 

          JOIN S001 S001 /* Usuários  */
          ON (S001.IDS001 = A001.IDSOLIDO)

          JOIN A002 A002 /* Motivos do atendimento  */ 
            ON (A002.IDA002 = A001.IDA002) 
            
          JOIN A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento )  */ 
            ON (A002.IDA008 = A008.IDA008) 
            
          JOIN A005 A005 /* Tabela que une um atendimento (A001) a uma NF-e (G043)  */ 
            ON (A005.IDA001 = A001.IDA001) 
            
          JOIN G043 G043 /* NF-e  */ 
            ON (A005.IDG043 = G043.IDG043) 
            
          LEFT JOIN G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051)  */ 
            ON (A005.IDG043 = G052.IDG043) 
            
          LEFT JOIN G051 G051 /* Conhecimento do Transporte  */ 
            ON (G051.IDG051 = G052.IDG051) 

          LEFT JOIN G005 G005DE 
            ON (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE)) -- DESTINATARIO
            
          LEFT JOIN G049 G049 
            ON (G049.IDG043 = G043.IDG043) 
            
          LEFT JOIN G048 G048 
            ON (G049.IDG048 = G048.IDG048) 
            
          LEFT JOIN G046 G046 
            ON (G048.IDG046 = G046.IDG046) 
            
          JOIN A003 A003 
            ON (A003.IDA001 = A001.IDA001 AND A003.IDA003 = 
                            (SELECT Max(A003_2.IDA003) 
                                FROM A003 A003_2 
                              WHERE A003_2.IDA001 = A003.IDA001)) 
                              
          JOIN A006 A006 
            ON (A006.IDA006 = A003.IDA006) 
            
          LEFT JOIN G022 G022 
                    ON (G022.IDG005 = G051.IDG005CO) 
                LEFT JOIN G014 G014 
            ON (G014.IDG014 = G022.IDG014) 
            
          LEFT JOIN G024 G024 
            ON (G024.IdG024 = G051.IdG024) 

          LEFT JOIN G014 G014 ON (G043.IDG014 = G014.IDG014) -- OPERAÇÃO 
                
          WHERE G043.SNDELETE = 0 
          AND A001.SNDELETE = 0 
          AND G022.SNDELETE = 0
          AND A008.IDA008 = 2 
          AND G022.SNINDUST = 1 
          ${req.body.auxDTREGIST}
          ${req.body.auxIDG014}
          ${sqlWhereAcl} 

          GROUP BY 
            A001.IDA001,
            A001.DTREGIST, 
            A001.DTFIM, 
            S001.NMUSUARI,
            A002.IDA002,
            A002.DSTPMOTI,             
            A008.IDA008,
            A008.DSACAO,           
            A006.DSSITUAC, 
            G005DE.NMCLIENT,              
            G043.DTBLOQUE,
            G043.DTDESBLO,
            G043.DTEMINOT,             
            G014.DSOPERAC,
            G014.IDG014,               
            G051.CDCTRC,
            G051.IDG051,
            G024.NMTRANSP`
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  // BUSCA A QUANTIDADE TOTAL DE NOTAS ENTREGUES NO MES CORRENTE
  api.contarEntregues = async function (req, res, next) {

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
            SELECT COUNT(*) TOTAL FROM (
              SELECT * FROM G043 
              
                INNER JOIN G052 G052 ON (G052.IDG043 = G043.IDG043)
                
                INNER JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)
                
                LEFT JOIN G046 ON G046.IDG046 = G051.IDG046 AND G046.SNDELETE = 0 

                LEFT JOIN  G014 G014 ON (G043.IDG014 = G014.IDG014)
              
                WHERE DTENTREG IS NOT NULL
                AND G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND G051.TPTRANSP = 'V'
                AND G043.SNDELETE = 0
                ${req.body.auxDTENTREG}
                ${req.body.auxIDG014}
                ${sqlWhereAcl})`
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  // FAZ A BUSCA GERAL QUE PREENCHERA O NPS 
  api.getNps = async function (req, res, next) {

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
          G061.IDG061, 
          G061.NRNOTA NOTA, 
          G061.DSCOMENT,
          G061.DTAVALIA,
          G061.DTENVIO,
          G061.DTRESPOS,
          G061.STAVALIA,
          G051.IDG051,
          G051.CDCTRC,
          G043.IDG043,
          G043.NRNOTA NOTAFISCAL,
          G043.DTEMINOT,
          G005.NMCLIENT As G005_NMCLIENT,
          G005CO.NMCLIENT AS G005CO_NMCLIENT,
          G005.TPPESSOA, 
          G002.CDESTADO

        FROM G051 G051

          INNER JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)

          INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)

          LEFT JOIN G005 G005CO ON (G005CO.IDG005 = G051.IDG005CO)

          INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003) 

          INNER JOIN G002 G002 ON (G003.IDG002 = G002.IDG002)

          INNER JOIN G052 G052 ON (G052.IDG051 = G051.IDG051)
          
          INNER JOIN G043 G043 ON (G052.IDG043 = G043.IDG043)
          
          LEFT JOIN  G014 G014 ON (G043.IDG014 = G014.IDG014)
        
          WHERE G051.SNDELETE = 0
          AND G043.SNDELETE = 0
          AND G061.DTAVALIA IS NOT NULL
          ${req.body.auxDTAVALIA}    
          ${req.body.auxDTENVIO}        
          ${req.body.auxIDG014}
          ${sqlWhereAcl}`

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  };

  api.getNpsCte = async function (req, res, next) {

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

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G061', false);

      let result = await con.execute(
        {
          sql: `      
          SELECT G061.NRNOTA, G061.DSCOMENT 
          FROM G061 G061
            INNER JOIN G051 G051
              ON G051.IDG051 = G061.IDG051
            
            INNER JOIN G052 G052 
              ON (G052.IDG051 = G051.IDG051)
            INNER JOIN G043 G043 
              ON (G052.IDG043 = G043.IDG043)
            LEFT JOIN  G014 G014 
              ON (G043.IDG014 = G014.IDG014)
          
            ${sqlWhere}
            AND G061.DTAVALIA IS NOT NULL
            AND TO_CHAR(G061.DTAVALIA,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')                
            ${sqlWhereAcl}
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

  // -------------------------------------------------------------------------------------------------------------------------------------------------------------- //

  return api;
};
