/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de agendamento
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module dao/Agendamento
 * @description H006/H007/H008.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  var api           = {};
  var utils         = app.src.utils.FuncoesObjDB;
  var asnDAO        = app.src.modDocSyn.dao.ASNDAO;
  var cargasDAO     = app.src.modIntegrador.dao.CargasDAO;
  var dtatu         = app.src.utils.DataAtual;
  var acl           = app.src.modIntegrador.controllers.FiltrosController;
  var logger        = app.config.logger;
  api.controller    = app.config.ControllerBD;
  const tmz 		    = app.src.utils.DataAtual;
  const gdao = app.src.modGlobal.dao.GenericDAO;
  var dao2          = app.src.modHoraCerta.dao.Agendamento2DAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');


  /***
   * @description Busca um dado na tabela H006.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarAgendamentos = async function (req, res, next) {

    logger.debug("Inicio buscar");
    
    var filtro = ''; //filtrar apenas 1
    var filtroDatas1 = '';

    if(req.body.IDH006){
      if (req.body.IDH006.length > 1) {
        filtro = `And H006.IDH006 in (${req.body.IDH006.join()})`;
      } else {
        filtro = `And H006.IDH006 = ${req.body.IDH006}`;
      }
    }

    if(req.body.TPMOVTO){
      if (req.body.TPMOVTO != "") {
        filtro = `And H006.TPMOVTO = '${req.body.TPMOVTO}'`;
      }
    }

    if (req.body.DTMAXPES) { // Se for filtro por período de datas
      filtroDatas1 = `And TO_DATE(To_Char(H007.HoInicio,'dd/mm/yyyy'),'DD/MM/YYYY') >= TO_DATE('${req.body.DTPESQUI}','DD/MM/YYYY')
                      And TO_DATE(To_Char(H007.HoInicio,'dd/mm/yyyy'),'DD/MM/YYYY') <= TO_DATE('${req.body.DTMAXPES}','DD/MM/YYYY')`;

      filtroDatas2 = `And TO_DATE(To_Char(H006.DTCADAST,'dd/mm/yyyy'),'DD/MM/YYYY') >= TO_DATE('${req.body.DTPESQUI}','DD/MM/YYYY')
                      And TO_DATE(To_Char(H006.DTCADAST,'dd/mm/yyyy'),'DD/MM/YYYY') <= TO_DATE('${req.body.DTMAXPES}','DD/MM/YYYY')`;
    } else {
      filtroDatas1 = `And To_Char(H007.HoInicio,'dd/mm/yyyy') = '${req.body.DTPESQUI}'`;
      filtroDatas2 = `And To_Char(H006.DTCADAST,'dd/mm/yyyy') = '${req.body.DTPESQUI}'`;
    }

    var sqlAcl = "";
    var sqlAclClient = "";
    var sqlAcl4pl = "";
    var IDS001;

    //BUSCAR ID DO USUARIO
    if (req.body.IDS001 !== undefined){
      IDS001 = req.body.IDS001;
    }
    else if (req.headers.ids001 !== undefined){
      IDS001 = req.headers.ids001;
    }

    if (IDS001 !== undefined) {
      sqlAcl = await acl.montar({
          ids001: IDS001,
          dsmodulo: 'HORA-CERTA',
          nmtabela: [{ G024: 'G024' }, {G028: 'G028'}, {G005:'G005'}],
          //dioperad: ' ',
          esoperad: 'AND'
      });

      sqlAclClient = await acl.montar({
          ids001: IDS001,
          dsmodulo: 'HORA-CERTA',
          nmtabela: [{G005:'G005'}],
          //dioperad: ' ',
          esoperad: 'AND'
      });

      if (sqlAclClient === ' AND 1=0') { sqlAclClient = ''; }

      /* Verifica se é armazém Bravo */
      let sqlArmazem = `Select G028.SnArmBra From G028 Where G028.Idg028 In (${req.body.IDG028})`;

      let snArmBra = await db.execute(
        {
          sql: sqlArmazem,
          param: [],
        })
        .then((result) => {
          return (result[0].SNARMBRA);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      /* Verifica se é armazém Bravo */

      if (snArmBra && snArmBra == 1) {
        /* Verifica se é usuário 4PL */
        sqlAclOperac = await acl.montar({
            ids001: IDS001,
            dsmodulo: 'HORA-CERTA',
            nmtabela: [{G014:'G014'}],
            //dioperad: ' ',
            esoperad: 'AND'
        });

        if (sqlAclOperac !== ' AND 1=0' && sqlAclOperac !== '') {

          let sn4pl = false;
          let sql4pl = `Select Distinct G014.Sn4pl From G014 Where G014.SnDelete = 0 ${sqlAclOperac}`;

          let res4pl = await db.execute(
            {
              sql: sql4pl,
              param: [],
            })
            .then((result) => {
              return (result);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });

          for (let r of res4pl) {
            if (r.SN4PL == 1) {
              sn4pl = true;
            }
          }

          if (sn4pl) {
            sqlAcl4pl = ` AND (((H006.TPMOVTO = 'C' AND H024.IDG046 IS NOT NULL) AND G046.TPMODCAR = 2) OR H006.TPMOVTO = 'D')`;
          }
        }
        /* Verifica se é usuário 4PL */
      }

    }else{
      sqlAcl = ' AND 1=0'
    }

    var query = `'([^,]+)(,\\1)*(,|$)', '\\1\\3'`;

    var strSql = `SELECT
                      /* AGENDAMENTO */
                        H006.IDH006
                      , H006.STAGENDA
                      , H006.TPPESAGE
                      , H006.TPMOVTO
                      , H006.QTSLOTS
                      , H006.NRNFCARG
                      , H006.QTPESO
                      , H006.NRPLAVEI
                      , H006.NRPLARE1
                      , H006.NRPLARE2
                      , H006.TXOBSAGE
                      , H006.SNIMPMAP
                      , H006.NRREGIST
                      , H006.NRTUSAP
                      , H006.IDS001
                      , H006.LSNOTAS
                      , H006.IDBOX
                      , H006.NUMNAM
                      , H006.QTTEMPRE
                      , H006.UNIDRECE
                      , H006.CDLACRE
                      , H006.CDCONTAI
                      , H006.AUTORIZA
                      , H006.PRSERVIC
                      , H006.QTPALLET
                      , H006.PSPALLET

                      /* ARMAZÉM */
                      , G028.IDG028
                      , G028.NMARMAZE
                      , G028.TPBALANC

                      /* TRANSPORTADORA */
                      , G024.IDG024
                      , G024.NMTRANSP

                      /* TIPO DE CARGA */
                      , H002.IDH002
                      , H002.DSTIPCAR

                      /* TIPO DE VEÍCULO */
                      , G030.IDG030
                      , G030.DSTIPVEI

                      /* VEÍCULO */
                      , G032.IDG032
                      , G032.DSVEICUL
                      , G032.NRFROTA

                      /* MOTORISTA */
                      , G031.IDG031
                      , G031.CJMOTORI
                      , G031.NRCNHMOT
                      , G031.RGMOTORI
                      , G031.NMMOTORI

                      /* FORNECEDOR */
                      , G005F.NMCLIENT  AS FORNECED
                      , G005F.IDG005    AS ID_FORNECED

                      /* JANELA */
                      , H005.NRJANELA

                      /* SLOT */
                      , COALESCE(
                          MIN(TO_CHAR(H007.HOINICIO,'dd/mm/yyyy')),
                          MIN(TO_CHAR(H006.DTCADAST,'dd/mm/yyyy'))
                        ) DT
                      , COALESCE(
                          MIN(TO_CHAR(H007.HOINICIO,'hh24:mi')),
                          MIN(TO_CHAR(H006.DTCADAST,'hh24:mi'))
                        ) HOINICIO

                      /* CHECKIN */
                      , TO_CHAR(H008.HOOPERAC,'hh24:mi') CHECKIN

                      /* OBSERVAÇÕES */
                      , MAX(OBSAGEN.TXOBSERV) OBSAGEN
                      , MAX(OBSCHEC.TXOBSERV) OBSCHEC
                      , MAX(OBSENTR.TXOBSERV) OBSENTR
                      , MAX(OBSINOP.TXOBSERV) OBSINOP
                      , MAX(OBSFNOP.TXOBSERV) OBSFNOP
                      , MAX(OBSSAIU.TXOBSERV) OBSSAIU

                      /* CARGA */
                      , MIN(G046.TPMODCAR) TPMODCAR
                      , COALESCE( TO_CHAR(H006.IDG046),
                                  (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046
                                     FROM H024 H024
                                    WHERE H024.IDH006   = H006.IDH006
                                      AND H024.SNDELETE = 0)
                        ) AS IDG046

                      /* TOMADORES */
                      , (
                          SELECT
                            LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005
                          FROM
                          (
                            SELECT DISTINCT G005.NMCLIENT
                              FROM H019 H019
                              JOIN G005 G005 ON H019.IDG005 = G005.IDG005
                             WHERE H019.IDH006   = H006.IDH006
                               AND H019.SNDELETE = 0
                               ${sqlAclClient}
                          )
                        ) AS TOMADOR

                      /* PRODUTOS */
                      , CASE
                          WHEN H022.TPMATERI = 'CS' THEN 'Carga Seca'
                          WHEN H022.TPMATERI = 'GL' THEN 'Granel Liquido'
                          WHEN H022.TPMATERI = 'EM' THEN 'Embalagens'
                          WHEN H022.TPMATERI = 'TO' THEN 'Toller'
                        END TPMATERI
                      , (
                          SELECT
                            LISTAGG(H022.DSMATERI || '- COD: ' || H022.CDMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI)
                           FROM H023 H023
                           JOIN H022 H022 ON H023.IDH022 = H022.IDH022
                          WHERE H006.IDH006 = H023.IDH006
                        ) AS PRODUTOS

                      /* PESAGENS */
                      , (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'E' AND SNDELETE = 0) QTDPSENT
                      , (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'S' AND SNDELETE = 0) QTDPSSAI
                      , (
                          SELECT H021.LIBERADO
                            FROM H021 H021
                           WHERE H021.IDH021 = ( SELECT MAX(H021A.IDH021)
                                                   FROM H021 H021A
                                                  WHERE H021A.IDH006   = H006.IDH006
                                                    AND H021A.TPMOVTO  = 'S'
                                                    AND H021A.SNDELETE = 0
                                                    AND H021A.LIBERADO IS NOT NULL)
                        ) LIBERASAI

                      /* TIPO DE OPERAÇÃO */
                      , CASE
                          WHEN H006.TPOPERAC IS NOT NULL THEN TO_NUMBER(H006.TPOPERAC, '999')
                          WHEN H006.TPOPERAC IS NULL THEN
                            TO_NUMBER((
                               SELECT FIRST_VALUE(IDOPERAC)
                                      OVER (ORDER BY NRDIVERG ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
                                      AS IDOPERAC
                                FROM (
                                        SELECT G097.IDKEY                     IDOPERAC
                                             , G097.DSVALUE                   DSOPERAC
                                             , LPAD(MAX(G098.DSVALUE), 3, 0)  NRDIVERG
                                          FROM G097 G097
                                          JOIN G098 G098 ON G098.IDG097PA = G097.IDG097 AND G098.IDG097FI IN (16, 17)
                                          JOIN H024 H024 ON H024.TPOPERAC = G097.IDKEY
                                         WHERE G097.IDGRUPO = 1
                                           AND H024.IDH006  = H006.IDH006
                                      GROUP BY G097.IDKEY, G097.DSVALUE
                                     )
                               Offset 0 ROWS
                               Fetch next 1 rows ONLY
                            ), '999')
                        END TPOPERAC
                      , CASE
                          WHEN H006.TPOPERAC IS NOT NULL THEN
                            (SELECT DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H006.TPOPERAC)
                          WHEN H006.TPOPERAC IS NULL THEN
                            (
                               SELECT FIRST_VALUE(DSOPERAC)
                                      OVER (ORDER BY NRDIVERG ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
                                      AS DSOPERAC
                                FROM (
                                        SELECT G097.IDKEY                     IDOPERAC
                                             , G097.DSVALUE                   DSOPERAC
                                             , LPAD(MAX(G098.DSVALUE), 3, 0)  NRDIVERG
                                          FROM G097 G097
                                          JOIN G098 G098 ON G098.IDG097PA = G097.IDG097 AND G098.IDG097FI IN (16, 17)
                                          JOIN H024 H024 ON H024.TPOPERAC = G097.IDKEY
                                         WHERE G097.IDGRUPO = 1
                                           AND H024.IDH006  = H006.IDH006
                                      GROUP BY G097.IDKEY, G097.DSVALUE
                                     )
                               Offset 0 ROWS
                               Fetch next 1 rows ONLY
                            )
                        END DSOPERAC
                   FROM H006 H006
              LEFT JOIN H007 H007  ON H007.IDH006   = H006.IDH006             --SLOTS
              LEFT JOIN H005 H005  ON H007.IDH005   = H005.IDH005             --JANELA
              LEFT JOIN H002 H002  ON H006.IDH002   = H002.IDH002             --TIPO CARGA
              LEFT JOIN G024 G024  ON H006.IDG024   = G024.IDG024             --TRANSPORTADORA
              LEFT JOIN G028 G028  ON H006.IDG028   = G028.IDG028             --ARMAZÉM
              LEFT JOIN G030 G030  ON H006.IDG030   = G030.IDG030             --TIPO DE VEÍCULO
              LEFT JOIN G031 G031  ON H006.IDG031   = G031.IDG031             --MOTORISTA
              LEFT JOIN G032 G032  ON H006.NRPLAVEI = G032.NRPLAVEI           --VEICULO
              LEFT JOIN H019 H019  ON H019.IDH006   = H006.IDH006             --TOMADORES
                                  AND H019.SNDELETE = 0
              LEFT JOIN G005 G005  ON H019.IDG005   = G005.IDG005             --CLIENTES
              LEFT JOIN G022 G022  ON G022.IDG005   = G005.IDG005             --CLIENT/OPERAC
              LEFT JOIN G014 G014  ON G022.IDG014   = G014.IDG014             --OPERAÇÃO
              LEFT JOIN G005 G005F ON H006.FORNECED = G005F.IDG005            --FORNECEDOR
              LEFT JOIN H023 H023  ON H023.IDH006   = H006.IDH006             --PRODUTOS
              LEFT JOIN H022 H022  ON H022.IDH022   = H023.IDH022             --MATERIAIS
              LEFT JOIN H024 H024  ON H024.IDH006   = H006.IDH006             --AGRUPAMENTO
              LEFT JOIN G046 G046  ON H024.IDG046   = G046.IDG046             --CARGA

              /* OBSERVAÇÕES */
              LEFT JOIN (SELECT IDH006, MAX(HOOPERAC) AS HOOPERAC FROM H008 WHERE STAGENDA = 4 GROUP BY IDH006) H008 ON H008.IDH006 = H006.IDH006
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSAGEN ON OBSAGEN.IDH006 = H006.IDH006 AND OBSAGEN.STAGENDA = 3
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSCHEC ON OBSCHEC.IDH006 = H006.IDH006 AND OBSCHEC.STAGENDA = 4
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSENTR ON OBSENTR.IDH006 = H006.IDH006 AND OBSENTR.STAGENDA = 5
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSINOP ON OBSINOP.IDH006 = H006.IDH006 AND OBSINOP.STAGENDA = 6
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSFNOP ON OBSFNOP.IDH006 = H006.IDH006 AND OBSFNOP.STAGENDA = 7
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSSAIU ON OBSSAIU.IDH006 = H006.IDH006 AND OBSSAIU.STAGENDA = 8

                  WHERE H006.SNDELETE = 0
                  ${filtroDatas1}
                  AND H006.IDG028 IN (${req.body.IDG028})
                  ${filtro} ${sqlAcl} ${sqlAcl4pl}
               GROUP BY
                      /* AGENDAMENTO */
                        H006.IDH006
                      , H006.STAGENDA
                      , H006.TPPESAGE
                      , H006.TPMOVTO
                      , H006.QTSLOTS
                      , H006.NRNFCARG
                      , H006.QTPESO
                      , H006.NRPLAVEI
                      , H006.NRPLARE1
                      , H006.NRPLARE2
                      , H006.TXOBSAGE
                      , H006.SNIMPMAP
                      , H006.NRREGIST
                      , H006.NRTUSAP
                      , H006.IDS001
                      , H006.LSNOTAS
                      , H006.IDBOX
                      , H006.NUMNAM
                      , H006.QTTEMPRE
                      , H006.UNIDRECE
                      , H006.CDLACRE
                      , H006.CDCONTAI
                      , H006.AUTORIZA
                      , H006.PRSERVIC
                      , H006.QTPALLET
                      , H006.PSPALLET
                      , H006.TPOPERAC

                      /* ARMAZÉM */
                      , G028.IDG028
                      , G028.NMARMAZE
                      , G028.TPBALANC

                      /* TRANSPORTADORA */
                      , G024.IDG024
                      , G024.NMTRANSP

                      /* TIPO DE CARGA */
                      , H002.IDH002
                      , H002.DSTIPCAR

                      /* TIPO DE VEÍCULO */
                      , G030.IDG030
                      , G030.DSTIPVEI

                      /* VEÍCULO */
                      , G032.IDG032
                      , G032.DSVEICUL
                      , G032.NRFROTA

                      /* MOTORISTA */
                      , G031.IDG031
                      , G031.CJMOTORI
                      , G031.NRCNHMOT
                      , G031.RGMOTORI
                      , G031.NMMOTORI

                      /* FORNECEDOR */
                      , G005F.NMCLIENT
                      , G005F.IDG005

                      /* JANELA */
                      , H005.NRJANELA

                      /* CHECKIN */
                      , H008.HOOPERAC

                      /* CARGA */
                      , H006.IDG046

                      /* PRODUTOS */
                      , H022.TPMATERI

                  UNION ALL

                  SELECT
                      /* AGENDAMENTO */
                        H006.IDH006
                      , H006.STAGENDA
                      , H006.TPPESAGE
                      , H006.TPMOVTO
                      , H006.QTSLOTS
                      , H006.NRNFCARG
                      , H006.QTPESO
                      , H006.NRPLAVEI
                      , H006.NRPLARE1
                      , H006.NRPLARE2
                      , H006.TXOBSAGE
                      , H006.SNIMPMAP
                      , H006.NRREGIST
                      , H006.NRTUSAP
                      , H006.IDS001
                      , H006.LSNOTAS
                      , H006.IDBOX
                      , H006.NUMNAM
                      , H006.QTTEMPRE
                      , H006.UNIDRECE
                      , H006.CDLACRE
                      , H006.CDCONTAI
                      , H006.AUTORIZA
                      , H006.PRSERVIC
                      , H006.QTPALLET
                      , H006.PSPALLET

                      /* ARMAZÉM */
                      , G028.IDG028
                      , G028.NMARMAZE
                      , G028.TPBALANC

                      /* TRANSPORTADORA */
                      , G024.IDG024
                      , G024.NMTRANSP

                      /* TIPO DE CARGA */
                      , null AS IDH002
                      , null AS DSTIPCAR

                      /* TIPO DE VEÍCULO */
                      , null AS IDG030
                      , null AS DSTIPVEI

                      /* VEÍCULO */
                      , null AS IDG032
                      , null AS DSVEICUL
                      , null AS NRFROTA

                      /* MOTORISTA */
                      , G031.IDG031
                      , G031.CJMOTORI
                      , G031.NRCNHMOT
                      , G031.RGMOTORI
                      , G031.NMMOTORI

                      /* FORNECEDOR */
                      , ''   AS FORNECED
                      , null AS ID_FORNECED

                      /* JANELA */
                      , null AS NRJANELA

                      /* SLOT */
                      , MIN(TO_CHAR(H006.DTCADAST,'dd/mm/yyyy')) DT
                      , MIN(TO_CHAR(H006.DTCADAST,'hh24:mi'))    HOINICIO

                      /* CHECKIN */
                      , TO_CHAR(H008.HOOPERAC,'hh24:mi') CHECKIN

                      /* OBSERVAÇÕES */
                      , MAX(OBSAGEN.TXOBSERV) OBSAGEN
                      , MAX(OBSCHEC.TXOBSERV) OBSCHEC
                      , MAX(OBSENTR.TXOBSERV) OBSENTR
                      , MAX(OBSENTR.TXOBSERV) OBSINOP
                      , MAX(OBSENTR.TXOBSERV) OBSFNOP
                      , MAX(OBSSAIU.TXOBSERV) OBSSAIU

                      /* CARGA */
                      , null AS TPMODCAR
                      , null AS IDG046

                      /* TOMADORES */
                      , null AS TOMADOR

                      /* PRODUTOS */
                      , null AS TPMATERI
                      , null AS PRODUTOS

                      /* PESAGENS */
                      , null AS QTDPSENT
                      , null AS QTDPSSAI
                      , null AS LIBERASAI

                      /* TIPO DE OPERAÇÃO */
                      , TO_NUMBER(H006.TPOPERAC, '999') TPOPERAC
                      , (SELECT DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H006.TPOPERAC) DSOPERAC
                   FROM H006 H006
              LEFT JOIN G024 G024  ON H006.IDG024   = G024.IDG024             --TRANSPORTADORA
              LEFT JOIN G028 G028  ON H006.IDG028   = G028.IDG028             --ARMAZÉM
              LEFT JOIN G031 G031  ON H006.IDG031   = G031.IDG031             --MOTORISTA

              /* OBSERVAÇÕES */
              LEFT JOIN (SELECT IDH006, MAX(HOOPERAC) AS HOOPERAC FROM H008 WHERE STAGENDA = 4 GROUP BY IDH006) H008 ON H008.IDH006 = H006.IDH006
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSAGEN ON OBSAGEN.IDH006 = H006.IDH006 AND OBSAGEN.STAGENDA = 3
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSCHEC ON OBSCHEC.IDH006 = H006.IDH006 AND OBSCHEC.STAGENDA = 4
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSENTR ON OBSENTR.IDH006 = H006.IDH006 AND OBSENTR.STAGENDA = 5
              LEFT JOIN (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSSAIU ON OBSSAIU.IDH006 = H006.IDH006 AND OBSSAIU.STAGENDA = 8

                  WHERE H006.SNDELETE = 0 AND H006.TPOPERAC = 8
                  ${filtroDatas2}
                  AND H006.IDG028 IN (${req.body.IDG028})
                  ${filtro}

               GROUP BY
                      /* AGENDAMENTO */
                        H006.IDH006
                      , H006.STAGENDA
                      , H006.TPPESAGE
                      , H006.TPMOVTO
                      , H006.QTSLOTS
                      , H006.NRNFCARG
                      , H006.QTPESO
                      , H006.NRPLAVEI
                      , H006.NRPLARE1
                      , H006.NRPLARE2
                      , H006.TXOBSAGE
                      , H006.SNIMPMAP
                      , H006.NRREGIST
                      , H006.NRTUSAP
                      , H006.IDS001
                      , H006.LSNOTAS
                      , H006.IDBOX
                      , H006.NUMNAM
                      , H006.QTTEMPRE
                      , H006.UNIDRECE
                      , H006.CDLACRE
                      , H006.CDCONTAI
                      , H006.AUTORIZA
                      , H006.PRSERVIC
                      , H006.QTPALLET
                      , H006.PSPALLET
                      , H006.TPOPERAC

                      /* ARMAZÉM */
                      , G028.IDG028
                      , G028.NMARMAZE
                      , G028.TPBALANC

                      /* TRANSPORTADORA */
                      , G024.IDG024
                      , G024.NMTRANSP

                      /* MOTORISTA */
                      , G031.IDG031
                      , G031.CJMOTORI
                      , G031.NRCNHMOT
                      , G031.RGMOTORI
                      , G031.NMMOTORI

                      /* CHECKIN */
                      , H008.HOOPERAC

               ORDER BY DT, HOINICIO, STAGENDA`

    return await db.execute(
      {
        sql: strSql,
        param: [],
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

    logger.debug("Fim buscar");
  };

  /***
   * @description Busca um dado na tabela H024.
   *
   * @async
   * @function api/buscar
   * @param {request} obj - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarCargas = async function (obj, res, next) {

    logger.debug("Inicio buscar cargas");

    var sqlAclClient = '';

    //BUSCAR ID DO USUARIO
    if (obj.IDS001 !== undefined){
      IDS001 = obj.IDS001;
    }

    if (IDS001 !== undefined) {
      sqlAclClient = await acl.montar({
          ids001: IDS001,
          dsmodulo: 'HORA-CERTA',
          nmtabela: [{G005:'G005'}],
          //dioperad: ' ',
          esoperad: 'AND'
      });

      if (sqlAclClient === ' AND 1=0') { sqlAclClient = ''; }
    }

    var strSql = ` Select H024.IDG046,
                          G046.DSCARGA,
                          G046.DTPSMANU,
                          G046.TPMODCAR,
                          G046.PSCARGA,
                          H024.NTFISCA1,
                          H024.NTFISCA2,
                          H024.TPOPERAC,
                          (SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H024.TPOPERAC) DSOPERAC,
                          (
                            SELECT 
                              LISTAGG(IDG005, ',') WITHIN GROUP(ORDER BY IDG005) IDG005 
                            FROM
                            (
                              SELECT DISTINCT G005.IDG005
                              FROM H019 
                              INNER JOIN G005 
                                ON H019.IDG005 = G005.IDG005
                              WHERE H019.IDG046 = H024.IDG046
                                AND H019.SNDELETE = 0
                                ${sqlAclClient}
                            )
                          ) AS IDTOMADO,
                            (
                                SELECT 
                                  LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005 
                                FROM
                                (
                                  SELECT DISTINCT G005.NMCLIENT
                                  FROM H019 
                                  INNER JOIN G005 
                                    ON H019.IDG005 = G005.IDG005
                                  WHERE H019.IDG046 = H024.IDG046
                                    AND H019.SNDELETE = 0
                                    ${sqlAclClient}
                                )
                          ) AS NMTOMADO,
                          G031.IDG031,
                          G031.CJMOTORI,
                          G031.NRCNHMOT,
                          G031.RGMOTORI,
                          G031.NMMOTORI

                      From H024 H024
                      Left Join G046 G046 on ( H024.IDG046 = G046.IDG046 )
                      Left Join G031 G031 on ( G031.IDG031 = G046.IDG031M1 )
                      Where H024.IDG046 IN (${obj.IDG046})
                      And H024.IDH006 = ${obj.IDH006}

                      Group By H024.IDG046,
                          G046.DSCARGA,
                          G046.DTPSMANU,
                          G046.TPMODCAR,
                          G046.PSCARGA,
                          H024.NTFISCA1,
                          H024.NTFISCA2,
                          H024.TPOPERAC,
                          G031.IDG031,
                          G031.CJMOTORI,
                          G031.NRCNHMOT,
                          G031.RGMOTORI,
                          G031.NMMOTORI`;

    return await db.execute(
      {
        sql: strSql,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        logger.debug("Fim buscar carga");
          return (result);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        logger.debug("Fim buscar carga");
        throw err;
      });

  };

    /**
   * @description Busca um dado na tabela H006.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.atualizacaoAgendamentosCheckin = async function (req, res, next) {

  logger.debug("Inicio buscar");
  
  var filtro = ''; //filtrar apenas 1

  if(req.body.IDH006){
    filtro = `And H006.IDH006 = ${req.body.IDH006}`
  }

  var sqlAcl = "";
  var IDS001;

  //BUSCAR ID DO USUARIO
  if (req.body.IDS001 !== undefined){
    IDS001 = req.body.IDS001;
  }
  else if (req.headers.ids001 !== undefined){
    IDS001 = req.headers.ids001;
  }

  var query = `'([^,]+)(,\\1)*(,|$)', '\\1\\3'`;

  var strSql = `    Select  H006.IDH006,
                    MIN(To_Char(H007.HoInicio,'dd/mm/yyyy')) as dt,
                    MIN(To_Char(H007.HoInicio,'hh24:mi')) as HoInicio,
                    To_Char(H008.HOOPERAC,'hh24:mi') as CHECKIN,
                    H006.IDG028,
                    G028.NMARMAZE,
                    G028.TPBALANC,
                    H006.STAGENDA,
                    H006.IDH002,
                    H006.TPOPERAC,
                    H006.TPPESAGE,
                    H002.DSTIPCAR,
                    H006.TPMOVTO,
                    H006.IDG024,
                    G024.NMTRANSP,
                    H006.QTSLOTS,
                    H006.NRNFCARG,
                    H006.IDG030,
                    G030.DSTIPVEI,
                    H006.IDG005,
                    H006.QTPESO,
                    H006.PESCOMP1,
                    H006.PESCOMP2,
                    --G032.NRPLAVEI,              -- NRO DA PLACA DO VEICULO
                    H006.NRPLAVEI,                -- NRO DA PLACA DO VEICULO
                    H006.IDG031,
                    H006.IDH003,
                    H006.IDG032,
                    H006.NRPLARE1,
                    H006.NRPLARE2,
                    H006.TXOBSAGE,
                    H006.SNIMPMAP,
                    H006.NRREGIST,
                    H006.NRTUSAP,
                    H006.IDS001,
                    H006.IDG046,
                    H006.LSNOTAS,
                    H006.IDBOX,
                    H006.NUMNAM,
                    H006.CDLACRE,
                    H006.CDCONTAI,
                    G046.DSCARGA,
                    G046.DTPSMANU,
                    G046.TPMODCAR,
                    H006.QTTEMPRE,
                    G031.CJMOTORI,				      	--CPF DO MOTORISTA
                    G031.NRREGMOT,					      --CNH DO MOTORISTA
                    G031.RGMOTORI,                --RG DO MOTORISTA
                    G031.NMMOTORI,
                    G032.DSVEICUL,                --DESCRIÇÂO DO VEICULO
                    G032.NRFROTA,                 --FROTA
                    H005.NRJANELA,                --NUMERO DA JANELA
                    G030.DSTIPVEI,
                    G005F.NMCLIENT AS FORNECED,
                    (
                      SELECT 
                        LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005 
                      FROM
                      (
                        SELECT DISTINCT G005.NMCLIENT
                        FROM H019 
                        INNER JOIN G005 
                          ON H019.IDG005 = G005.IDG005
                        WHERE H019.IDH006 = H006.IDH006
                          AND H019.SNDELETE = 0
                      )
                    ) AS TOMADOR,
                    MAX(OBSAGEN.TXOBSERV) OBSAGEN,
                    MAX(OBSCHEC.TXOBSERV) OBSCHEC,
                    MAX(OBSENTR.TXOBSERV) OBSENTR,
                    MAX(OBSENTR.TXOBSERV) OBSINOP,
                    MAX(OBSENTR.TXOBSERV) OBSFNOP,
                    MAX(OBSENTR.TXOBSERV) OBSSAIU,
                    CASE
                      WHEN H022.TPMATERI = 'CS' THEN 'Carga Seca'
                      WHEN H022.TPMATERI = 'GL' THEN 'Granel Liquido'
                      WHEN H022.TPMATERI = 'EM' THEN 'Embalagens'
                      WHEN H022.TPMATERI = 'TO' THEN 'Toller'
                    END TPMATERI,
                    H006.AUTORIZA,
                    H006.PRSERVIC,
                    (SELECT LISTAGG(H022.DSMATERI || '- COD: ' || H022.CDMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI) FROM H023 INNER JOIN H022 ON H023.IDH022 = H022.IDH022 WHERE H006.IDH006 = H023.IDH006) AS PRODUTOS,
                    (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'E' AND SNDELETE = 0) QTDPSENT,
                    (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'S' AND SNDELETE = 0) QTDPSSAI,
                    (SELECT SUM(LIBERADO) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'S' AND SNDELETE = 0 AND LIBERADO IS NOT NULL) LIBERASAI
                From H006 H006
                Left Join H007 H007 on ( H007.IdH006 = H006.IdH006 )
                Left Join H005 H005 on ( H007.IdH005 = H005.IdH005 )
                Left Join H002 H002 on ( H006.IdH002 = H002.IdH002 )
                Left Join G024 G024 on ( H006.IDG024 = G024.IDG024 )
                Left Join G028 G028 on ( H006.IDG028 = G028.IDG028 )
                Left Join G030 G030 on ( H006.IDG030 = G030.IDG030 )
                Left Join G031 G031 on ( H006.IDG031 = G031.IDG031 )
                Left Join G032 G032 on ( H006.NRPLAVEI = G032.NRPLAVEI )
                Left Join H019 H019 on ( H019.IDH006 = H006.IDH006 AND H019.SNDELETE = 0 )
                Left Join G005 G005 on ( H019.IDG005 = G005.IDG005 )
                Left Join G005 G005F on ( H006.FORNECED = G005F.IDG005 )
                Left Join G030 G030 on ( G030.IDG030 = G032.IDG030 )
                Left Join G046 G046 on ( H006.IDG046 = G046.IDG046 )
                Left Join (SELECT MAX(H023.IDH022), H023.IDH022, H023.IDH006 FROM H023 GROUP BY H023.IDH022, H023.IDH006) H023 ON H023.IDH006 = H006.IDH006
                Left Join (SELECT H022.IDH022, H022.TPMATERI FROM H022) H022 ON H022.IDH022 = H023.IDH022
                Left Join (SELECT IDH006, MAX(HOOPERAC) AS HOOPERAC FROM H008 WHERE STAGENDA = 4 GROUP BY IDH006) H008 ON ( H008.IDH006 = H006.IDH006)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSAGEN on ( OBSAGEN.IDH006 = H006.IDH006 AND OBSAGEN.STAGENDA = 3)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSCHEC on ( OBSCHEC.IDH006 = H006.IDH006 AND OBSCHEC.STAGENDA = 4)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSENTR on ( OBSENTR.IDH006 = H006.IDH006 AND OBSENTR.STAGENDA = 5)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSINOP on ( OBSINOP.IDH006 = H006.IDH006 AND OBSINOP.STAGENDA = 6)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSFNOP on ( OBSFNOP.IDH006 = H006.IDH006 AND OBSFNOP.STAGENDA = 7)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSSAIU on ( OBSSAIU.IDH006 = H006.IDH006 AND OBSSAIU.STAGENDA = 8)
                Where H006.SnDelete = 0
                And H006.STAGENDA IN (4,12) 
                And H006.IDG028 IN (${req.body.IDG028})
                AND H007.HoInicio IS NOT NULL
                ${filtro}
                GROUP BY H006.IDH006,
                  H006.IDG028,
                  H008.HOOPERAC,
                  G028.NMARMAZE,
                  G028.TPBALANC,
                  H006.STAGENDA,
                  H006.IDH002,
                  H006.TPOPERAC,
                  H006.TPPESAGE,
                  H002.DSTIPCAR,
                  H006.TPMOVTO,
                  H006.IDG024,
                  G024.NMTRANSP,
                  H006.QTSLOTS,
                  H006.NRNFCARG,
                  H006.IDG030,
                  G030.DSTIPVEI,
                  H006.IDG005,
                  H006.QTPESO,
                  H006.PESCOMP1,
                  H006.PESCOMP2,
                  H006.NRPLAVEI,
                  H006.IDG031,
                  H006.IDH003,
                  H006.IDG032,
                  H006.NRPLARE1,
                  H006.NRPLARE2,
                  H006.TXOBSAGE,
                  H006.SNIMPMAP,
                  H006.NRREGIST,
                  H006.NRTUSAP,
                  H006.IDS001,
                  H006.IDG046,
                  H006.LSNOTAS,
                  H006.IDBOX,
                  H006.NUMNAM,
                  H006.CDLACRE,
                  H006.CDCONTAI,
                  G005F.NMCLIENT,
                  G046.DSCARGA,
                  G046.DTPSMANU,
                  G046.TPMODCAR,
                  H006.QTTEMPRE,
                  G031.CJMOTORI,
                  G031.NRREGMOT,
                  G031.RGMOTORI,
                  G031.NMMOTORI,
                  H005.NRJANELA,
                  G032.DSVEICUL,
                  G032.NRFROTA,
                  H022.TPMATERI,
                  H006.AUTORIZA,
                  H006.PRSERVIC
                ORDER BY HOINICIO, STAGENDA
            `

  return await db.execute(
    {
      sql: strSql,
      param: [],
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

  logger.debug("Fim buscar");
};

    /**
   * @description Busca um dado na tabela H006.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.buscarAvancadaAgendamento = async function (req, res, next) {

  logger.debug("Inicio buscar");
  var agendamento = '';
  var placa  = '';
  var placa1 = '';
  var placa2 = '';
  var obs    = '';

  if(req.body.IDH006){
    agendamento = `And H006.IDH006 = ${req.body.IDH006}`
  }
  if(req.body.NRPLAVEI){
    placa = `And H006.IDH006 = ${req.body.NRPLAVEI}`
  }
  if(req.body.NRPLARE1){
    placa1 = `And H006.IDH006 = ${req.body.NRPLARE1}`
  }
  if(req.body.NRPLARE2){
    placa2 = `And H006.IDH006 = ${req.body.NRPLARE2}`
  }
  if(req.body.TXOBSAGE){
    obs = `And H006.TXOBSAGE LIKE '%${req.body.TXOBSAGE}%'`
  }
  
  var sqlAcl = "";
  var IDS001;

  //BUSCAR ID DO USUARIO
  if (req.body.IDS001 !== undefined){
    IDS001 = req.body.IDS001;
  }
  else if (req.headers.ids001 !== undefined){
    IDS001 = req.headers.ids001;
  }

  var query = `'([^,]+)(,\\1)*(,|$)', '\\1\\3'`;

  var strSql = `    Select  H006.IDH006,
                    MIN(To_Char(H007.HoInicio,'dd/mm/yyyy')) as dt,
                    MIN(To_Char(H007.HoInicio,'hh24:mi')) as HoInicio,
                    To_Char(H008.HOOPERAC,'hh24:mi') as CHECKIN,
                    H006.IDG028,
                    G028.NMARMAZE,
                    G028.TPBALANC,
                    H006.STAGENDA,
                    H006.IDH002,
                    H006.TPOPERAC,
                    H006.TPPESAGE,
                    H002.DSTIPCAR,
                    H006.TPMOVTO,
                    H006.IDG024,
                    G024.NMTRANSP,
                    H006.QTSLOTS,
                    H006.NRNFCARG,
                    H006.IDG030,
                    G030.DSTIPVEI,
                    H006.IDG005,
                    H006.QTPESO,
                    H006.PESCOMP1,
                    H006.PESCOMP2,
                    --G032.NRPLAVEI,              -- NRO DA PLACA DO VEICULO
                    H006.NRPLAVEI,                -- NRO DA PLACA DO VEICULO
                    H006.IDG031,
                    H006.IDH003,
                    H006.IDG032,
                    H006.NRPLARE1,
                    H006.NRPLARE2,
                    H006.TXOBSAGE,
                    H006.SNIMPMAP,
                    H006.NRREGIST,
                    H006.NRTUSAP,
                    H006.IDS001,
                    H006.IDG046,
                    H006.LSNOTAS,
                    H006.IDBOX,
                    H006.NUMNAM,
                    G046.DSCARGA,
                    G046.DTPSMANU,
                    G046.TPMODCAR,
                    H006.QTTEMPRE,
                    G031.CJMOTORI,				      	--CPF DO MOTORISTA
                    G031.NRREGMOT,					      --CNH DO MOTORISTA
                    G031.RGMOTORI,                --RG DO MOTORISTA
                    G031.NMMOTORI,
                    G032.DSVEICUL,                --DESCRIÇÂO DO VEICULO
                    G032.NRFROTA,                 --FROTA
                    H005.NRJANELA,                --NUMERO DA JANELA
                    G030.DSTIPVEI,
                    G005F.NMCLIENT AS FORNECED,
                    (
                      SELECT 
                        LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005 
                      FROM
                      (
                        SELECT DISTINCT G005.NMCLIENT
                        FROM H019 
                        INNER JOIN G005 
                          ON H019.IDG005 = G005.IDG005
                        WHERE H019.IDH006 = H006.IDH006
                          AND H019.SNDELETE = 0
                      )
                    ) AS TOMADOR,
                    MAX(OBSAGEN.TXOBSERV) OBSAGEN,
                    MAX(OBSCHEC.TXOBSERV) OBSCHEC,
                    MAX(OBSENTR.TXOBSERV) OBSENTR,
                    MAX(OBSENTR.TXOBSERV) OBSINOP,
                    MAX(OBSENTR.TXOBSERV) OBSFNOP,
                    MAX(OBSENTR.TXOBSERV) OBSSAIU,
                    CASE
                      WHEN H022.TPMATERI = 'CS' THEN 'Carga Seca'
                      WHEN H022.TPMATERI = 'GL' THEN 'Granel Liquido'
                      WHEN H022.TPMATERI = 'EM' THEN 'Embalagens'
                      WHEN H022.TPMATERI = 'TO' THEN 'Toller'
                    END TPMATERI,
                    H006.AUTORIZA,
                    H006.PRSERVIC,
                    (SELECT LISTAGG(H022.DSMATERI || '- QTD: ' || H023.QTMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI) FROM H023 INNER JOIN H022 ON H023.IDH022 = H022.IDH022 WHERE H006.IDH006 = H023.IDH006) AS PRODUTOS,
                    (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'E' AND SNDELETE = 0) QTDPSENT,
                    (SELECT COUNT(IDH006) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'S' AND SNDELETE = 0) QTDPSSAI,
                    (SELECT SUM(LIBERADO) FROM H021 WHERE IDH006 = H006.IDH006 AND TPMOVTO = 'S' AND SNDELETE = 0 AND LIBERADO IS NOT NULL) LIBERASAI
                From H006 H006
                Left Join H007 H007 on ( H007.IdH006 = H006.IdH006 )
                Left Join H005 H005 on ( H007.IdH005 = H005.IdH005 )
                Left Join H002 H002 on ( H006.IdH002 = H002.IdH002 )
                Left Join G024 G024 on ( H006.IDG024 = G024.IDG024 )
                Left Join G028 G028 on ( H006.IDG028 = G028.IDG028 )
                Left Join G030 G030 on ( H006.IDG030 = G030.IDG030 )
                Left Join G031 G031 on ( H006.IDG031 = G031.IDG031 )
                Left Join G032 G032 on ( H006.NRPLAVEI = G032.NRPLAVEI )
                Left Join H019 H019 on ( H019.IDH006 = H006.IDH006 AND H019.SNDELETE = 0 )
                Left Join G005 G005 on ( H019.IDG005 = G005.IDG005 )
                Left Join G005 G005F on ( H006.FORNECED = G005F.IDG005 )
                Left Join G030 G030 on ( G030.IDG030 = G032.IDG030 )
                Left Join G046 G046 on ( H006.IDG046 = G046.IDG046 )
                Left Join (SELECT MAX(H023.IDH022), H023.IDH022, H023.IDH006 FROM H023 GROUP BY H023.IDH022, H023.IDH006) H023 ON H023.IDH006 = H006.IDH006
                Left Join (SELECT H022.IDH022, H022.TPMATERI FROM H022) H022 ON H022.IDH022 = H023.IDH022
                Left Join (SELECT IDH006, MAX(HOOPERAC) AS HOOPERAC FROM H008 WHERE STAGENDA = 4 GROUP BY IDH006) H008 ON ( H008.IDH006 = H006.IDH006)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSAGEN on ( OBSAGEN.IDH006 = H006.IDH006 AND OBSAGEN.STAGENDA = 3)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSCHEC on ( OBSCHEC.IDH006 = H006.IDH006 AND OBSCHEC.STAGENDA = 4)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSENTR on ( OBSENTR.IDH006 = H006.IDH006 AND OBSENTR.STAGENDA = 5)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSINOP on ( OBSINOP.IDH006 = H006.IDH006 AND OBSINOP.STAGENDA = 6)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSFNOP on ( OBSFNOP.IDH006 = H006.IDH006 AND OBSFNOP.STAGENDA = 7)
                Left Join (SELECT IDH006, TXOBSERV, STAGENDA FROM H008 GROUP BY TXOBSERV, IDH006, STAGENDA) OBSSAIU on ( OBSSAIU.IDH006 = H006.IDH006 AND OBSSAIU.STAGENDA = 8)
                Where H006.SnDelete = 0 AND H006.IDG028 IN (11, 281, 282, 283, 284, 286)
                ${agendamento}
                ${obs}
                GROUP BY H006.IDH006,
                  H006.IDG028,
                  H008.HOOPERAC,
                  G028.NMARMAZE,
                  G028.TPBALANC,
                  H006.STAGENDA,
                  H006.IDH002,
                  H006.TPOPERAC,
                  H006.TPPESAGE,
                  H002.DSTIPCAR,
                  H006.TPMOVTO,
                  H006.IDG024,
                  G024.NMTRANSP,
                  H006.QTSLOTS,
                  H006.NRNFCARG,
                  H006.IDG030,
                  G030.DSTIPVEI,
                  H006.IDG005,
                  H006.QTPESO,
                  H006.PESCOMP1,
                  H006.PESCOMP2,
                  H006.NRPLAVEI,
                  H006.IDG031,
                  H006.IDH003,
                  H006.IDG032,
                  H006.NRPLARE1,
                  H006.NRPLARE2,
                  H006.TXOBSAGE,
                  H006.SNIMPMAP,
                  H006.NRREGIST,
                  H006.NRTUSAP,
                  H006.IDS001,
                  H006.IDG046,
                  H006.LSNOTAS,
                  H006.IDBOX,
                  H006.NUMNAM,
                  G005F.NMCLIENT,
                  G046.DSCARGA,
                  G046.DTPSMANU,
                  G046.TPMODCAR,
                  H006.QTTEMPRE,
                  G031.CJMOTORI,
                  G031.NRREGMOT,
                  G031.RGMOTORI,
                  G031.NMMOTORI,
                  H005.NRJANELA,
                  G032.DSVEICUL,
                  G032.NRFROTA,
                  H022.TPMATERI,
                  H006.AUTORIZA,
                  H006.PRSERVIC
                ORDER BY HOINICIO, STAGENDA
            `

      return await db.execute(
        {
          sql: strSql,
          param: [],
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

      logger.debug("Fim buscar");
    };
  /**
   * @description Listar um dados da tabela H005.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
  api.buscarAgendamentosGrid = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      var sqlAcl = "";
      var IDS001;
  
      //BUSCAR ID DO USUARIO
      if (req.body.IDS001 !== undefined){
        IDS001 = req.body.IDS001;
      }
      else if (req.headers.ids001 !== undefined){
        IDS001 = req.headers.ids001;
      }

      if (IDS001 !== undefined) {
        sqlAcl = await acl.montar({
            ids001: IDS001,
            dsmodulo: 'HORA-CERTA',
            nmtabela: [{ G024: 'G024' }, {G028: 'G028'}, {G005:'G005'}],
            //dioperad: ' ',
            esoperad: 'AND'
        });
      }else{
        sqlAcl = ' AND 1=0'
      }

      
      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H006',true);
      

      // if(req.body.STAGENDA == ""){
      //   filtro = `Where H006.SnDelete = 0 And H006.STAGENDA = ${req.body.STAGENDA}`
      // }else{
      //   filtro = sqlWhere;
      // }

      var sql = ` Select  H006.IDH006,
      MIN(To_Char(H007.HoInicio,'dd/mm/yyyy')) as dt,
      MIN(To_Char(H007.HoInicio,'hh24:mi')) as HoInicio,
                        H006.IDG028,
                        H006.STAGENDA,
                        H006.IDH002,
                        H006.TPMOVTO,
                        H006.IDG024,
                        H006.QTSLOTS,
                        H006.NRNFCARG,
                        H006.IDG030,
                        H006.IDG005,
                        H006.QTPESO,
                        --G032.NRPLAVEI,              -- NRO DA PLACA DO VEICULO
                        H006.NRPLAVEI,                -- NRO DA PLACA DO VEICULO
                        H006.IDG031,
                        H006.IDH003,
                        H006.IDG032,
                        H006.NRPLARE1,
                        H006.NRPLARE2,
                        H006.TXOBSAGE,
                        H006.SNIMPMAP,
                        H006.NRREGIST,
                        H006.NRTUSAP,
                        H006.IDS001,
                        H006.IDG046,
                        H006.QTTEMPRE,
                        H006.IDBOX,
                        G031.CJMOTORI,				      	--CPF DO MOTORISTA
                        G031.NRREGMOT,					      --CNH DO MOTORISTA
                        G031.RGMOTORI,                --RG DO MOTORISTA
                        G031.NMMOTORI,
                        G032.DSVEICUL,   
                        G032.DSVEICUL AS TOMADOR,   
                        --G005.NMCLIENT,                 --TOMADOR             
                        COUNT(H006.IDH006) OVER () AS COUNT_LINHA,
                        H018.SNAPROV,
                        H018.ARQANEXO H018_ARQANEXO
                   From H006 H006
              Left Join H007 H007 on H007.IdH006 = H006.IdH006
              Left Join G032 G032 on ( H006.NRPLAVEI = G032.NRPLAVEI )
              Left Join G024 G024 on ( H006.IDG024 = G024.IDG024 )
              Left Join G031 G031 on ( H006.IDG031 = G031.IDG031 )
              Left Join H019 H019 on ( H019.IDH006 = H006.IDH006 )
              Left Join G005 G005 on ( H019.IDG005 = G005.IDG005 )
              Left Join G028 G028 on ( H006.IDG028 = H006.IDG028 )
              Left Join H018 H018 on ( H018.IDH006 = H006.IDH006 ) 
                  ${sqlWhere} ${sqlAcl}
                  GROUP BY H006.IDH006,
                      H006.IDG028,
                      H006.STAGENDA,
                      H006.IDH002,
                      H006.TPMOVTO,
                      H006.IDG024,
                      H006.QTSLOTS,
                      H006.NRNFCARG,
                      H006.IDG030,
                      H006.IDG005,
                      H006.QTPESO,
                      H006.NRPLAVEI,
                      H006.IDG031,
                      H006.IDH003,
                      H006.IDG032,
                      H006.NRPLARE1,
                      H006.NRPLARE2,
                      H006.TXOBSAGE,
                      H006.SNIMPMAP,
                      H006.NRREGIST,
                      H006.NRTUSAP,
                      H006.IDS001,
                      H006.IDG046,
                      H006.QTTEMPRE,
                      H006.IDBOX,
                      G031.CJMOTORI,				      	--CPF DO MOTORISTA
                      G031.NRREGMOT,					      --CNH DO MOTORISTA
                      G031.RGMOTORI,                --RG DO MOTORISTA
                      G031.NMMOTORI,
                      G032.DSVEICUL,
                      H018.SNAPROV,
                      H018.ARQANEXO                                
                      --G005.NMCLIENT                --TOMADOR
                      `+
                sqlOrder +
                sqlPaginate;
      
      let result = await con.execute(
        {
          sql,
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

    /**
   * @description Listar um dados da tabela H005.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
 api.buscarAgendamentosNotas = async function (req, res, next) {

  logger.debug("Inicio listar");
  let con = await this.controller.getConnection();

  try {

    var sqlAcl = "";
    var IDS001;

    //BUSCAR ID DO USUARIO
    if (req.body.IDS001 !== undefined){
      IDS001 = req.body.IDS001;
    }
    else if (req.headers.ids001 !== undefined){
      IDS001 = req.headers.ids001;
    }

    if (IDS001 !== undefined) {
      sqlAcl = await acl.montar({
          ids001: IDS001,
          dsmodulo: 'HORA-CERTA',
          nmtabela: [{ G024: 'G024' }, {G028: 'G028'}, {G005:'G005'}],
          //dioperad: ' ',
          esoperad: 'AND'
      });
    }else{
      sqlAcl = ' AND 1=0'
    }

    let arrSqlAux = ['', `WHERE NTA.IDH006 IS NOT NULL`, `WHERE NTA.IDH006 IS NULL`];
    let sqlAux    = (req.body['parameter[SNAGENDA][id]']) ? arrSqlAux[req.body['parameter[SNAGENDA][id]']] : '';

    delete req.body['parameter[SNAGENDA][id]'];
    delete req.body['parameter[SNAGENDA][text]'];

    var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G043',true);

    var sql = `SELECT NTA.IDG043            NTA_IDG043
                    , NTA.NRNOTA            NTA_NRNOTA
                    , NTA.IDH006            NTA_IDH006
                    , NTA.IDG046            NTA_IDG046
                    , NTA.DTEMINOT          NTA_DTEMINOT
                    , NTA.NMCLIENT          NTA_NMCLIENT
                    , NTA.STAGENDA          NTA_STAGENDA
                    , NTA.CIDADEUF          NTA_CIDADEUF
                    , NTA.TOMADOR           NTA_TOMADOR
                    , NTA.PSBRUTO           NTA_PSBRUTO
                    , NTA.VRDELIVE          NTA_VRDELIVE
                    , NTA.IDG028            NTA_IDG028
                    , NTA.STCARGA           NTA_STCARGA
                    , COUNT (*) OVER () AS COUNT_LINHA

                FROM (
                      SELECT
                            DISTINCT(G043.IDG043)                                                 IDG043
                          , G043.NRNOTA                                                           NRNOTA
                          , H006.IDH006                                                           IDH006
                          , G046.IDG046                                                           IDG046
                          , G043.DTEMINOT                                                         DTEMINOT
                          , G005.NMCLIENT                                                         NMCLIENT
                          , H006.STAGENDA                                                         STAGENDA
                          , G003.NMCIDADE || '/' || G002.CDESTADO                            AS   CIDADEUF
                          , G005.NMCLIENT || ' - ' || G003.NMCIDADE || '/' || G002.CDESTADO  AS   TOMADOR
                          , G043.PSBRUTO                                                          PSBRUTO
                          , G043.VRDELIVE                                                         VRDELIVE
                          , G057.IDG028                                                           IDG028
                          , G046.STCARGA                                                          STCARGA
                          FROM G043 G043
                    INNER JOIN G005 G005 ON G043.IDG005DE = G005.IDG005
                    INNER JOIN G003 G003 ON G003.IDG003   = G005.IDG003
                    INNER JOIN G002 G002 ON G002.IDG002   = G003.IDG002
                    INNER JOIN G057 G057 ON G043.IDG043   = G057.IDG043
                    LEFT JOIN G028 G028 ON G028.IDG028    = G057.IDG028
                    LEFT JOIN G024 G024 ON G024.IDG024    = G043.IDG024TR
                    LEFT JOIN G049 G049 ON G049.IDG043    = G043.IDG043
                    LEFT JOIN G048 G048 ON G048.IDG048    = G049.IDG048
                    LEFT JOIN G046 G046 ON G046.IDG046    = G048.IDG046
                    LEFT JOIN H024 H024 ON H024.IDG046    = G046.IDG046
                    LEFT JOIN H006 H006 ON H006.IDH006    = H024.IDH006
                      ${sqlWhere} ${sqlAcl}
                ) NTA ${sqlAux} ${sqlOrder} ${sqlPaginate}`;

    let result = await con.execute(
      {
        sql,
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

  /**
   * @description Busca um dado na tabela H006.
   *
   * @async
   * @function api/buscarMontarCarga
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarMontarCarga = async function (req, res, next) {

    //var transp = await api.buscarTranspGrade(req,res,next);

    var filtros = "";

    if( req.body.IDG028 && req.body.IDG028.hasOwnProperty('id')){   filtros =  filtros +` And G057.IDG028 IN (${req.body.IDG028.id}) ` }; //ID Armazem
    if( req.body.IDG005TO && req.body.IDG005TO.hasOwnProperty('id')){ filtros =  filtros + ` And G043.IDG005TO IN (${req.body.IDG005TO.id}) ` }; //ID Tomador
    if( req.body.IDG024 && req.body.IDG024.hasOwnProperty('id')){ filtros =  filtros+ ` And G043.IDG024TR IN (${req.body.IDG024.id}) ` }; //ID Transportadora
    if( req.body.NRNOTA){filtros =  filtros+ ` And G043.NRNOTA IN (${req.body.NRNOTA}) `}; //ID Notas

    var sqlAcl = "";
    var IDS001;

    //BUSCAR ID DO USUARIO
    if (req.body.IDS001 !== undefined){
      IDS001 = req.body.IDS001;
    }
    else if (req.headers.ids001 !== undefined){
      IDS001 = req.headers.ids001;
    }

    if (IDS001 !== undefined) {
      sqlAcl = await acl.montar({
          ids001: IDS001,
          dsmodulo: 'HORA-CERTA',
          nmtabela: [{ G024: 'G024' }, {G028: 'G028'}],
          //dioperad: ' ',
          esoperad: 'AND'
      });
    }else{
      sqlAcl = ' AND 1=0'
    }

    logger.debug("Inicio buscar");
    
    logger.debug("Parametros recebidos:", req.body);

    var sql = `
                  select	G043.IDG043,
                  G043.TPDELIVE,
                  G043.CDDELIVE,
                  G043.DTLANCTO,
                  g043.DTEMINOT,
                  DEST.NMCLIENT   AS DESTINATARIO,
                  REMET.NMCLIENT  AS REMETENTE,
                  G043.PSBRUTO,
                  G043.VRDELIVE,
                  G043.NRNOTA,
                  G043.IDG024TR   AS ID_TRANSPORT,	--ID DA TRANSPORTADORA
                  G024.NMTRANSP,
                  G043.IDG005DE,   
                  G043.IDG005RE ,  
                  G043.DTENTCON   AS DT_CONTRAT,		--DATA DE ENTREGA CONTRATUAL
                  G057.IDG028     AS ID_ARMAZE,		  --ID DO ARMAZEM
                  G028.NMARMAZE,
                  DEST.IDG003     AS ID_CID_DEST,
                  DECID.NMCIDADE  AS NM_CID_DEST,
                  ESTDE.CDESTADO  AS CD_EST_DEST,
                  REMET.IDG003    AS ID_CID_REMET,
                  RECID.NMCIDADE  AS NM_CID_REMET,
                  ESTRE.CDESTADO  AS CD_EST_REMET
                  FROM G043 G043
                    INNER JOIN G057
                      ON G043.IDG043 = G057.IDG043
                    LEFT JOIN G005 DEST
                      ON DEST.IDG005 = G043.IDG005DE
                    LEFT JOIN G005 REMET
                      ON REMET.IDG005 = G043.IDG005RE
                    LEFT JOIN G003 DECID
                      ON DEST.IDG003 = DECID.IDG003
                    LEFT JOIN G003 RECID
                      ON REMET.IDG003 = RECID.IDG003
                    LEFT JOIN G002 ESTDE
                      ON ESTDE.IDG002 = DECID.IDG002
                    LEFT JOIN G002 ESTRE
                      ON ESTRE.IDG002 = RECID.IDG002  
                    LEFT JOIN G024 
                      ON G024.IDG024 = G043.IDG024TR
                    INNER JOIN G057 
                      ON G057.IDG043 = G043.IDG043
                    LEFT JOIN G028 
                      ON G028.IDG028 = G057.IDG028
                        WHERE G057.TPFINALI = 'A'
                        AND G057.STFINALI = 0
                        AND G043.SNDELETE = 0
                        ${sqlAcl} ${filtros}
                    `

    return await db.execute(
      {
        sql,
        param: [],
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

    logger.debug("Fim buscar");
  };

  /**
   * @description Busca  dados para montar a tela de pesquisa de notas.
   * nas tabelas:  G043, G057, G005, G002, G028, G024, G002
   *
   * @async
   * @function api/buscarMontarCargaGrid
   * @author Everton Pessoa
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarMontarCargaGrid = async function (req, res, next) {

    var filtros = "";
    var sqlAcl = "";
    var IDS001;

    //BUSCAR ID DO USUARIO
     if (req.body.IDS001 !== undefined){
       IDS001 = req.body.IDS001;
     }
     else if (req.headers.ids001 !== undefined){
       IDS001 = req.headers.ids001;
     }

     if (IDS001 !== undefined) {
       sqlAcl = await acl.montar({
          ids001: IDS001,
           dsmodulo: 'HORA-CERTA',
           nmtabela: [{ G024: 'G024' }, {G028: 'G028'}],
           //dioperad: ' ',
           esoperad: 'AND'
       });
     }else{
       sqlAcl = ' AND 1=0'
     }

    var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G043',true);

    logger.debug("Inicio buscar");
    
    logger.debug("Parametros recebidos:", req.body);

    var sql = `
                  select	G043.IDG043,
                  G043.CDDELIVE,
                  G043.DTLANCTO,
                  g043.DTEMINOT   AS G043_DTEMINOT,
                  DEST.NMCLIENT   AS DESTINATARIO,
                  REMET.NMCLIENT  AS REMETENTE,
                  G043.PSBRUTO,
                  G043.VRDELIVE,
                  G043.NRNOTA     AS G043_NRNOTA,
                  G043.IDG024TR   AS G043_IDG024TR,	--ID DA TRANSPORTADORA
                  G024.NMTRANSP,
                  G057.STFINALI   AS G057_STFINALI, --STATUS DE NOTA
                  G043.IDG005DE,   
                  G043.IDG005RE,
                  G043.IDG005TO   AS G043_IDG005TO,
                  G005.NMCLIENT,
                  G043.DTENTCON   AS DT_CONTRAT,		--DATA DE ENTREGA CONTRATUAL
                  G057.IDG028     AS G057_IDG028,		--ID DO ARMAZEM
                  G028.NMARMAZE   AS G028_NMARMAZE, --NOME DO ARMAZEM
                  DEST.IDG003     AS ID_CID_DEST,
                  DECID.NMCIDADE  AS NM_CID_DEST,
                  ESTDE.CDESTADO  AS CD_EST_DEST,
                  REMET.IDG003    AS ID_CID_REMET,
                  RECID.NMCIDADE  AS NM_CID_REMET,
                  ESTRE.CDESTADO  AS CD_EST_REMET,
                  COUNT(G043.IDG043) OVER () AS COUNT_LINHA
                  FROM G043 G043
                    INNER JOIN G057
                      ON G043.IDG043 = G057.IDG043
                    LEFT JOIN G005 DEST
                      ON DEST.IDG005 = G043.IDG005DE
                    LEFT JOIN G005 REMET
                      ON REMET.IDG005 = G043.IDG005RE
                    LEFT JOIN G003 DECID
                      ON DEST.IDG003 = DECID.IDG003
                    LEFT JOIN G003 RECID
                      ON REMET.IDG003 = RECID.IDG003
                    LEFT JOIN G002 ESTDE
                      ON ESTDE.IDG002 = DECID.IDG002
                    LEFT JOIN G002 ESTRE
                      ON ESTRE.IDG002 = RECID.IDG002  
                    LEFT JOIN G024 
                      ON G024.IDG024 = G043.IDG024TR
                    INNER JOIN G057 
                      ON G057.IDG043 = G043.IDG043
                    LEFT JOIN G028 
                      ON G028.IDG028 = G057.IDG028
                    LEFT JOIN G005
                      ON G043.IDG005TO = G005.IDG005  
                        ${sqlWhere} 
                        AND G057.TPFINALI = 'A'
                        ${sqlAcl} ${filtros}
                    ` +
                    sqlOrder +
                    sqlPaginate;

    return await db.execute(
      {
        sql,
        param: bindValues,
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

    logger.debug("Fim buscar");
  };


  /**
   * @description Busca um dado na tabela H006.
   *
   * @async
   * @function api/mudarStFinali
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.mudarStFinali = async function (req, res, next) {

    logger.debug("Inicio buscar");

    logger.debug("Parametros recebidos:", req.body);

    req.sql = `
                  Update G057
                    Set G057.STFINALI = ${req.STFINALI}
                  Where G057.IDG043 IN (${req.IDG043.join()})
                  `

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });

    logger.debug("Fim buscar");
  };

  /**
   * @description Altera um dado na tabela H006.
   *
   * @async
   * @function api/salvarBox
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.salvarBox = async function (req, res, next) {

  logger.debug("Inicio Salvar BOX");

  logger.debug("Parametros recebidos:", req.body);

  var sql = `
                Update H006
                  Set IDBOX = ${req.body.IDBOX}
                Where IDH006 = ${req.body.IDH006}
                `

  return await db.execute(
    {
      sql,
      param: [],
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

  logger.debug("Fim Salvar BOX");
};

  /**-----------------------------------------------------------------------
   * @description Busca os tomadores de um agendamento na tabela H019
   *
   * @async
   * @function api/buscarTomador
   * @param {request} req - Possui o IDH006 do agendamento.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   *-----------------------------------------------------------------------*/

  api.buscarTomador = async function (req, res, next) {

    logger.debug("Inicio buscar tomador");

    let IDH006;
    if(req.body == undefined){
      IDH006 = req.IDH006
    } else {
      IDH006 = req.body.IDH006;
    }

    logger.debug("Parametros recebidos:", IDH006);

    var sql = `
                SELECT
                    LISTAGG(IDG005, ',') WITHIN GROUP(ORDER BY IDG005) IDG005,
                    LISTAGG(NMCLIENT, ',') WITHIN GROUP(ORDER BY NMCLIENT) TOMADOR
                FROM
                    ( SELECT G005.IDG005, G005.NMCLIENT
                        FROM H019
                      INNER JOIN G005 
                              ON G005.IDG005 = H019.IDG005 AND H019.SNDELETE = 0 AND H019.IDH006 = ${IDH006}
                        GROUP BY H019.IDH006, 
                                 G005.IDG005, 
                                 G005.NMCLIENT
                    )`

    return await db.execute(
      {
        sql,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        //Valida se tem ou não tomador, se não retorna um objeto vazio
        if(result[0] == undefined){
          result[0] = {TOMADOR: ''}
          return result;
        } else {
          return (result);
        }
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar tomadores");
  };

  /**-----------------------------------------------------------------------
   * @description Busca a ordem de Carregamento na tabela G049
   *
   * @async
   * @function api/buscarOrCarregamento
   * @param {request} req - Possui o IDG046 da carga.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   *-----------------------------------------------------------------------*/

  api.buscarOrCarregamento = async function (req, res, next) {

    logger.debug("Inicio buscar Ordem de Carregamento");

    logger.debug("Parametros recebidos:", req.body.IDG046);

    var sql = `
          SELECT G046.IDG046, G048.IDG048, G049.IDG043, G043.NRNOTA, G049.NRORDEM
              FROM G046
              LEFT JOIN G048 ON G048.IDG046 = G046.IDG046
              LEFT JOIN G049 ON G049.IDG048 = G048.IDG048
              LEFT JOIN G043 ON G049.IDG043 = G043.IDG043
              WHERE G046.IDG046 = ` + req.body.IDG046 + `
              `

    return await db.execute(
      {
        sql,
        param: [],
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

    logger.debug("Fim buscar Ordem de Carregamento");
  };

  /**
   * @description Salvar um dado na tabela H006.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvar = async function (req, res, next) {

    logger.debug("Inicio salvar");
  
    var slots = '';
    for (var key of req.body.idSlots) {
      slots += key + ','
    }

    var data = dtatu.tempoAtual('YYYY-MM-DD HH:mm:ss')

    var notas = '';
    for(var key in req.body.dadosCarga.notas){
      if((parseInt(key) + 1) < req.body.dadosCarga.notas.length){
        notas += req.body.dadosCarga.notas[key] + ',';
      } else {
        notas += req.body.dadosCarga.notas[key];
      }
    }

    slots = slots.substr(0, slots.length - 1);

    var id = 0;


    logger.debug("Parametros recebidos:", req.body);
    //verificar se os slots estão livres
    let qtd = await db.execute(
      {
        sql: ` Select Count(IdH006) As Qtd 
                 From H007 H007 
                Where IdH007   In (`+ slots + `) 
                  And IdH006   Is Not Null
                  And StHorari Is Null`,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return (result[0].QTD);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    if (qtd > 0) {
      logger.error("If Slots indisponiveis");
      res.status(500);
      return { nrlogerr: -1, armensag: [req.__('hc.erro.slotsIndisponivel')] };
    }

    id = await db.insert({
      tabela: 'H006',
      colunas: {

        IDG028: req.body.dadosCarga.IDG028.id,
        //STAGENDA: req.body.STAGENDA,
        IDH002: req.body.dadosCarga.IDH002.id,
        TPMOVTO: req.body.dadosCarga.TPMOVTO, // carga decarga C/D
        IDG024: req.body.dadosCarga.IDG024.id,// 1,
        QTSLOTS: req.body.dadosCarga.numSlots,
        NRNFCARG: req.body.dadosCarga.IDG046, //id46
        IDG030: req.body.dadosCarga.IDG030.id,
        NRNFCARG: req.body.dadosCarga.NRNFCARG,
        /* IDG005:   req.body.IDG005, // tomador */
        QTPESO: req.body.dadosCarga.PSCARGA,
        NRPLAVEI: req.body.dadosCarga.NRPLAVEI,
        IDG031: req.body.dadosCarga.IDG031,
        /* IDH003:   req.body.IDH003, */
        /* IDG032: req.body.dadosCarga.IDG032.id, */
        NRPLARE1: req.body.dadosCarga.NRPLARE1,
        NRPLARE2: req.body.dadosCarga.NRPLARE2,
        TXOBSAGE: req.body.dadosCarga.obs,
        TPOPERAC: req.body.dadosCarga.TPOPERAC, //levar
        TPPESAGE: req.body.dadosCarga.TPPESAGE, //levar
        NTFISCA1: req.body.dadosCarga.NTFISCA1, //levar
        NTFISCA2: req.body.dadosCarga.NTFISCA2, //levar
        PESCOMP1: req.body.dadosCarga.PESCOMP1, //levar
        PESCOMP2: req.body.dadosCarga.PESCOMP2, //levar
        FORNECED: req.body.dadosCarga.FORNECED, //levar
        UNIDRECE: req.body.dadosCarga.UNIDRECE, //levar
        /* SNIMPMAP: req.body.SNIMPMAP, */
        /* NRREGIST: req.body.NRREGIST, */
        /* NRTUSAP:  req.body.NRTUSAP, */
        /* SNDELETE: req.body.SNDELETE, */
        IDS001: req.body.IDS001, //req.body.IDS001,
        IDG046: req.body.dadosCarga.IDG046, //id 16
        STAGENDA: 3, /*Reservado*/
        SNDELETE: 0,
        QTTEMPRE: req.body.dadosCarga.tempoOp,
        DTCADAST: tmz.dataAtualJS(),
        LSNOTAS: notas
      },
      key: 'IDH006'
    })
      .then(async (result1) => {

        req.body.IDH006 = result1;
        //LEVAR PARA AGENDAMENTO 2
        if(req.body.dadosCarga.produtos != undefined){
          for(i of req.body.dadosCarga.produtos){
            req.IDH006 = req.body.IDH006;
            req.IDH022 = i.IDH022;
            req.QTMATERI = i.QTMATERI;
            req.IDG009 = i.IDG009;
            
            await this.salvarMateriais(req, res, next).catch((err) => { throw err });
          }
        }

        var HOINICIO = await this.buscarHoinicio({idSlots:req.body.idSlots}, res, next);
        await this.mudarEtapa({IDS001: req.body.IDS001, IDH006: result1, ETAPA: 3, IDI015: null, HOINICIO: HOINICIO[0].HOINICIO}, res, next);
        
        if(req.body.dadosCarga.IDG046 != undefined && req.body.dadosCarga.IDG046 != null && req.body.dadosCarga.TPMOVTO.toUpperCase() == 'C'){
          await this.buscarDtEntCon({Dt:data, IDG046:req.body.dadosCarga.IDG046}, res, next);
        } 

        logger.debug("Retorno:", result1);
        return result1;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      }); 

    /*
      # Status delivery
      ####################################
      0 = Backlog,  1 = Otimizador,  
      2 = Oferecimento, 3 = Agendamento, 
      4 = Tracking, 5 = Encerrado, 
      6 = Ocorrência
      ####################################
    */

    let DTPSMANU; //Carga do Transportation

    logger.debug("Parametros recebidos:", req.body.dadosCarga.IDG046);
    //verificar se a carga é do transportation, critério se tiver preenchido o campo DTPSMANU
    if(req.body.dadosCarga.IDG046 != null){
      let buscarInfo = await db.execute(
        {
          sql: ` SELECT DTPSMANU 
                    FROM G046 
                    WHERE IDG046 = ` + req.body.dadosCarga.IDG046,
          param: [],
        })
        .then((result) => {
  
          logger.debug("Retorno:", result);
          DTPSMANU = result[0].DTPSMANU;
  
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    }

    logger.debug("Atribuindo StEtapa = 3 na G043");
    if (req.body.dadosCarga.IDG046 != '' && req.body.dadosCarga.IDG046 != null && req.body.dadosCarga.TPMOVTO !="D" && DTPSMANU == null) {
      await
        db.update({
          tabela: 'G043',
          colunas: {
            StEtapa: 3
          },
          condicoes: `idg043 in ( Select g049.idg043 
                                  From g046 g046 
                                  Join g048 g048 
                                    On g048.idg046 = g046.idg046
                                  Join g049 g049
                                    On g049.idg048 = g048.idg048
                                 Where g046.idg046 = `+ req.body.dadosCarga.IDG046 + `)`,
          parametros: {
          }
        })
          .then((result) => {

            logger.debug("Retorno:", result);

          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });


      logger.debug("Selecionando deliveries relacionadas com a carga agendada");

      let deliveries = await db.execute(
        {
          sql: `  Select Carga.Idg046,
                      Parada.Idg048,
                      To_Char(Min(Dh.Dtentcon), 'YYYY-MM-DD HH24:MI:SS') Dtentcon
                 From G046 Carga
                Inner Join G048 Parada
                   On Parada.Idg046 = Carga.Idg046
                Inner Join G049 Reldel
                   On Reldel.Idg048 = Parada.Idg048
                Inner Join G043 Dh
                   On Dh.Idg043 = Reldel.Idg043
                Where Carga.Idg046 = ${req.body.dadosCarga.IDG046}
                Group By Carga.Idg046, Parada.Idg048`,

          param: [],
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



      if (deliveries.length < 1) {

        logger.error("Nenhuma deliverie encontrada");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.deliveryNaoEncontrada')] };

      }


      logger.debug("Atribuindo parametros para salvarEventoEntrega");

      var data = dtatu.tempoAtual('YYYY-MM-DD HH:mm:ss')
      var parm = { idParada: deliveries[0].IDG048, idEvento: 9, dtEvento: data };

      logger.debug("Parametros enviados:", parm);

      await asnDAO.salvarEventoEntrega(parm, res, next);

      logger.debug("Fim salvarEventoEntrega");

      logger.debug("Parametros enviados:", parm);

      if (deliveries[0].DTENTCON != null) {

        logger.debug("Atribuindo DTPREATU na G048:", deliveries);

        for (let i = 0; i < deliveries.length; i++) {
          await db.execute(
            {
              sql: `Update G048
                       Set Dtpreatu = To_Date('${deliveries[i].DTENTCON}',
                                              'YYYY-MM-DD HH24:MI:SS')
                     Where Idg048 = ${deliveries[i].IDG048}`,
              param: [],
            })
            .then((result) => {

              logger.debug("Retorno:", result);

            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        }
      }

      logger.debug("Buscando data agenda");

      let pegarDataAgenda = await db.execute(
        {
          sql: `Select MIN(IDH007) AS IDH007, 
                       IDH006,
                       to_char(MIN(HOINICIO), 'dd/mm/yyyy hh24:mi:ss') AS HOINICIO,
                       to_char(MAX(HOFINAL), 'dd/mm/yyyy hh24:mi:ss') AS HOFINAL
                From h007  Where Idh007 In (`+ slots + `)
                Group by idh006
                   `,

                   
          param: [],
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

      logger.debug("Data encontrada:", pegarDataAgenda[0].HOFINAL);

      logger.debug("Atribuindo DTPRESAI na G046:", deliveries[0].IDG046);

      var NRPLARE1 = '';
      var NRPLARE2 = '';

      if(req.body.dadosCarga.NRPLARE1 != undefined){ 
        NRPLARE1 = req.body.dadosCarga.NRPLARE1
      };
      
      if(req.body.dadosCarga.NRPLARE2 != undefined){ 
        NRPLARE2 = req.body.dadosCarga.NRPLARE2
      };

      sql = `Update G046
            Set  DtPreSai = To_Date('`+ pegarDataAgenda[0].HOFINAL + `','DD/MM/YYYY HH24:MI:SS') ,
                STCARGA = 'S',
                NRPLAVEI = '${req.body.dadosCarga.NRPLAVEI}',
                NRPLARE1 = '${NRPLARE1}',
                NRPLARE2 = '${NRPLARE2}'
            Where Idg046 = ${deliveries[0].IDG046}`

      await db.execute(
        {
          sql,
          param: [],
        })
        .then((result) => {

          logger.debug("Retorno:", result);
          return result

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      // data de agenda
      var datinha = data;  //mudAndo data para atender o timezone correto => em caso de bug um a das opções é essa alteração ( anterior new date)

      logger.debug("Atribuindo DTAGENDA na G046:", req.body.dadosCarga.IDG046);

      await db.execute(
        {
          sql: `Update G046
                     Set DtAgenda = To_Date('${datinha}', 'YYYY-MM-DD HH24:MI:SS')
                   Where Idg046   = `+ req.body.dadosCarga.IDG046,
          param: [],
        })
        .then((result) => {

          logger.debug("Retorno:", result);

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    }

    if(DTPSMANU){
      await db.execute(
        {
          sql: `Update G046
                     Set STCARGA = 'S'
                   Where Idg046  = `+ req.body.dadosCarga.IDG046,
          param: [],
        })
        .then((result) => {

          logger.debug("Retorno:", result);

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    }

    logger.debug("Atribuindo IDH006 na H007:", slots);

    return await db.update({
      tabela: 'H007',
      colunas: {
        IDH006: id
      },
      condicoes: 'IdH007 In (' + slots + ')',
      parametros: {
        //id: slot
      }
    })
      .then((result1) => {

        logger.debug("Retorno:", result1);
        return id;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim salvar");
  };
  
   /**
   * @description Excluir um dado na tabela H006 e remove a ligação na H007.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.cancelarCarga4pl = async function (req, res, next) {

    logger.debug("Inicio excluir");

    var id         = req.body.IDH006;

    logger.debug("Buscando eventos etapa");

    /*
      # Status delivery
      ####################################
      0 = Backlog,  1 = Otimizador,  
      2 = Oferecimento, 3 = Agendamento, 
      4 = Tracking, 5 = Encerrado, 
      6 = Ocorrência
      ####################################
    */

    logger.debug("Busca Etapa delivery");

    let etapaDeliv = await db.execute(

      {
        sql: `Select StEtapa
                From G043 G043
               Where Idg043 In (Select G049.Idg043
                                  From G046 G046
                                  Join G048 G048
                                    On G048.Idg046 = G046.Idg046
                                  Join G049 G049
                                    On G049.Idg048 = G048.Idg048
                                 Where G046.IDG046 in (${req.body.IDG046}))`,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return (result[0].STETAPA);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
    
    if (etapaDeliv != 7) {

      logger.debug("Atribuindo StEtapa = 2 na G043:", id);

      await db.update({
        tabela: 'G043',
        colunas: {
          StEtapa: 2
        },
        condicoes: `idg043 in ( Select g049.idg043 
                                  From g046 g046 
                                  Join g048 g048 
                                    on g048.idg046 = g046.idg046
                                  Join g049 g049
                                    on g049.idg048 = g048.idg048
                                 Where G046.IDG046 in (${req.body.IDG046}))`,
        parametros: {
        }
      })
      .then((result) => {

        logger.debug("Retorno:", result);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
    }

    //mudar STCLI
    var sqlCommAnd = 
      `Update G048
        Set Stintcli = 0
        Where Idg046 in (${req.body.IDG046})
        `;

    await db.execute(
      {
          sql: sqlCommAnd,
          param: [],
      })
      .then((result) => {
          logger.debug("Retorno:", result);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
      });

    //mudar DTsaicar

    var sqlCommAnd = `
      Update G046
          Set Dtsaicar = Null,
          STCARGA = 'X'
          Where Idg046 in (${req.body.IDG046})
    `;
  
    await db.execute(
      {
          sql: sqlCommAnd,
          param: [],
      })
      .then((result) => {
          logger.debug("Retorno:", result);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
      });

    logger.debug("Fim excluir");
  };

  /**
   * @description Troca o status na tabela H006 e adiciona uma linha na H008.
   *
   * @async
   * @function api/trocarStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.trocarStatus = async function (req, res, next) {

  logger.debug("Inicio trocarStatus");
  
  var IDH006   = req.body.IDH006;
  var STAGENDA = req.body.STAGENDA;
  var IDI015   = null;

  if (req.body.IDI015 != undefined){
    IDI015 = req.body.IDI015  
  };

  if (req.body.IDG028) {
    if (STAGENDA == 8 && req.body.IDG028 != 282 && req.body.IDG028 != 284) {
      let count = await db.execute(
        {
          sql: `SELECT count(*) AS COUNT_H008
                  FROM H008
                  WHERE IDH006 = ${IDH006}
                  AND STAGENDA = 7

                UNION ALL

                SELECT count(*) AS COUNT_H008
                  FROM H008
                  WHERE IDH006 = ${IDH006}
                  AND STAGENDA = 6`,
          param: [],
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      if ((count[1].COUNT_H008 == 0) || (count[0].COUNT_H008 == 0)) {
        return [{error: "Agendamento ainda não finalizou operação!"}];
      }
    }
  }

  var dadosAgendamento;
  if ( STAGENDA == 7 || STAGENDA == 9 ){
    dadosAgendamento = await db.execute(
      {
        sql: `Select H006.IDH006,
                    (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
                        FROM H024
                        WHERE H024.IDH006 = H006.IDH006 
                        AND H024.SNDELETE = 0
                    ) AS IDG046,
                    H006.TPMOVTO
               From H006
              Where IDH006 = ${IDH006}`,
        param: [],
      })
      .then((result) => {
         logger.debug("Retorno:", result);
         return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
  }

  var moment = require('moment');
  moment.locale('pt-BR');

  logger.debug("Parametros recebidos:", req.body);

  await db.execute(
    {
      sql: `Update H006 Set StAgenda = ${STAGENDA} Where IDH006 = ${IDH006}`,
      param: [],
    })
    .then((result) => {

       logger.debug("Retorno:", result);

    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });

    if(STAGENDA != 10){
      logger.debug("STAGENDA != 10:", STAGENDA);

      if(STAGENDA == 7){
        if(dadosAgendamento[0].TPMOVTO == 'C' && dadosAgendamento[0].IDG046 != null){
          logger.debug("STAGENDA == 7:", STAGENDA);

          var datinha = new Date();

          // SALVAR DTSAICAR COM A DATA E STETAPA COM 4 ( VERIFICAR SE ESTÁ CERTO )
          logger.debug("Atribuindo DTSAICAR na G046:", IDH006);

          var sqlCommAnd = `
            Update G046
              Set Dtsaicar = :datinha,
                  stCarga = 'T'
            Where Idg046 In (${dadosAgendamento[0].IDG046})
          `;

          await db.execute(
            {
              sql: sqlCommAnd,
              param: [datinha],
            }
          )
          .then((result) => {

            logger.debug("Retorno:", result);

          })
          .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
          });

          let IDG046 = await db.execute(
            {
              sql: `SELECT LISTAGG(G046.IDG046, ',') WITHIN GROUP(ORDER BY G046.IDG046) IDG046 
                      FROM G046  
                      WHERE G046.IDG046 IN (${dadosAgendamento[0].IDG046}) 
                        AND G046.TPMODCAR = 2
                        AND G046.SNDELETE = 0`,
              param: [],
            }
          )
          .then((result) => {

            logger.debug("Retorno:", result);
            return result[0].IDG046;

          })
          .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
          });


          if (IDG046) { // CARGAS 4PL
            var params = {};
            params.STETAPA = 4;
            params.IDG046 = IDG046.split(',');
            await dao2.changeShipmentStatus(params, res, next);
          }
        }
      }

      if (STAGENDA == 14 || STAGENDA == 15) {
        let sqlPesagem = ` UPDATE H021 SET SNDELETE = 1
                            WHERE IDH021 IN ( SELECT MAX(IDH021)
                                                FROM H021
                                               WHERE IDH006   = ${IDH006}
                                                 AND TPMOVTO  = 'S'
                                                 AND SNDELETE = 0
                                             )`;

        await db.execute(
          {
            sql: sqlPesagem,
            param: [],
          }
        ).then((result) => {
          logger.debug("Retorno:", result);
        }).catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        });
      }

        //mudar o stentcli 
/*         if(STAGENDA == 9){
          if(dadosAgendamento[0].TPMOVTO == 'C' && dadosAgendamento[0].IDG046 != null){
            await cargasDAO.updateStatusASN(req, res, next) 
          }
        }; */

        var info = {IDH006: IDH006, STAGENDA: STAGENDA};
        var TXOBSERV = await this.buscarComentario(info, res, next);

        /* Volta status de Finalizou ou Iniciou para Entrou em armazens diferentes de DPA */
        if (req.body.OLD_STAGENDA && req.body.OLD_STAGENDA > STAGENDA && req.body.IDG028 && req.body.IDG028 != 11) {

          let status = (STAGENDA == 5) ? '6,7' : '7';
      
          await db.execute(
            {
              sql: `Update H008 Set SnDelete = 1 Where IDH006 = ${IDH006} And StAgenda In (${status})`,
              param: [],
            })
            .then((result) => {
      
               logger.debug("Retorno:", result);
      
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        } else {
          if(TXOBSERV[0] == undefined){
            logger.debug("Inserindo sem TXOBSERV H008:", IDH006, STAGENDA);

            var sql = `
            Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, HoInicio, IdS001, IdH005, HoPreIni)
                Values
            ((Select Count(IdH006)+1 From H008 Where IdH006 = `+ IDH006 + `), ` + IDH006 + `, ` + STAGENDA + `, ${IDI015}, 
            to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd-mm-yyyy hh24:mi:ss'),
            to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd-mm-yyyy hh24:mi:ss'), ${req.body.IDS001}, null,null)`

            return await db.execute(
            {
              sql,
              param: [],
            })
            .then((result) => {

              logger.debug("Retorno:", result);
              return {response: req.__('hc.sucesso.statusCriado')};

            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });  
          } else {
            logger.debug("Inserindo com TXOBSERV H008:", IDH006, STAGENDA);
            
            var sql = `
            Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, TxObserv,HoInicio, IdS001, IdH005, HoPreIni)
                Values
            ((Select Count(IdH006)+1 From H008 Where IdH006 = `+ IDH006 + `), ` + IDH006 + `, ` + STAGENDA + `, ${IDI015}, 
            to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd-mm-yyyy hh24:mi:ss'), '` + TXOBSERV[0].TXOBSERV +  `',
            to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd-mm-yyyy hh24:mi:ss'), ${req.body.IDS001}, null,null)`

            return await db.execute(
            {
              sql,
              param: [],
            })
            .then((result) => {

              logger.debug("Retorno:", result);
              return {response: req.__('hc.sucesso.statusCriado')};

            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
          }
        }
        

    }else{

    logger.debug("Buscando conhecimentos para validacao de cancelamento STAGENDA = 10:", IDH006);

    let objConhecimento = await db.execute(
      {
        sql: ` Select *
                 From G051 G051
                 Join G052 G052
                   On G052.Idg051 = G051.Idg051
                Where G051.Stctrc = 'A'
                  And G052.Idg043 In
                      (Select G043.Idg043
                         From G046 G046
                         Join G048 G048
                           On G048.Idg046 = G046.Idg046
                         Join G049 G049
                           On G049.Idg048 = G048.Idg048
                         Join G043 G043
                           On G043.Idg043 = G049.Idg043
                        Where G046.Idg046 in (Select listagg(Idg046, ',') within group (ORDER BY H024.IDG046) From H024 Where Idh006 = ${IDH006} and SNDELETE = 0)) `,

        param: [],
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

      // return true;
      if (objConhecimento.length > 0) {
        logger.error("Há conhecimento ativo para esta carga");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.haConhecimento')] };
      }

      logger.debug("Atribuindo ultimo status adicionado no agendamento anteriormente");

      var sqlCommAndCancelCheck = `
        Update H006
           Set StAgenda = Nvl((Select *
                                From (Select H008.StAgenda
                                        From H008 H008
                                       Where H008.Idh006 = ${idh006}
                                         And H008.StAgenda <> 7
                                       Order By H008.NrSeqMov Desc)
                               Where Rownum = 1),
                              3)
         Where Idh006 = ${IDH006}` ;

      await db.execute(
        {
          sql: sqlCommAndCancelCheck,
          param: [],
        })
        .then((result) => {

          logger.debug("Retorno:", result);

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });


      logger.debug("Atribuindo ultimo status adicionado no agendamento anteriormente");

      var sqlCommAnd = `
        Update G046
           Set Dtsaicar = Null
         Where Idg046 = (Select Idg046 From H006 Where Idh006 =`+ IDH006 +`)
      `;

      await db.execute(
        {
            sql: sqlCommAnd,
            param: [],
        })
        .then((result) => {
            logger.debug("Retorno:", result);
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        });

      
      logger.debug("Deletando StAgenda = 7 na  H008:", idh006);

      var sqlCommAnd = `
        Update H008
           Set SnDelete = 1
         Where Idh006 = ${idh006}
           And StAgenda = 7
        `;

      await db.execute(
        {
          sql: sqlCommAnd,
          param: [],
        })
        .then((result) => {

          logger.debug("Retorno:", result);

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      return {response: req.__('hc.sucesso.cancelamentoCheckOut')};
    }

  logger.debug("Fim trocarStatus");
};

 /**
  * @description Atualiza os comentários na mudança de status
  * @author Everton Pessoa
  * @since 04/04/2018 
  * @async
  * @function api/buscarComentarios
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.buscarComentarios = async function (req, res, next) {

    logger.debug("buscando comentarios");
    logger.debug("Parametros recebidos:", req.body);

    var idAgendamento;
    if(req.body == undefined){
      idAgendamento = req;
    } else {
      idAgendamento = req.body.IDH006;
    }

    var stSql = `
          Select H008.TXOBSERV, 
                 H008.STAGENDA 
          From H008
            Where IDH006 = ${idAgendamento} AND H008.TXOBSERV IS NOT NULL
          Group By H008.TXOBSERV, H008.STAGENDA
        ` ;

    return await db.execute(
      {
        sql: stSql,
        param: [],
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar comentarios");
  };

  api.buscarComentario = async function (req, res, next) {

    logger.debug("buscando comentario");
    logger.debug("Parametros recebidos:", req.body);

    var stSql = `
          Select H008.TXOBSERV
          From H008
            Where IDH006 = ${req.IDH006} AND STAGENDA = ${req.STAGENDA}
          Order By IDH008 Desc
        ` ;

    return await db.execute(
      {
        sql: stSql,
        param: [],
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar comentarios");
  };

  /**
     * @description Atualiza os comentários na mudança de status
     * @author Everton Pessoa
     * @since 04/04/2018 
     * @async
     * @function api/atualizarComentarioStatus
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarComentarios = async function (req, res, next) {

    logger.debug("inicio de atualizacao dos comentarios");
    logger.debug("Parametros recebidos:", req.body);

    for (key of req.body.comentarios) {
      var stSql = '';
      stSql = `
          Update H008
          Set TXOBSERV='${key.descricao}'
          Where IDH006 = ${req.body.IDH006}
          And   STAGENDA = ${key.etapa}` ;

      await db.execute(
        {
          sql: stSql,
          param: [],
        })
        .then((result) => {
          logger.debug("Atualizado:", key);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    }
    
    logger.debug("Fim tempoSlots");
  };

  /**
   * @description Libera a saída do caminhão do armazém
   * @author Enos Vinícius
   * @since 05/12/2018 
   * @async
   * @function api/salvarLiberacaoSaida
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.salvarLiberacaoSaida = async function (req, res, next) {

  logger.debug("inicio de Liberação de Saída");
  logger.debug("Parametros recebidos:", req.body);

  var stSql = '';
  stSql = `
      Update H021
      Set LIBERADO = 1,
          USERLIBE = ${req.body.IDS001},
          IDI015   = ${req.body.IDI015}
      Where IDH021 = ${req.body.info.IDH021}
      ` ;

  await db.execute(
    {
      sql: stSql,
      param: [],
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });
  
  logger.debug("Fim de Liberação de Saída");
};

  /**
   * @description Verificar o tempo que irá ser gasto na operação.
   *
   * @async
   * @function api/tempoSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.tempoSlots = async function (req, res, next) {

    logger.debug("Fim tempoSlots");

    /* var armazem = req.body.IDG028; */
    var tipoCarga = req.body.IDH002;
    var peso = parseInt(req.body.QTPESO.toString().replace('.',''));
    
    logger.debug("Parametros recebidos:", req.body);

    logger.debug("Buscando peso e tempo", tipoCarga, peso);
    var strSQL = `Select  H014.Idh014, 
                      H014.Vrtemcar, 
                      H014.VrPesCar,
                      G028.QTMINJAN
                  From H014 H014
                  Left join G028 G028
                    ON H014.IDG028 = G028.IDG028
                  Where H014.SnDelete = 0
                  And H014.Idh002 = `+tipoCarga+`
                  And H014.VrPesCar >= `+peso+`
                  Order By H014.VrPesCar`

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
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

    logger.debug("Fim tempoSlots");
  };

  /**
   * @description Verificar o tempo que irá ser gasto na operação.
   *
   * @async
   * @function api/tempoSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.BuscarMinutosSlots = async function (req, res, next) {

    logger.debug("Buscar tempoSlots");

    var armazem = req.body.IDG028;

    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `Select  G028.QTMINJAN
                  From G028 G028
                  Where G028.SnDelete = 0
                  And G028.IdG028 = '${armazem}'`

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return (result[0].QTMINJAN);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim tempoSlots");
  };

  /**
   * @description Atualizar NrTuSap na tabela H006.
   *
   * @async
   * @function api/atribuirTu
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atribuirTu = async function (req, res, next) {

    logger.debug("Inicio atribuirTu");

    var id = req.params.id;

    logger.debug("Parametros recebidos:", req.params, req.body);

    return await
      db.update({
        tabela: 'H006',
        colunas: {
          NRTUSAP:  req.body.NRTUSAP
          },
        condicoes: 'IDH006 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result1) => {

          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.atualizado')};

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

    logger.debug("Fim atribuirTu");
  };

  api.gravarNF = async function (req, res, next) {

    logger.debug("Inicio atribuirTu");

    var id = req.params.id;

    logger.debug("Parametros recebidos:", req.params, req.body);

    return await db.insert({
      tabela: 'H017',
      colunas: {
        IDH006: req.body.IDH006,
        NMARQNOT: req.files[0].originalname,
        SNDELETE: 0
      },
      key: 'IDH017'
    })
      .then((result1) => {

        logger.debug("Retorno:", result1);
        return result1;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim atribuirTu");
  };

  api.deleteNF = async function (req, res, next) {

    logger.debug("Inicio atribuirTu");

    var sql = `UPDATE H017 
                SET SNDELETE = 1 
                WHERE IDH017 = ${req.body.IDH017}
                `;

    await db.execute(
			{
				sql,
				param: []
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			}
		);
  };

  api.buscarNF = async function (req, res, next) {

    logger.debug("Buscar tempoSlots");

    var armazem = req.body.IDG028;

    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `Select  *
                  From H017 
                  Where H017.IDH006 = ${req.body.IDH006}
                  AND SNDELETE = 0
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim tempoSlots");
  };

  api.atualizacaoAgendamentos = async function (req, res, next) {

    logger.debug("Buscar atualizações de Agendamentos");

    var armazem = req.body.IDG028;
    var data    = req.body.DATA.substr(0,10);
    var idh008 = '';
    if(req.body.IDH008 > 0 ){
      idh008    = 'AND H008.IDH008 > ' + req.body.IDH008;
    }
    
    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
        SELECT H006.IDH006, H008.IDH008, H008.STAGENDA, TO_CHAR(H008.HOOPERAC, 'DD/MM/YYYY HH24:Mi:SS') HOOPERAC, H006.IDG028, G028.NMARMAZE, H006.TPMOVTO, H006.IDG024, G024.NMTRANSP, H006.NRPLAVEI, H006.IDG046, G031.NMMOTORI
          FROM H006 
          INNER JOIN G028 ON G028.IDG028 = H006.IDG028
          INNER JOIN G024 ON G024.IDG024 = H006.IDG024
          INNER JOIN H008 ON H008.IDH006 = H006.IDH006
          INNER JOIN G031 ON G031.IDG031 = H006.IDG031
        WHERE 
          H006.IDG028 IN(${armazem}) ${idh008}
          AND TO_CHAR(H008.HOOPERAC, 'DD/MM/YYYY') = '${data}'
        ORDER BY H008.HOOPERAC DESC
        OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
    `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim tempoSlots");
  };

  api.buscarAcoesGrade = async function (req, res, next) {

    logger.debug("Buscar tempoSlots");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	S026.IDS026, -- menu, perfil
                          S021.IDS022, -- cod menu
                          S021.IDS023  -- acao
                          
                        From S027
                        Inner Join S026 On S027.IDS026 = S026.IDS026
                        Inner Join S021 On S026.IDS026 = S021.IDS026	
                          Where S026.TPGRUPO In ('M', 'A')
                          And (S021.IDS023 Between 7 And 15) 
                          And S021.IDS022 = 64  
                          And S027.IDS001 = ${req.body.IDS001}
                          AND S026.SNDELETE = 0
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim tempoSlots");
  };

  api.buscarTranspGrade = async function (req, res, next) {

    logger.debug("Buscar Acoes grade");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	S027.IDS001, S028.DSVALUE as IDG024, G024.NMTRANSP, G024.IDG023               
                    From S027
                  Inner Join S026 
                    On S027.IDS026 = S026.IDS026
                  Inner Join S028 
                    On S026.IDS026 = S028.IDS026
                  Left Join G024
                  	On G024.IDG024 = S028.DSVALUE
                  Where S027.IDS001 = ${req.body.IDS001}
                    AND S028.IDS007 = 6  	  
                    AND S026.IDS025 = 2
                  Group By 
                    S027.IDS001, S028.DSVALUE, G024.NMTRANSP, G024.IDG023
                  `

    return await db.execute(
      {
        sql: strSQL,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarInfoTimeLine = async function (req, res, next) {

    logger.debug("Buscar Informações de listagem da TimeLine");

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H006',true);
      console.log("SQLWHERE", sqlWhere)
    var strSQL = `
                  SELECT H006.IDH006,
                  H008.NRSEQMOV,                  
                  H008.STAGENDA,
                  CASE
                    WHEN H008.STAGENDA = 3 THEN 'Agendado'
                    WHEN H008.STAGENDA = 4 THEN 'Checkin'
                    WHEN H008.STAGENDA = 5 THEN 'Entrou'
                    WHEN H008.STAGENDA = 6 THEN 'Iniciou Operação'
                    WHEN H008.STAGENDA = 7 THEN 'Finalizou Operação'
                    WHEN H008.STAGENDA = 8 THEN 'Saiu'
                    WHEN H008.STAGENDA = 9 THEN 'Faltou'
                    WHEN H008.STAGENDA = 10 THEN 'Cancelou'
                    WHEN H008.STAGENDA = 11 THEN 'Reagendou'
                    WHEN H008.STAGENDA = 12 THEN 'Pesagem'
                    WHEN H008.STAGENDA = 13 THEN 'Pesagem'
                    WHEN H008.STAGENDA = 14 THEN 'Iniciou Conferência'
                    WHEN H008.STAGENDA = 16 THEN 'Finalizou Conferência'
                END AS OPERACAO, 
                TO_CHAR(H008.HOOPERAC, 'DD/MM/YYYY HH24:Mi:ss') AS HOOPERAC,
                S001.NMUSUARI,
                COUNT(H006.IDH006) OVER () as COUNT_LINHA
                FROM H006 
                  INNER JOIN H008 ON H008.IDH006 = H006.IDH006
                  INNER JOIN S001 ON H008.IDS001  = S001.IDS001
                  ${sqlWhere}
                  ORDER BY H008.NRSEQMOV ASC
                  ${sqlPaginate}
                  `
    return await db.execute(
      {
        sql:strSQL,
        param: bindValues,
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return utils.construirObjetoRetornoBD(result);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar Informações da TimeLine");
  };

  api.buscarClienteGrade = async function (req, res, next) {

    logger.debug("Buscar Cliente grade");

    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select S027.IDS001, S028.DSVALUE as IDG005, G005.NMCLIENT AS CLIENTE        
                    From S027
                    Inner Join S026 
                      On S027.IDS026 = S026.IDS026
                    Inner Join S028 
                      On S026.IDS026 = S028.IDS026
                    Left Join G005
                      On G005.IDG005 = S028.DSVALUE
                    Where S027.IDS001 =  ${req.body.IDS001}
                      AND S028.IDS007 = 16  	  
                      AND S026.IDS025 = 2
                    Group By 
                      S027.IDS001, S028.DSVALUE, G005.NMCLIENT
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarArmazemUser = async function (req, res, next) {

    logger.debug("Buscar Acoes grade");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	S027.IDS001, S028.DSVALUE as IDG028, G028.NMARMAZE               
                    From S027
                  Inner Join S026 
                    On S027.IDS026 = S026.IDS026
                  Inner Join S028 
                    On S026.IDS026 = S028.IDS026
                  Left Join G028
                  	On G028.IDG028 = S028.DSVALUE
                  Where S027.IDS001 = ${req.body.IDS001}
                    AND S028.IDS007 = 1  	  
                    AND S026.IDS025 = 2
                  Group By 
                    S027.IDS001, S028.DSVALUE, G028.NMARMAZE
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  /* Verifica se Operação é 4PL */
  api.buscarOperacaoUser = async function (req, res, next) {

    logger.debug("Buscar Acoes grade");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	S027.IDS001, S028.DSVALUE as IDG014, G014.DSOPERAC
                    From S027
                  Inner Join S026 
                    On S027.IDS026 = S026.IDS026
                  Inner Join S028 
                    On S026.IDS026 = S028.IDS026
                  Left Join G014
                  	On G014.IDG014 = S028.DSVALUE
                  Where S027.IDS001 = ${req.body.IDS001}
                    AND S028.IDS007 = 7
                    AND S026.IDS025 = 2
                    AND G014.SN4PL  = 1
                  Group By 
                    S027.IDS001, S028.DSVALUE, G014.DSOPERAC
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };
  /* Verifica se Operação é 4PL */

  api.buscarArmSyngenta = async function (req, res, next) {

    logger.debug("Buscar Armazéns Syngenta");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `Select Idg028 From G028 Where SnDelete = 0 And SnArmBra = 0`;

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarTpModCar = async function (req, res, next) {

    logger.debug("Buscar TpModCar");

        logger.debug("Parametros recebidos:", req);

    var strSQL = `Select Distinct TpModCar From G046 Where SnDelete = 0 And Idg046 In (${req.IDG046})`;

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarPerfilUser = async function (req, res, next) {

    logger.debug("Buscar Acoes grade");

    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
            Select 	IDS026              
              From S027
            Where IDS001 = ${req.body.IDS001}
                 `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarParametros = async function (req, res, next) {

    logger.debug("Buscar Parametros");

        logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	S027.IDS001, S028.DSVALUE               
                    From S027
                  Inner Join S026 
                    On S027.IDS026 = S026.IDS026
                  Inner Join S028 
                    On S026.IDS026 = S028.IDS026
                  Where S027.IDS001 = ${req.body.IDS001}
                    AND S028.IDS007 = 55  	  
                    AND S026.IDS025 = 2
                  Group By 
                    S027.IDS001, S028.DSVALUE
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar Parametros");
  };

  /**-----------------------------------------------------------------------
   * @description Busca os produtos de um agendamento na tabela H022
   *
   * @async
   * @function api/buscarProduto
   * @param {request} req - Possui o IDH006 do agendamento.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   *-----------------------------------------------------------------------*/

  api.buscarProduto = async function (req, res, next) {

    logger.debug("Inicio buscar tomador");

    let IDH006;
    if(req.body == undefined){
      IDH006 = req.IDH006
    } else {
      IDH006 = req.body.IDH006;
    }

    logger.debug("Parametros recebidos:", IDH006);

    var sql = `
                SELECT H023.IDH022, H023.IDG009, G009.DSUNIDAD AS unidade, H022.DSMATERI AS descricao, H023.QTMATERI 
                  FROM H023 
                  INNER JOIN H022 ON H023.IDH022 = H022.IDH022
                  INNER JOIN G009 ON H023.IDG009 = G009.IDG009
                  WHERE H023.IDH006 = ` + IDH006 + `
                  AND H023.SNDELETE = 0
              `

    return await db.execute(
      {
        sql,
        param: [],
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar tomadores");
  };


  api.editarAgendamento = async function (req, res, next) {

    logger.debug("Editar informacoes do agendamento");

    logger.debug("Parametros recebidos:", req.body);

    if(req.body.dadosCarga.PESCOMP1 === undefined || req.body.dadosCarga.PESCOMP1 === "" ){
      req.body.dadosCarga.PESCOMP1 = null
    }

    if(req.body.dadosCarga.PESCOMP2 === undefined || req.body.dadosCarga.PESCOMP2 === ""){
      req.body.dadosCarga.PESCOMP2 = null
    }

    if(req.body.dadosCarga.NUMNAM === undefined || req.body.dadosCarga.NUMNAM === ""){
      req.body.dadosCarga.NUMNAM = null
    }

    if(req.body.dadosCarga.NTFISCA1 === undefined || req.body.dadosCarga.NTFISCA1 === ""){
      req.body.dadosCarga.NTFISCA1 = null
    }
    
    if(req.body.dadosCarga.NTFISCA2 === undefined || req.body.dadosCarga.NTFISCA2 === ""){
      req.body.dadosCarga.NTFISCA2 = null
    }

    if(req.body.dadosCarga.FORNECED === undefined || req.body.dadosCarga.FORNECED === ""){
      req.body.dadosCarga.FORNECED = null
    }

    if(req.body.dadosCarga.UNIDRECE === undefined || req.body.dadosCarga.UNIDRECE === ""){
      req.body.dadosCarga.UNIDRECE = null
    }

    if (req.body.dadosCarga.NRPLARE1 === undefined || req.body.dadosCarga.NRPLARE1 === null) {
      req.body.dadosCarga.NRPLARE1 = '';
    }

    if (req.body.dadosCarga.NRPLARE2 === undefined || req.body.dadosCarga.NRPLARE2 === null) {
      req.body.dadosCarga.NRPLARE2 = '';
    }

    if (req.body.dadosCarga.NRNFCARG === undefined || req.body.dadosCarga.NRNFCARG === null) {
      req.body.dadosCarga.NRNFCARG = '';
    }

    if (req.body.dadosCarga.CDLACRE === undefined || req.body.dadosCarga.CDLACRE === null) {
      req.body.dadosCarga.CDLACRE = '';
    }

    if (req.body.dadosCarga.CDCONTAI === undefined || req.body.dadosCarga.CDCONTAI === null) {
      req.body.dadosCarga.CDCONTAI = '';
    }

    var strSQL = `
                    Update H006
                      Set 
                          H006.IDG031     =    ${req.body.dadosCarga.IDG031}
                        , H006.NRPLAVEI   =   '${req.body.dadosCarga.NRPLAVEI}'
                        , H006.NRPLARE1   =   '${req.body.dadosCarga.NRPLARE1}'
                        , H006.NRPLARE2   =   '${req.body.dadosCarga.NRPLARE2}'
                        , H006.TXOBSAGE   =   '${req.body.dadosCarga.obs}'
                        , H006.LSNOTAS    =   '${req.body.dadosCarga.notas}'
                        , H006.NRNFCARG   =    '${req.body.dadosCarga.NRNFCARG}'
                        , H006.IDH002     =    ${req.body.dadosCarga.IDH002.id}
                        , H006.TPPESAGE   =    ${req.body.dadosCarga.TPPESAGE}
                        , H006.TPOPERAC   =    ${req.body.dadosCarga.TPOPERAC}
                        , H006.IDG030     =    ${req.body.dadosCarga.IDG030.id}
                        , H006.PESCOMP1   =    ${req.body.dadosCarga.PESCOMP1}
                        , H006.PESCOMP2   =    ${req.body.dadosCarga.PESCOMP2}
                        , H006.IDG024     =    ${req.body.dadosCarga.IDG024.id}
                        , H006.NTFISCA1   =    ${req.body.dadosCarga.NTFISCA1}
                        , H006.NTFISCA2   =    ${req.body.dadosCarga.NTFISCA2}
                        , H006.FORNECED   =    ${req.body.dadosCarga.FORNECED}
                        , H006.UNIDRECE   =    ${req.body.dadosCarga.UNIDRECE}
                        , H006.CDLACRE    =   '${req.body.dadosCarga.CDLACRE}'
                        , H006.CDCONTAI   =   '${req.body.dadosCarga.CDCONTAI}'
                        , H006.NUMNAM     =    ${req.body.dadosCarga.NUMNAM}
                    Where H006.IDH006 = ${req.body.IDH006}
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.buscarPlaca = async function (req, res, next) {

    logger.debug("Buscar Placa de agendamento");

    logger.debug("Parametros recebidos:", req.body);

    var strSQL = `
                  Select 	H006.NRPLAVEI
                    From H006
                  Where H006.IDH006 = ${req.body.IDH006}
                  `

    return await db.execute(
      {
        sql: strSQL ,
        param: [],
      })
      .then((result) => {

        logger.debug("Retorno:", result);
        return result;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar acoes grade");
  };

  api.editarPreASN = async function (req, res, next) {		
    var sql = `Update G048 
                  Set 
                    STINTCLI = ${req.STINTCLI} 
                Where IDG046 = ${req.IDG046}
                And STINTCLI = 1
                `;

    await db.execute(
			{
				sql,
				param: []
      })

			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			}
		);
  }
  
 /**
  * @description cancela uma descarga e libera o slot
  * @author Everton Pessoa
  * @since 20/04/2018 
  * @async
  * @function api/buscarComentarios
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.cancelarAgendamento = async function (req, res, next) {

    var id  = req.body.IDH006;

    var obj = {};
    if (req.body.IDG046 !== undefined) {
      //Medida provisória para cancelar cargas vindas do Transportation
      logger.debug("Iniciado Buscar Tipo de movimentação de Agendamento");

      await db.execute({
        sql: `
          SELECT DISTINCT
            H006.TPMOVTO,
            (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
                FROM H024  
                WHERE H024.IDH006 = H006.IDH006 
                AND H024.SNDELETE = 0
            ) AS IDG046,
            G046.TPMODCAR
          FROM H006 
          INNER JOIN H024
            ON H006.IDH006 = H024.IDH006
          LEFT JOIN G046
            ON G046.IDG046 = H024.IDG046
          Where G046.IDG046 in (${req.body.IDG046})
          AND H024.SNDELETE = 0
          `,
        param: [],
      })
        .then((result1) => {
          logger.debug("Retorno:", result1);
          obj = result1;

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro, encontrar Tipo de movimentação da carga:", err);
          throw err;
        });

      logger.debug("Fim buscar Tipo de movimentação da carga");

      if (obj[0].TPMOVTO == 'C' && obj[0].TPMODCAR == 1) {
        await db.execute({
          sql: `
              UPDATE G046
                SET STCARGA = 'A'
              WHERE IDG046 in (${obj[0].IDG046})
              `,
          param: [],
        })
          .then((result1) => {
            logger.debug("Status alterado");
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro ao alterar status da carga", err);
          });
      }
    }
    
    var IDS001;

    if (req.headers.ids001 != undefined){
      IDS001 = req.headers.ids001;
    }else if (req.body.IDS001 != undefined){
      IDS001 = req.body.IDS001;
    }
    else{
      return "Usuário não informado"
    }


    var SLOTS = await this.buscarSlots({IDH006:id}, res, next);
    var HOINICIO = await this.buscarHoinicio({idSlots:[SLOTS[0].IDH007]}, res, next);

    logger.debug("Iniciado processo para excluir descarga");
    logger.debug("Atribuindo STAGENDA = 10 na H006:", id);

    await db.update({
      tabela: 'H006',
      colunas: {
        STAGENDA: 10
      },
      condicoes: 'IDH006 = :id',
      parametros: {
        id: id
      }
    })
      .then((result1) => {

        logger.debug("Retorno:", result1);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Liberando slot:", id);

    return await db.update({
      tabela: 'H007',
      colunas: {
        IDH006: ''
      },
      condicoes: 'IDH006 = :id',
      parametros: {
        id: id
      }
    })
    .then(async (result1) => {

      await this.mudarEtapa({IDH006: req.body.IDH006, ETAPA: 10, IDI015: req.body.IDI015, IDS001:IDS001, HOINICIO:HOINICIO[0].HOINICIO }, res, next);
      logger.debug("Retorno:", result1);
      return { response: req.__('hc.sucesso.agendaExcluida') };
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });

    logger.debug("Fim excluir");
  };

  api.salvarTomador = async function (req, res, next) {

    logger.debug("Iniciado Salvar Tomador");

    await db.execute({
      sql: `
      INSERT INTO H019 (IDH006, IDG005) 
        VALUES ( 
          ${req.IDH006},
          ${req.IDG005}
          )
        `,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


    logger.debug("Fim Salvar Tomador");
  };

  api.updateTomador = async function (req, res, next) {

    logger.debug("Iniciado Excluir Tomador");

    await db.execute({
      sql: `
          UPDATE H019 SET SNDELETE = ${req.SNDELETE} 
            WHERE IDH006 = ${req.IDH006} AND 
                  IDG005 = ${req.IDG005} 
        `,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Excluir Tomador");
  };

  api.excluirTerceiro = async function (req, res, next) {

    logger.debug("Iniciado Excluir Terceiro");

    await db.execute({
      sql: `
          UPDATE H006 SET SNDELETE = 1, IDS001 = ${req.body.IDS001} 
            WHERE IDH006 = ${req.body.IDH006}  
        `,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim  Excluir Terceiro");
  };


  api.buscarTimeline = async function (req, res, next) {

    logger.debug("Iniciado busca da timeline");

    var sql = `
              Select    TO_CHAR(MIN(H007.HOINICIO), 'YYYY-MM-DD HH24:mi')       	AGE_AGENDADO            --DATA AGENDADO
                , TO_CHAR(MAX(CHE.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        CHE_DTCHECKIN           --DATA CHECKIN
                , TO_CHAR(MAX(ENT.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        ENT_DTENTROU	          --DATA ENTROU
                , TO_CHAR(MAX(INI.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        INI_DTINICIOP           --DATA INICIOU OPERACAO
                , TO_CHAR(MAX(FIN.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        FIN_CHECKOUT	          --DATA  FINALIZOU OPERACAO
                , TO_CHAR(MAX(SAI.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        SAI_DTSAIU  	          --DATA SAIU
                , TO_CHAR(MAX(FAL.HOOPERAC), 'YYYY-MM-DD HH24:mi')       	        FAL_FALTOU              --DATA FALTOU
              From H006
                Left Join H007
                  On (H006.IDH006 = H007.IDH006)
                Left Join H008 CHE
                  On (H006.IDH006 = CHE.IDH006 AND CHE.STAGENDA = 4)
                Left Join H008 ENT    
                  On (H006.IDH006 = ENT.IDH006 AND ENT.STAGENDA = 5)
                Left Join H008 INI    
                  On (H006.IDH006 = INI.IDH006 AND INI.STAGENDA = 6)
                Left Join H008 FIN    
                  On (H006.IDH006 = FIN.IDH006 AND FIN.STAGENDA = 7)
                Left Join H008 SAI    
                  On (H006.IDH006 = SAI.IDH006 AND SAI.STAGENDA = 8)
                Left Join H008 FAL    
                  On (H006.IDH006 = FAL.IDH006 AND FAL.STAGENDA = 9)
                Where H006.IDH006 = ${req.body.IDH006}
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Excluir Tomador");
  };

  api.verificarAdmin = async function (req, res, next) {

    logger.debug("Iniciado busca da timeline");

    var sql = `
              Select IDS001, SNADMIN 
                From S001
              Where IDS001 = ${req.headers.ids001}
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Excluir Tomador");
  };

  api.mudarEtapa = async function (req, res, next) {

    var IDH006, ETAPA, IDI015, H0INICIO, IDS001;
    if(req.body == undefined){
      IDH006    =   req.IDH006;
      ETAPA     =   req.ETAPA;
      IDI015    =   req.IDI015;
      HOINICIO  =   req.HOINICIO;
      IDS001    =   req.IDS001;
    } else {  
      IDH006    =   req.body.IDH006;
      ETAPA     =   req.body.ETAPA;
      IDI015    =   req.body.IDI015;
      HOINICIO  =   req.body.HOINICIO;
      IDS001    =   req.body.IDS001;
    }
    if (!IDI015){
      IDI015 = null;
    }
    logger.debug("iniciando mudar etapa");

    var sql = `
    Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, HoInicio, IdS001, IdH005, HoPreIni)
    Values
    ((Select Count(IdH006)+1 From H008 Where IdH006 = `+ IDH006 + `), 
    ` + IDH006 + `, ${ETAPA}, ${IDI015}, 
    to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd-mm-yyyy hh24:mi:ss'), 
    to_date('${HOINICIO}', 'dd-mm-yyyy hh24:mi:ss'),
    ${IDS001}, 
    null, 
    null)`;

    return await db.execute({
        sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim mudar etapa");
  };

  api.buscarHoinicio = async function (req, res, next) {

    var idSlots = req.idSlots;


    logger.debug("buscar Hora de inicio do agendamento");

    var sql = `
                Select MIN(IDH007) AS IDH007, 
                       IDH006,
                       to_char(MIN(HOINICIO), 'dd/mm/yyyy hh24:mi:ss') AS HOINICIO
                From h007 Where idh007 in (${idSlots.join()})
                Group by idh006
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar Hora de inicio");
  };

  api.cancelarPesagens = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;
    var user          = req.body.IDS001;

    logger.debug("Cancelar pesagem de entrada do agendamento");

    var sql = `
                Update H021
                  Set SNDELETE = 1,
                  USERCANC = ${user}
                  WHERE IDH006 = ${idAgendamento}
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("FCancelar pesagem de entrada do agendamento");
  };

  api.inverterPesagens = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;

    logger.debug("Inverter Pesos do agendamento");

    var sql = `
                Update H006
                  Set PESCOMP1 = ${req.body.COMP2},
                  PESCOMP2 = ${req.body.COMP1}
                  WHERE IDH006 = ${idAgendamento}
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Inverter Pesos do agendamento");
  };

  api.trocarDadosAgendamento = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;//Agendamento que vai receber os dados do outro
    var idAgendamentoBk = req.body.IDH006BK//Agendamento que passa os dados;

    logger.debug("Trocar status do agendamento");

    var sql = `
        UPDATE H008 SET IDH006 = ${idAgendamento} 
          WHERE IDH006 = ${idAgendamentoBk} AND 
          STAGENDA != 3
          `

    return await db.execute({sql, param: [],})
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Trocar status do agendamento");
  };

  api.trocarPesosAgendamento = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;//Agendamento que vai receber os dados do outro
    var idAgendamentoBk = req.body.IDH006BK//Agendamento que passa os dados;
    var userTroca = req.body.IDS001TP//Usuáro que fez a troca de pesagem;

    logger.debug("Trocar Pesos do agendamento");

    var sql = `
        UPDATE H021 SET IDH006 = ${idAgendamento}, IDS001TP = ${userTroca}
          WHERE IDH006 = ${idAgendamentoBk}
          `
    return await db.execute({sql, param: [],})
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Trocar Pesos Pesos do agendamento");
  };

  api.voltarStatusAgendado = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;//Agendamento que vai receber os dados do outro
    var idAgendamentoBk = req.body.IDH006BK//Agendamento que passa os dados;

    logger.debug("Voltar Status para Agendado");

    var sql = `
        UPDATE H006 SET STAGENDA = 3 
          WHERE IDH006 = ${idAgendamentoBk}
          `
    return await db.execute({sql, param: [],})
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Voltar Status para Agendado");
  };

  api.atribuirNovoStatus = async function (req, res, next) {

    var idAgendamento = req.body.IDH006;//Agendamento que vai receber os dados do outro
    var status = req.body.STAGENDA//Agendamento que passa os dados;

    logger.debug("Voltar Status para Agendado");

    var sql = `
        UPDATE H006 SET STAGENDA = ${status} 
          WHERE IDH006 = ${idAgendamento}
          `
    return await db.execute({sql, param: [],})
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim Voltar Status para Agendado");
  };

  api.buscarSlots = async function (req, res, next) {

    logger.debug("buscar Hora de inicio do agendamento");

    var sql = `
                Select MIN(IDH007) AS IDH007
                  From h007 
                Where IDH006 = ${req.IDH006} 
                AND SNDELETE = 0
          `

    return await db.execute({
      sql,
        param: [],
    })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscar Hora de inicio");
  };

  api.buscarDtEntCon = async function (req, res, next) {

    logger.debug("buscar DentCon");

    
    var sql = `
                MERGE INTO G043 D
                USING (   
                  SELECT 
                    G043.IDG043
                    
                  FROM G046 --CARGA
                  
                  INNER JOIN G048 -- ETAPAS
                    ON G048.IDG046 = G046.IDG046
                    
                  INNER JOIN G049 -- ETAPA x DELIVERY
                    ON G049.IDG048 = G048.IDG048
                    
                  INNER JOIN G043 -- DELIVERY
                    ON G043.IDG043 = G049.IDG043
                    
                  WHERE 
                    G046.SNDELETE = 0
                                    AND G046.TPORIGEM = '1'
                    AND G043.SNDELETE = 0
                                    AND G043.TPDELIVE = 2
                                    AND G043.IDG014 IN (SELECT G014.IDG014 FROM G014 WHERE G014.SN4PL = 1)
                    AND G046.IDG046 = ${req.IDG046}
                ) Q
                ON (D.IDG043 = Q.IDG043)
                WHEN MATCHED THEN UPDATE SET D.DTENTCON = TO_DATE('${req.Dt}', 'YYYY-MM-DD HH24:MI:SS')`;

    return await db.execute({
      sql,
      param: [],
      type: 'UPDATE'
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

    logger.debug("Fim buscar DtEntCon");
  };

  api.salvarMateriais = async function (req, res, next){

    var objBanco = {
        table:    'H023'
      , key:      ['IDH023']
      , vlFields:  {}
    }

    objBanco.vlFields.IDH006      =     req.body.IDH006;
    objBanco.vlFields.IDH022      =     req.IDH022;
    objBanco.vlFields.IDG009      =     req.IDG009;
    objBanco.vlFields.QTMATERI    =     req.QTMATERI;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
        
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }


  api.deleteMateriais = async function (req, res, next) {
    var strSQL = `
                  Update H023
                    Set 
                        H023.SNDELETE   =    1
                  Where H023.IDH006 = ${req.body.IDH006}
              `

    return await db.execute(
    {
    sql: strSQL ,
    param: [],
    })
    .then((result) => {

    logger.debug("Retorno:", result);
    return result;

    })
    .catch((err) => {
    err.stack = new Error().stack + `\r\n` + err.stack;
    logger.error("Erro:", err);
    throw err;
    });
  }

  api.salvarNAM = async function (req, res, next) {

    logger.debug("Inicio Salvar NAM");

    var id = req.body.IDH006;

    logger.debug("Parametros recebidos:", req.body);

    return await
      db.update({
        tabela: 'H006',
        colunas: {
          NUMNAM:  req.body.NUMNAM,
          DTNAM:   tmz.dataAtualJS() //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
          },
        condicoes: 'IDH006 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result1) => {

          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.atualizado')};

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

    logger.debug("Fim Salvar NAM");
  };

  api.mudarTipoPesagem = async function (req, res, next) {

    logger.debug("Inicio mudar tipo de pesagem");

    var id = req.body.IDH006;

    logger.debug("Parametros recebidos:", req.body);

    return await
      db.update({
        tabela: 'H006',
        colunas: {
          TPPESAGE:  req.body.TPPESAGE,
          IDS001TQ:  req.body.IDS001TQ
          },
        condicoes: 'IDH006 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result1) => {

          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.atualizado')};

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

    logger.debug("Fim mudar tipo de pesagem");
  };

  api.verificaStCarga = async function (req, res, next) {

    req.sql = ` SELECT STCARGA
                  FROM G046
                 WHERE IDG046 IN (${req.body.IDG046.join()})`;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscar4PL = async function (req, res, next) {

    logger.debug("Inicio buscar 4PL");

    logger.debug("Parametros recebidos:", req.body);

    req.sql = `
          SELECT TPMODCAR 
            FROM G046 
          WHERE IDG046 = ${req.body.IDG046}
          `
        return await gdao.executar(req, res, next).catch((err) => { throw err });

    logger.debug("Fim buscar 4PL");
  };

  api.buscarDadosAgendamentoTicket = async function (req, res, next) {
    logger.debug("buscar Ticket");
    logger.debug("Parametro :" + req.body);
    
    req.sql = `
                  SELECT 
                  H006.IDH006 AS AGENDAMENTO,
                  H006.TXOBSAGE AS OBSERVACAO,
                  G028.NMARMAZE AS LOCALDESCARGA,
                  G024.NMTRANSP AS TRANSPORTADORA,
                  G031.NMMOTORI AS MOTORISTA,
                  H006.NRPLAVEI AS PLACAVEICULO,
                  H006.FORNECED AS FORNECEDOR,
                  H006.IDG005 AS CLIENTE,
                  H006.NTFISCA1 AS NOSTA1,
                  H006.NTFISCA2 AS NOSTA2,
                  '86868' AS DOCTO,
                  'MATERIA PRIMA' AS MATERIAL,
                  H006.QTPESO AS PESOAGENDADO,
                  H006.TPPESAGE AS TPPESAGE,
                  H006.PESCOMP1 AS PESOCOMP1,
                  H006.PESCOMP2 AS PESOCOMP2,
                  --H006.TPOPERAC AS TPOPERAC,
                  CASE
                    WHEN H006.TPMOVTO = 'C' AND H006.NRNFCARG IS NULL AND H006.TPOPERAC IS NULL THEN
                      (
                        SELECT
                          LISTAGG(TPOPERAC, ', ') WITHIN GROUP(ORDER BY TPOPERAC) TPOPERAC 
                      FROM 
                      (
                        SELECT DISTINCT H024.TPOPERAC
                        FROM H024  
                        WHERE H024.IDH006 = H006.IDH006 
                          AND H024.SNDELETE = 0
                        )
                      )
                    WHEN (H006.TPMOVTO = 'C' AND H006.NRNFCARG IS NOT NULL) OR H006.TPMOVTO = 'D' OR H006.TPMOVTO IS NULL OR H006.TPOPERAC IS NOT NULL THEN
                      H006.TPOPERAC
                  END TPOPERAC,
                  CASE
                    WHEN H006.NRNFCARG IS NULL THEN
                      (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046
                          FROM H024
                          WHERE H024.IDH006 = H006.IDH006
                          AND H024.SNDELETE = 0
                      )
                    WHEN H006.NRNFCARG IS NOT NULL THEN H006.NRNFCARG
                  END CARGAS
                  FROM
                    H006 H006,
                    G028 G028,
                    G024 G024,
                    G031 G031
                  WHERE H006.IDG028 = G028.IDG028 
                  AND H006.IDG024 = G024.IDG024
                  AND H006.IDG031 = G031.IDG031
                  AND H006.IDH006 = ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarRelatorioDadosAgendamento = async function (req, res, next) {
    logger.debug("buscar Ticket");
    logger.debug("Parametro :" + req.body);
    
    req.sql = `
                SELECT 
                H006.TXOBSAGE AS OBSERVACAO,
                G028.NMARMAZE AS LOCALDESCARGA,
                G024.NMTRANSP AS TRANSPORTADORA,
                G031.NMMOTORI AS MOTORISTA,
                H006.NRPLAVEI AS PLACAVEICULO,
                H006.FORNECED AS FORNECEDOR,
                H006.IDG005 AS CLIENTE,
                H006.NTFISCA1 AS NOSTA1,
                H006.NTFISCA2 AS NOSTA2,
                '86868' AS DOCTO,
                'MATERIA PRIMA' AS MATERIAL,
                H006.QTPESO AS PESOAGENDADO,
                H006.TPPESAGE AS TPPESAGE,
                H002.DSTIPCAR AS TIPOCARGA,
                G046.DSCARGA AS CARGA,
                H006.UNIDRECE AS UNIDADERECEBIMENTO,
                H006.STAGENDA AS STATUS,
                H006.TPOPERAC AS TIPOOPERACAO,
                H006.DTCADAST AS DATAAGENDAMENTO,
                H006.IDBOX AS DOCA,
                H006.QTTEMPRE AS TEMPOPREVISTO,
                H006.TPMOVTO AS OPERACAO,
                G030.DSTIPVEI AS TIPOVEICULO,
                S001.NMUSUARI AS RESPONSAVELAGENDAMENTO
              FROM 
                H006 H006
                INNER JOIN G028 G028 ON H006.IDG028 = G028.IDG028
                INNER JOIN G024 G024 ON H006.IDG024 = G024.IDG024
                INNER JOIN G031 G031 ON H006.IDG031 = G031.IDG031
                INNER JOIN H002 H002 ON H002.IDH002 = H006.IDH002
                INNER JOIN S001 S001 ON S001.IDS001 = H006.IDS001
                LEFT JOIN G046 G046 ON H006.IDG046 = G046.IDG046
                LEFT JOIN G032 G032 ON G032.IDG032 = H006.IDG032
                LEFT JOIN G030 G030 ON G030.IDG030 = G032.IDG030
              WHERE H006.IDH006 = ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarDadosStatusAgendamentoTicket = async function (req, res, next) {
    logger.debug("buscar Status agendamento Ticket");
    logger.debug("Parametro :" + req.body);
    
    req.sql = `
                SELECT 
                  H008.HOINICIO,
                  CASE
                    WHEN H008.STAGENDA = 4 THEN 'PRÉ'
                    WHEN H008.STAGENDA = 5 THEN 'ENTRADA'
                  END AS STATUSAGENDAMENTO,
                  S001.NMUSUARI AS USUARIO
                FROM H008 H008,S001 S001
                WHERE S001.IDS001 = H008.IDS001 
                AND IDH006 = ${req.body.IDH006} AND STAGENDA IN (4,5) 
                AND ROWNUM < 3
                ORDER BY IDH008 ASC
              `
    return await gdao.executar(req, res, next).catch((err) => { 
      console.log("Erro:", err);
      throw err 
    });
  };
  
  api.buscarRelatorioDadosStatusAgendamento = async function (req, res, next) {
    logger.debug("buscar Status agendamento Ticket");
    logger.debug("Parametro :" + req.body);
    
    req.sql = `
              SELECT
                H008.*,S001.NMUSUARI
              FROM
                H008 H008,
                S001 S001
              WHERE
                S001.IDS001 = H008.IDS001
                AND IDH006 = ${req.body.IDH006}
              ORDER BY IDH008 ASC
              `
    return await gdao.executar(req, res, next).catch((err) => { 
      console.log("Erro:", err);
      throw err 
    });
  };

  api.validarCheckList = async function (req, res, next) {

    req.sql = `UPDATE H006
                  SET H006.REPCHELI = ${req.body.REPCHELI}
                WHERE H006.IDH006 = ${req.body.IDH006}`;

    return await gdao.executar(req, res, next).catch((err) => { 
      console.log("Erro:", err);
      throw err 
    });
  }

  api.buscarDadosCarga = async function (req, res, next) {

    req.sql = `SELECT G028.IDG028                                         --ID ARMAZÉM
                    , G028.NMARMAZE                                       --NOME ARMAZÉM

                    , G024.IDG024                                         --ID TRANSPORTADORA
                    , G024.NMTRANSP                                       --NOME TRANSPORTADORA

                    , G031.IDG031                                         --ID MOTORISTA
                    , G031.CJMOTORI                                       --CPF MOTORISTA
                    , G031.RGMOTORI                                       --RG MOTORISTA
                    , G031.NRCNHMOT                                       --CNH MOTORISTA
                    , G031.NMMOTORI                                       --NOME MOTORISTA

                    , G030.IDG030                                         --ID TIPO VEÍCULO
                    , G030.DSTIPVEI                                       --DESCRIÇÃO TIPO VEÍCULO

                    , H002.IDH002                                         --ID TIPO CARGA
                    , H002.DSTIPCAR                                       --DESCRIÇÃO TIPO CARGA

                    , G046.IDG046                                         --ID CARGA
                    , G046.TPTRANSP                                       --TIPO OPERAÇÃO
                    , ROUND(G046.PSCARGA, 2) PSCARGA                      --PESO CARGA
                    , G046.NRPLAVEI                                       --PLACA VEÍCULO
                    , G046.NRPLARE1                                       --PLACA REBOQUE 1
                    , G046.NRPLARE2                                       --PLACA REBOQUE 2

                    , (
                        SELECT LISTAGG(IDG005, ',') WITHIN GROUP (ORDER BY IDG005) IDTOMADO FROM
                        (
                          SELECT DISTINCT G005.IDG005, G005.NMCLIENT
                                     FROM G005 G005
                                     JOIN G043 G043 ON G005.IDG005 = G043.IDG005RE
                                     JOIN G049 G049 ON G043.IDG043 = G049.IDG043
                                     JOIN G048 G048 ON G049.IDG048 = G048.IDG048
                                    WHERE G048.IDG046 = G046.IDG046
                        )
                      ) IDTOMADO
                    , (
                        SELECT LISTAGG(NMCLIENT, ',') WITHIN GROUP (ORDER BY IDG005) IDTOMADO FROM
                        (
                          SELECT DISTINCT G005.IDG005, G005.NMCLIENT
                                     FROM G005 G005
                                     JOIN G043 G043 ON G005.IDG005 = G043.IDG005RE
                                     JOIN G049 G049 ON G043.IDG043 = G049.IDG043
                                     JOIN G048 G048 ON G049.IDG048 = G048.IDG048
                                    WHERE G048.IDG046 = G046.IDG046
                        )
                      ) NMTOMADO

                 FROM G046 G046
                 JOIN G028 G028 ON G028.IDG028 = G046.IDG028             --ARMAZÉM
                 JOIN G024 G024 ON G024.IDG024 = G046.IDG024             --TRANSPORTADORA
                 JOIN G031 G031 ON G031.IDG031 = G046.IDG031M1           --MOTORISTA
                 JOIN G030 G030 ON G030.IDG030 = G046.IDG030             --TIPO VEÍCULO
                 JOIN H002 H002 ON H002.IDH002 = G046.TPCARGA            --TIPO CARGA

                WHERE G046.IDG046 = ${req.body.IDG046}

             GROUP BY G028.IDG028
                    , G028.NMARMAZE

                    , G024.IDG024
                    , G024.NMTRANSP

                    , G031.IDG031
                    , G031.CJMOTORI
                    , G031.RGMOTORI
                    , G031.NRCNHMOT
                    , G031.NMMOTORI

                    , G030.IDG030
                    , G030.DSTIPVEI

                    , H002.IDH002
                    , H002.DSTIPCAR

                    , G046.IDG046
                    , G046.TPTRANSP
                    , G046.PSCARGA
                    , G046.NRPLAVEI
                    , G046.NRPLARE1
                    , G046.NRPLARE2`;

    return await gdao.executar(req, res, next).catch((err) => { 
      console.log("Erro:", err);
      throw err 
    });
  }

  return api;

};