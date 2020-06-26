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
  var moment = require('moment');

  var SNAG = `And G043.SNAG IS NULL 
              AND G043.TPDELIVE <> 5`;

  var dtEmiNotAnoAtual = `And TO_CHAR(G043.DTEMINOT,'YYYY') =  TO_CHAR(CURRENT_DATE, 'YYYY')`;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  api.timeLineNf = async function (req, res, next) {

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

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);
      var aux = sqlWhere.indexOf('DTEMINOT');
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: `  
              SELECT 			  
                  G043.IDG043
                , G043.NRNOTA
                , G043.DTEMINOT
                , G051.DTCOLETA AS DTSAICAR
                , G043.DTENTREG
                ,'' AS DTCOLATU
                , G051.DTEMICTR
                , Case 
                When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
                    To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
                  When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
                    Case 
                      When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
                      To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
                      Else
                      'n.i.'
                    End
                  Else
                  'n.i.'
              End As DTPREVISTA /* Data de Previsão de Entrega */
                FROM G043 G043 -- DELIVERIES
                Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)
                Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)

                Left Join G014 G014   On (G043.IDG014 = G014.IDG014)

                WHERE
                G043.SNDELETE = 0
                AND NOT EXISTS (SELECT 
                  G058.IDG005RE
                ,  G058.IDG005DE
                        FROM G058
                        WHERE G058.IDG005DE = G043.IDG005DE
                        AND G058.IDG005RE = G043.IDG005RE)
                And G043.NRNOTA = ${req.body.NRNOTA}
                ${sqlWhereAcl}
                AND TO_CHAR(G043.DTEMINOT,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                
                And G051.SnDelete = 0 
                And G051.StCtrc = 'A'
                --AND G043.DTEMINOT IS NOT NULL
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

  api.crossDockingTransferencia = async function (req, res, next) {

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

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);
      var aux = sqlWhere.indexOf('DTEMINOT');
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: `  
                SELECT
                  IDG003DE,
                    NMCIDADEDE,                    
                    IDG003OR,
                    NMCIDADEOR,
                    IDTRANSP,
                    NMTRANSP,
                    IDG014,
                    COUNT(IDG043) TT_NOTAS
                    

                  FROM (
                    SELECT DISTINCT 
                        G046.IDG046
                      , G003.NMCIDADE   AS NMCIDADEDE                     
                      , G003.IDG003     AS IDG003DE
                      , G003OR.NMCIDADE AS NMCIDADEOR
                      , G003OR.IDG003   AS IDG003OR
                      , G043.IDG043
                      , G024.IDG024    AS IDTRANSP
                      , G024.NMTRANSP  AS NMTRANSP
                      , G014.IDG014    AS IDG014
                      /*
                      , G028.IDG028    AS IDARMAZEM
                      , G028.NMARMAZE  AS NMARMAZEM
                      */

                    FROM G043 -- DELIVERIES

                    Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)
                    Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)

                    Left Join G014 G014   On (G043.IDG014 = G014.IDG014)
                      
                    INNER JOIN G005 G005RE -- REMETENTE
                      ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
                      AND G005RE.SNDELETE = 0
                      
                    INNER JOIN G003 G003OR-- CIDADE ORIGEM
                      ON G003OR.IDG003 = G005RE.IDG003
                      AND G003OR.SNDELETE = 0
                      
                    INNER JOIN G002 G002OR -- UF ORIGEM
                      ON G002OR.IDG002 = G003OR.IDG002 
                      AND G002OR.SNDELETE = 0
                      
                      
                      INNER JOIN G005 -- DESTINATÁRIO
                      ON (G005.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
                      AND G005.SNDELETE = 0
                      
                    INNER JOIN G003 -- CIDADE DESTINO
                      ON G003.IDG003 = G005.IDG003
                      AND G003.SNDELETE = 0
                      
                    INNER JOIN G002 -- UF DESTINO
                      ON G002.IDG002 = G003.IDG002 
                      AND G002.SNDELETE = 0
                      
                      
                      
                      INNER JOIN G046 -- CARGA
                      ON G046.IDG046 = G051.IDG046
                      AND G046.SNDELETE = 0
                      
                      INNER JOIN G048 -- PARADA
                      ON G048.IDG046 = G046.IDG046
                      AND G048.IDG024 IS NOT NULL


                      INNER JOIN G024 -- FILIAL?? || VIROU BAGUNCA
                      ON G024.IDG024 = G051.IDG024AT
                      AND G024.SNDELETE = 0

                      /*
                      INNER JOIN G028 -- ARMAZEM // filIAL
                      ON G028.IDG028 = G046.IDG028
                      AND G028.SNDELETE = 0
                      */
          
                      ${sqlWhere}
                      AND NOT EXISTS (SELECT 
                        G058.IDG005RE
                      ,  G058.IDG005DE
                              FROM G058
                              WHERE G058.IDG005DE = G043.IDG005DE
                              AND G058.IDG005RE = G043.IDG005RE)
                      ${sqlWhereAcl}
                      ${SNAG}
                      And G051.TPTRANSP = 'T'
                      And G043.DTENTREG IS NULL
                      And G051.SnDelete = 0 
                      And G051.StCtrc = 'A'
                      AND ((G043.DTBLOQUE IS NOT NULL AND  G043.DTDESBLO IS NOT NULL) OR (G043.DTBLOQUE IS NULL AND  G043.DTDESBLO IS NULL))       
                      AND G051.IDG024AT IS NOT NULL
                      AND G051.IDG024 <> G051.IDG024AT
                      ${(aux < 0) ? dtEmiNotAnoAtual : ''}
                  )
                  GROUP BY  
                      NMCIDADEDE,
                    IDG003DE,
                    IDG003OR,
                    NMCIDADEOR,
                    IDTRANSP,
                    NMTRANSP,
                    IDG014

                    ORDER BY NMTRANSP ASC
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

  api.buscarTransfeDistrib = async function (req, res, next) {

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

    //***** Validar Vira, transferencia, vendas *************
    let operador = "not"; // usado para tirar o vira da transferencia

    if(req.body.TPTRANSP == "VR"){
      operador = ""
      req.body.TPTRANSP = "T"
    }

    let vira = `
                  AND ${operador} EXISTS (SELECT 
                  G058.IDG005RE
                  ,  G058.IDG005DE
                      FROM G058
                      WHERE G058.IDG005DE = G043.IDG005DE
                      AND G058.IDG005RE = G043.IDG005RE)
                ` 

    if(req.body.TPTRANSP == "V"){
      vira = ""
    }
    //************************************************ */

    await this.controller.setConnection(req.objConn);

    req.sql = `
                Select  Distinct
                G043.NRNOTA 
              , G051.CDCTRC
              , NVL(G046.IDG046,G051.CDCARGA) as G046_IDG046
              , G043.PSBRUTO 
              , G043.VRDELIVE
              , G005RE.RSCLIENT AS NMCLIENT
              , NVL(G024.NMTRANSP, G024X.NMTRANSP) AS NMTRANSP
              , G003RE.NMCIDADE || ' - ' || G002RE.CDESTADO AS G003RE_NMCIDADE
              , G003.NMCIDADE || ' - ' || G002.CDESTADO AS G003DE_NMCIDADE
              , G005DE.NMCLIENT AS G005DE_NMCLIENT
              , G043.DTEMINOT AS DTEMINOT
              , G051.DTEMICTR AS DTEMICTR
              , G051.DTCOLETA AS DTSAICAR
              , G043.DTENTCON AS DTENTCON 
              , G051.DTCOMBIN AS DTCOMBIN
              , G051.DTAGENDA AS DTAGENDA
              , fn_data_sla(G051.IDG051) as DTPREVISTA
              , G043.DTENTREG AS DTENTREG              
              , G043.IDG043
              , G043.IDG014              
              , G043.DTBLOQUE
              , G043.DTDESBLO                            
              , G051.IDG051                                          
              , G051.DTCALDEP AS DTCALDEP
              , G051.DTENTPLA AS DTENTPLA
              , G051.DTCALANT AS DTCALANT
              , NVL(G024.IDG024, G024X.IDG024) AS IDG024
              , NVL(G024.IDG024, G024X.IDG024) AS IDG024
              , G003RE.NMCIDADE	 AS ORIGEM_CIDADE
              , G002RE.CDESTADO AS ORIGEM_UF
              , G003.NMCIDADE AS DESTINO_CIDADE
              , G002.CDESTADO AS DESTINO_UF              
                ,(Select Count(*)
                From A005 A005
                Join A001 A001
                  On (A001.IDA001 = A005.IDA001)
                Join A002 A002
                  On (A001.IDA002 = A002.IDA002)
                Where A005.IDG043 = G043.IDG043
                  And A002.IDA008 = 1) As A001_QTD_ATENDIMENTOS,
              (Select Count(*)
                From A005 A005
                Join A001 A001
                  On (A001.IDA001 = A005.IDA001)
                Join A002 A002
                  On (A001.IDA002 = A002.IDA002)
                Where A005.IDG043 = G043.IDG043
                  And A002.IDA008 = 2) As A001_QTD_OCORRENCIAS
            From G043 G043
            Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)
            Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)
            INNER JOIN G024 G024X
                -- TRANSPORTADORA
            ON
                (G051.IDG024 = G024X.IDG024)
                AND G024X.SNDELETE = 0
            LEFT JOIN G005 G005RE On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))

            LEFT JOIN G005 G005DE -- DESTINATÁRIO
            ON (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
            --AND G005DE.SNDELETE = 0
            LEFT JOIN G003 -- CIDADE DESTINO DESTINatário
            ON G003.IDG003 = G005DE.IDG003
            AND G003.SNDELETE = 0

            LEFT JOIN G002 -- UF DESTINO
            ON G002.IDG002 = G003.IDG002 
            AND G002.SNDELETE = 0

            LEFT JOIN G005 G005RE -- ORIGEM // REMETENTE
            ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
            
            LEFT JOIN G003 G003RE -- CIDADE REMETENTE
            ON G003RE.IDG003 = G005RE.IDG003
            AND G003RE.SNDELETE = 0

            LEFT JOIN G002 G002RE -- UF REMETENTE
            ON G002RE.IDG002 = G003RE.IDG002 
            AND G002RE.SNDELETE = 0

            Left Join G014 G014   On (G043.IDG014 = G014.IDG014)

            LEFT JOIN G046 -- CARGA
            ON G046.IDG046 = G051.IDG046
            AND G046.SNDELETE = 0

            Left Join G024 G024   On (G046.IDG024 = G024.IDG024)

            LEFT JOIN G048 -- PARADA
            ON G048.IDG046 = G046.IDG046

            LEFT JOIN G045 -- ITENS
            ON G045.IDG043 = G043.IDG043
            AND G045.SNDELETE = 0
            AND G043.SNDELETE = 0

            LEFT JOIN G050 -- LOTES
            ON G050.IDG045 = G045.IDG045
            AND G050.SNDELETE = 0

            LEFT JOIN G009 G009
            ON G009.IDG009 = G045.IDG009PS

            Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
            Left Join A001 A001 On (A001.IDA001 = A005.IDA001)
            Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
            Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                            
            WHERE G043.SNDELETE = 0
            And G051.StCtrc = 'A'
            And G051.SnDelete = 0 
            And G051.TPTRANSP = '${req.body.TPTRANSP}' 
            ${sqlWhereAcl}                   
            ${vira}
            ${req.body.aux}
            ${req.body.current}
            ${req.body.date}

            GROUP BY   
              G043.IDG043
            , G043.DTEMINOT 
            , G043.NRNOTA
            , G043.IDG014
            , G043.DTENTCON 
            , G043.DTENTREG 
            , G043.DTBLOQUE
            , G043.DTDESBLO
            , G043.PSBRUTO 
            , G005RE.RSCLIENT
            , G043.VRDELIVE
            , G024.NMTRANSP 
            , G051.DTCALDEP
            , G051.DTENTPLA
            , G051.DTCALANT
            , G051.DTCOLETA
            , G051.DTEMICTR
            , G051.IDG051
            , G051.CDCTRC
            , G051.CDCARGA
            , G005DE.NMCLIENT
            , G003RE.NMCIDADE
            , G002RE.CDESTADO
            , G003.NMCIDADE
            , G002.CDESTADO
            , G046.IDG046
            , G051.DTCOMBIN
            , G051.DTAGENDA
            , G046.STCARGA
            , G024.NMTRANSP 
            , G024X.NMTRANSP
            , G024.IDG024 
            , G024X.IDG024
          `;
                
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarProdutosDistrib = async function (req, res, next) {

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

    let DTINIPER = (req.body.DTINIPER)? req.body.DTINIPER : '2018-01-01 00:00:00';
    let DTFINPER = (req.body.DTFINPER)? req.body.DTFINPER : '2018-02-01 00:00:00';

    await this.controller.setConnection(req.objConn);

    req.sql = `SELECT G045.IDG045
                    , G045.DSPRODUT
                    , G050.QTPRODUT
                    , G009.CDUNIDAD
                    , G045.IDG043
                 FROM G045 G045
           INNER JOIN G050 G050 ON G050.IDG045 = G045.IDG045 AND G050.SNDELETE = 0
           INNER JOIN G009 G009 ON G009.IDG009 = G045.IDG009PS
                WHERE G045.SNDELETE = 0
                  AND G045.IDG043 IN (  SELECT DISTINCT G043.IDG043
                                                   FROM G043 G043
                                             INNER JOIN G052 G052 ON (G052.IDG043 = G043.IDG043)
                                             INNER JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)
                                              LEFT JOIN G014 G014 ON (G043.IDG014 = G014.IDG014)
                                                  WHERE G043.SNDELETE = 0
                                                    AND G043.DTEMINOT >=  TO_DATE('${DTINIPER}', 'YYYY-MM-DD HH24:MI:SS')
                                                    AND G043.DTEMINOT <   TO_DATE('${DTFINPER}', 'YYYY-MM-DD HH24:MI:SS')
                                                    AND G043.DTENTREG IS NULL
                                                    And G051.TPTRANSP = '${req.body.TPTRANSP}'
                                                    AND G051.SNDELETE = 0
                                                    AND G051.STCTRC = 'A'
                                                    ${sqlWhereAcl}
                                               GROUP BY G043.IDG043
                                     )
             GROUP BY G045.IDG045
                    , G045.DSPRODUT
                    , G050.QTPRODUT
                    , G009.CDUNIDAD
                    , G045.IDG043`;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
};

//   api.buscarProdutos = async function (req, res, next) {

//     let sqlWhereAcl = await acl.montar({
//       ids001: req.headers.ids001,
//       dsmodulo: "dashboard",
//       nmtabela: [
//         {
//           G014: 'G014'
//         }
//       ],
//       esoperad: 'And '
//     });
//     if (typeof sqlWhereAcl == 'undefined') {
//       sqlWhereAcl = '';
//     }

//   await this.controller.setConnection(req.objConn);

//   req.sql = `
//               SELECT 
//               G045.IDG045
//             , G045.DSPRODUT
//             , SUM(G050.QTPRODUT) TTPRODUT
//             , G009.CDUNIDAD
//             , G043.IDG043
//             , G043.IDG014
//             , G043.DTENTREG
//             , G043.DTEMINOT
//             , G051.DTCOMBIN
//             , G051.DTAGENDA
//             , G043.DTENTCON
//             , G051.DTCALDEP
//             , G051.DTENTPLA
//             , G051.DTCALANT
//             , NVL(G024.NMTRANSP, G024X.NMTRANSP) AS NMTRANSP
//             , G002RE.CDESTADO AS ORIGEM_UF
//             , G002.CDESTADO AS DESTINO_UF

//             FROM G043 -- DELIVERIES

//             Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)
//             Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)

//             LEFT JOIN G046 -- CARGA
//               ON G046.IDG046 = G051.IDG046
//               AND G046.SNDELETE = 0

//             Left Join G024 G024   On (G046.IDG024 = G024.IDG024)

//             INNER JOIN G024 G024X ON (G051.IDG024 = G024X.IDG024) AND G024X.SNDELETE = 0

//             LEFT JOIN G005 G005DE -- DESTINATARIO
//             ON (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))

//             LEFT JOIN G003 -- CIDADE DESTINO
//             ON G003.IDG003 = G005DE.IDG003
//             AND G003.SNDELETE = 0

//             LEFT JOIN G002 -- UF DESTINO
//             ON G002.IDG002 = G003.IDG002 
//             AND G002.SNDELETE = 0

//             LEFT JOIN G005 G005RE -- DESTINATARIO
//             ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))

//             LEFT JOIN G003 G003RE -- CIDADE ORIGEM
//             ON G003RE.IDG003 = G005RE.IDG003
//             AND G003RE.SNDELETE = 0

//             LEFT JOIN G002 G002RE -- UF ORIGEM
//             ON G002RE.IDG002 = G003RE.IDG002 
//             AND G002RE.SNDELETE = 0

//             INNER JOIN G045 -- ITENS
//             ON G045.IDG043 = G043.IDG043
//             AND G045.SNDELETE = 0
//             AND G043.SNDELETE = 0

//             INNER JOIN G050 -- LOTES
//             ON G050.IDG045 = G045.IDG045
//             AND G050.SNDELETE = 0

//             INNER JOIN G009 G009
//             ON G009.IDG009 = G045.IDG009PS

//             Left Join G014 G014   On (G043.IDG014 = G014.IDG014)

//             Where G043.SNDELETE = 0

//             ${sqlWhereAcl}

//             And G051.TPTRANSP = '${req.body.TPTRANSP}'
//             --And  G014.IDG014 In (93)
//             AND G043.DTENTREG IS NULL
//             And G051.SnDelete = 0 
//             And TO_CHAR(G043.DTEMINOT,'YYYY') =  TO_CHAR(CURRENT_DATE, 'YYYY')
//             --AND G045.IDG045 = 986536              

//             GROUP BY 
//               G045.IDG045
//             , G045.DSPRODUT 
//             , G009.CDUNIDAD
//             , G043.IDG043
//             , G043.IDG014
//             , G043.DTENTREG
//             , G043.DTEMINOT
//             , G051.DTCOMBIN
//             , G051.DTAGENDA
//             , G043.DTENTCON
//             , G051.DTCALDEP
//             , G051.DTENTPLA
//             , G051.DTCALANT
//             , G024.NMTRANSP 
//             , G024X.NMTRANSP
//             , G002RE.CDESTADO
//             , G002.CDESTADO
//             ORDER BY DSPRODUT ASC`;
//   return await gdao.executar(req, res, next).catch((err) => { throw err });
// };

  return api;
};
