/**
 * @description Possui os métodos responsaveis por alimentar gráficos e indicadores para Gestão de Movimentação.
 * @author Walan Cristian Ferreira Almeida
 * @since 04/12/2019
 * 
*/

/** 
 * @module dao/GestaoMovimentacao
 * @description Possui os métodos responsaveis por alimentar gráficos e indicadores para Gestão de Movimentação.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dataAtual  = app.src.utils.DataAtual;
  var logger     = app.config.logger;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var xlsxj      = require("xlsx-to-json");
  api.controller = app.config.ControllerBD;
  var db         = app.config.database;
  const gdao     = app.src.modGlobal.dao.GenericDAO;

  /* VARÍAVEIS PARA BUSCAS NO DIA ATUAL */
  var data        = dataAtual.formataData(dataAtual.dataAtualJS(), 'YYYY-MM-DD');
  var filtroDatas = `AND H007.HOINICIO BETWEEN TO_DATE('${data} 00:00:00', 'YYYY-MM-DD HH24:MI:SS')
                                           AND TO_DATE('${data} 23:59:59', 'YYYY-MM-DD HH24:MI:SS')`;

  var arrClientes = [ // PROVISÓRIO - ARRAY TOMADORES SYNGENTA
    100095,
    103483,
    103351,
    205880,
    205858,
    100093,
    150584,
    205871,
    205846,
    205861,
    205827,
    205855,
    153355,
    205877,
    205826,
    205829,
    101160,
    106352,
    150138,
    151012,
    100094,
    205840,
    150139,
    205874,
    205860,
    205882,
    205878,
    205856,
    205862,
    205847,
    150075,
    100031,
    150660,
    205872,
    100091,
    118948,
    109760,
    150560,
    205848,
    205834,
    153236,
    205832,
    205843,
    205842,
    205883,
    205839,
    205841,
    151011,
    205884,
    103355,
    150531,
    150260,
    103353,
    205833,
    113916,
    205835,
    100240,
    205873,
    206144,
    205876,
    205854,
    205838,
    151251,
    153491,
    153492,
    205837,
    205836,
    205859,
    205831,
    205857,
    205879,
    100024,
    150212,
    205849,
    205851,
    205850,
    109634,
    110871,
    205881,
    205869,
    206143,
    205866,
    103357,
    205865,
    205864,
    103358,
    205868,
    103561,
    205863,
    205828,
    150767,
    153361,
    106196,
    201674,
    205875,
    111147,
    107129,
    107505,
    201079,
    100092
  ];

  /**
   * @description Busca indicadores dos status de agendamento dos armazéns Bravo do dia atual, tabela H006.
   *
   * @async
   * @function api/buscaIndicadoresStatusAgendamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscaIndicadoresStatusAgendamento = async function (req, res, next) {

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
    } else {
      sqlWhereAcl = ` AND G005.IDG005 IN (${arrClientes.join()})`;
    }

    req.sql = `
      WITH AGE AS (
          SELECT X.STAGENDA
               , X.TPMOVTO
               , COUNT(*) AS QTAGENDA 
               , (ROUND(SUM(X.QTPESO)/1000,2))  QTPESO
            FROM (
                  SELECT DISTINCT H006.IDH006
                       , H006.STAGENDA
                       , H006.TPMOVTO
                       , H006.QTPESO
                    FROM H006 H006
                    JOIN H007 H007 ON H007.IDH006 = H006.IDH006
                    JOIN G028 G028 ON G028.IDG028 = H006.IDG028
                    LEFT JOIN H019 ON H019.IDH006 = H006.IDH006
                    LEFT JOIN G005 ON G005.IDG005 = H019.IDG005
                    LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
                    LEFT JOIN G014 ON G014.IDG014 = G022.IDG014
                   WHERE H006.SNDELETE = 0
                     --AND G028.SNARMBRA = 1
                     ${filtroDatas}
                     ${sqlWhereAcl}
                 ) X
        GROUP BY X.STAGENDA
               , X.TPMOVTO

          UNION ALL

          SELECT 0 AS STAGENDA
               , X.TPMOVTO
               , COUNT(*) AS QTAGENDA 
               , (ROUND(SUM(X.QTPESO)/1000,2))  QTPESO
            FROM (
                    SELECT DISTINCT H006.IDH006
                         , H006.STAGENDA
                         , H006.TPMOVTO
                         , H006.QTPESO
                      FROM H006 H006
                      JOIN H007 H007 ON H007.IDH006 = H006.IDH006
                      JOIN G028 G028 ON G028.IDG028 = H006.IDG028
                      LEFT JOIN H019 ON H019.IDH006 = H006.IDH006
                      LEFT JOIN G005 ON G005.IDG005 = H019.IDG005
                      LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
                      LEFT JOIN G014 ON G014.IDG014 = G022.IDG014
                     WHERE H006.SNDELETE = 0
                       --AND G028.SNARMBRA = 1
                       AND H006.STAGENDA = 3
                       AND H007.HOINICIO < CURRENT_DATE
                       ${filtroDatas}
                       ${sqlWhereAcl}
                 ) X
          GROUP BY X.STAGENDA
                 , X.TPMOVTO
          ORDER BY STAGENDA ASC
      )

      SELECT
         (SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 3 AND AGE.STAGENDA < 10 AND AGE.TPMOVTO = 'C') QTAGECAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 3 AND AGE.STAGENDA < 10 AND AGE.TPMOVTO = 'D') QTAGEDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 3 AND AGE.STAGENDA < 10)                       QTAGETOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA >= 3 AND AGE.STAGENDA < 10)                       PSAGETOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 4 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'C') QTCHECAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 4 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'D') QTCHEDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 4 AND AGE.STAGENDA < 9)                       QTCHETOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA >= 4 AND AGE.STAGENDA < 9)                       PSCHETOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 5 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'C') QTENTCAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 5 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'D') QTENTDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 5 AND AGE.STAGENDA < 9)                       QTENTTOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA >= 5 AND AGE.STAGENDA < 9)                       PSENTTOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 6 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'C') QTINICAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 6 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'D') QTINIDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 6 AND AGE.STAGENDA < 9)                       QTINITOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA >= 6 AND AGE.STAGENDA < 9)                       PSINITOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 7 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'C') QTFINCAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 7 AND AGE.STAGENDA < 9 AND AGE.TPMOVTO = 'D') QTFINDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA >= 7 AND AGE.STAGENDA < 9)                       QTFINTOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA >= 7 AND AGE.STAGENDA < 9)                       PSFINTOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 8 AND AGE.TPMOVTO = 'C')                      QTSAICAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 8 AND AGE.TPMOVTO = 'D')                      QTSAIDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 8 )                                           QTSAITOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA  = 8 )                                           PSSAITOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 9 AND AGE.TPMOVTO = 'C')                      QTFALCAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 9 AND AGE.TPMOVTO = 'D')                      QTFALDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 9 )                                           QTFALTOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA  = 9 )                                           PSFALTOT

        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 0 AND AGE.TPMOVTO = 'C')                      QTATRCAR
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 0 AND AGE.TPMOVTO = 'D')                      QTATRDES
        ,(SELECT NVL(SUM(AGE.QTAGENDA), 0) FROM AGE WHERE AGE.STAGENDA  = 0 )                                           QTATRTOT
        ,(SELECT NVL(SUM(AGE.QTPESO  ), 0) FROM AGE WHERE AGE.STAGENDA  = 0 )                                           PSATRTOT
      FROM dual`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  /**
   * @description Busca indicadores de agendamentos atrasados dos armazéns Bravo do dia atual, tabela H006.
   *
   * @async
   * @function api/buscaIndicadoresAgendamentosAtrasados
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscaIndicadoresAgendamentosAtrasados = async function (req, res, next) {

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

    req.sql = `
      WITH AGE AS (
          SELECT H006.IDH006                                                    --ID AGENDAMENTO
               , H006.STAGENDA                                                  --STATUS AGENDAMENTO
               , MAX(H007.HOINICIO) HOINICIO                                    --DATA E HORA INICIO SLOT
               , MAX(H007.HOFINAL ) HOFINAL                                     --DATA E HORA FINAL SLOT
               , (SELECT MAX(H008.HOOPERAC) FROM H008 WHERE H008.IDH006 = H006.IDH006 AND H008.STAGENDA = 7) DTFINOPE
            FROM H006 H006
            JOIN H007 H007 ON H007.IDH006 = H006.IDH006                         --SLOTS
            JOIN G028 G028 ON G028.IDG028 = H006.IDG028                         --ARMAZEM
            LEFT JOIN H019 ON H019.IDH006 = H006.IDH006
            LEFT JOIN G005 ON G005.IDG005 = H019.IDG005
            LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
            LEFT JOIN G014 ON G014.IDG014 = G022.IDG014
           WHERE H006.SNDELETE = 0
             AND G028.SNARMBRA = 1
             ${filtroDatas}
             ${sqlWhereAcl}
        GROUP BY H006.IDH006
               , H006.STAGENDA
      )
      SELECT
          (SELECT COUNT(*) FROM AGE WHERE AGE.STAGENDA = 3 AND AGE.HOINICIO < CURRENT_DATE)         QTTRANSP
        ,((SELECT COUNT(*) FROM AGE WHERE AGE.STAGENDA IN (4,5,6) AND AGE.HOFINAL < CURRENT_DATE) +
          (SELECT COUNT(*) FROM AGE WHERE AGE.STAGENDA IN (7,8	) AND AGE.HOFINAL < AGE.DTFINOPE))  QTARMAZE
      FROM dual`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  /**
   * @description Busca agendamentos atrasados dos armazéns Bravo do dia atual, tabela H006.
   *
   * @async
   * @function api/buscaAgendamentosAtrasados
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscaAgendamentosAtrasados = async function (req, res, next) {

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

    req.sql = `
      WITH AGE AS (
          SELECT DISTINCT
                  H006.IDH006                                                                   --ID AGENDAMENTO
                , H006.STAGENDA                                                                 --STATUS AGENDAMENTO
                , H006.QTPESO                                                                   --PESO AGENDAMENTO
                , CASE
                    WHEN H006.TPOPERAC IS NOT NULL THEN
                      (SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H006.TPOPERAC)
                    WHEN H006.TPOPERAC IS NULL THEN
                      (SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H024.TPOPERAC)
                  END TPOPERAC                                                                  --TIPO DE OPERAÇÃO
                , (
                     SELECT LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005
                      FROM  (
                              SELECT DISTINCT G005.NMCLIENT
                                FROM H019
                                JOIN G005 ON H019.IDG005 = G005.IDG005
                               WHERE H019.IDH006 = H006.IDH006
                                 AND H019.SNDELETE = 0
                            )
                  ) NMCLIENT                                                                    --TOMADOR
                , G028.NMARMAZE                                                                 --ARMAZÉM
                , G024.NMTRANSP                                                                 --TRANSPORTADORA
                , MAX(H007.HOINICIO) HOINICIO                                                   --DATA E HORA INICO SLOT
                , MAX(H007.HOFINAL ) HOFINAL                                                    --DATA E HORA FINAL SLOT
                , (
                    SELECT MAX(CHE.HOOPERAC)
                      FROM H008 CHE
                     WHERE CHE.IDH006   = H006.IDH006
                       AND CHE.STAGENDA = 4
                  ) DTCHECKI --CHECKIN
                , (
                    SELECT MAX(FIN.HOOPERAC)
                      FROM H008 FIN
                     WHERE FIN.IDH006   = H006.IDH006
                       AND FIN.STAGENDA = 7
                  ) DTFINOPE                                                                    --FINALIZOU OPERAÇÃO
             FROM H006 H006
             JOIN H007 H007 ON H007.IDH006 = H006.IDH006
        LEFT JOIN H024 H024 ON H024.IDH006 = H006.IDH006
             JOIN G028 G028 ON G028.IDG028 = H006.IDG028
             JOIN G024 G024 ON G024.IDG024 = H006.IDG024
             LEFT JOIN H019 ON H019.IDH006 = H006.IDH006
             LEFT JOIN G005 ON G005.IDG005 = H019.IDG005
             LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
             LEFT JOIN G014 ON G014.IDG014 = G022.IDG014
            WHERE H006.SNDELETE = 0
              AND G028.SNARMBRA = 1
              ${filtroDatas}
              ${sqlWhereAcl}
         GROUP BY H006.IDH006
                , H006.STAGENDA
                , H006.QTPESO
                , H006.TPOPERAC
                , H024.TPOPERAC
                , G028.NMARMAZE
                , G024.NMTRANSP
      )
      SELECT AGE.*
           , 'TRANSP' AS TPATRASO
           , COUNT(*) OVER() AS TOTATRAS
        FROM AGE
       WHERE (AGE.STAGENDA = 3
         AND  AGE.HOINICIO < CURRENT_DATE)
         OR  (AGE.HOINICIO < AGE.DTCHECKI)                                                    --ATRASADOS TRANSPORTADORA

      UNION ALL

      SELECT AGE.*
           , 'ARMAZE' AS TPATRASO
           , COUNT(*) OVER() AS TOTATRAS
        FROM AGE
       WHERE ((AGE.STAGENDA IN (4,5,6) AND AGE.HOFINAL < CURRENT_DATE)
          OR  (AGE.STAGENDA IN (7,8  ) AND AGE.HOFINAL < AGE.DTFINOPE))
         AND  (AGE.HOINICIO >= AGE.DTCHECKI)                                                  --ATRASADOS ARMAZÉM
    `;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  /**
   * @description Busca capacidades de movimentação e quantidade de movimentações dos armazéns Bravo, tabela G028.
   *
   * @async
   * @function api/buscaCapacidadeArmazem
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscaCapacidadeArmazem = async function (req, res, next) {

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

    req.sql = `
      WITH CAP AS (
          SELECT X.IDG028                                                                     --ID ARMAZÉM
              ,  X.NMARMAZE                                                                   --NOME ARMAZÉM
              , (ROUND(X.NRSAFRA    /1000,2))  NRSAFRA                                        --CAPACIDADE SAFRA
              , (ROUND(X.NRESAFRA   /1000,2))  NRESAFRA                                       --CAPACIDADE ENTRE SAFRA
              , (ROUND(SUM(X.QTPESO)/1000,2))  QTPESO                                         --PESO TOTAL MOVIMENTACAO
              , CASE
                  WHEN X.NRSAFRA IS NOT NULL AND X.NRSAFRA > 0 THEN
                    ROUND(((SUM(X.QTPESO)*100)/X.NRSAFRA),2)
                  ELSE NULL
                END PRSAFRA                                                                   --PERCENTUAL MOVIMENTAÇÃO
              , CASE
                  WHEN X.NRESAFRA IS NOT NULL AND X.NRESAFRA > 0 THEN
                    ROUND(((SUM(X.QTPESO)*100)/X.NRESAFRA),2)
                  ELSE NULL
                END PRESAFRA                                                                  --PERCENTUAL MOVIMENTAÇÃO
          FROM (
                  SELECT DISTINCT G028.IDG028
                       , G028.NMARMAZE
                       , G028.NRSAFRA
                       , G028.NRESAFRA
                       , H006.IDH006
                       , H006.QTPESO
                    FROM H006 H006
                    JOIN H007 H007 ON H007.IDH006 = H006.IDH006
                    JOIN G028 G028 ON G028.IDG028 = H006.IDG028
                    LEFT JOIN H019 ON H019.IDH006 = H006.IDH006
                    LEFT JOIN G005 ON G005.IDG005 = H019.IDG005
                    LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
                    LEFT JOIN G014 ON G014.IDG014 = G022.IDG014
                   WHERE H006.SNDELETE = 0
                     AND G028.SNDELETE = 0
                     AND G028.STCADAST = 'A'
                     AND G028.SNARMBRA = 1
                     ${filtroDatas}
                     ${sqlWhereAcl}
               ) X
        GROUP BY X.IDG028
               , X.NMARMAZE
               , X.NRSAFRA
               , X.NRESAFRA
      )
      SELECT CAP.*
            ,(SELECT ROUND((SUM(QTPESO)*100)/SUM(NRSAFRA ),2) FROM CAP) TTPERSAF
            ,(SELECT ROUND((SUM(QTPESO)*100)/SUM(NRESAFRA),2) FROM CAP) TTPERESA
      FROM CAP`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  return api;
};
