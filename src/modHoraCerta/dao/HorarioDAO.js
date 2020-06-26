/**
 * @description Possui os métodos responsaveis por alimentar a grid de horario do hora certa
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module dao/Horario
 * @description H006.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app) {
  
  var api    = {};
  var logger = app.config.logger;
  var db     = app.config.database;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  api.controller = app.config.ControllerBD;
  var utils = app.src.utils.Utils;
  
  /**
   * @description Busca slots.
   *
   * @async
   * @function api/getHorarios
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
  api.getHorarios = async function (req, res, next) {

    logger.debug("Inicio getHorarios");

    let arJanelas   = null;
    let arJanelas2  = [];
    let arHorarios  = null;
    let arHorarios2 = [];
    let arDescJan   = null;
    let arDescJan2  = [];
    let arArmazem   = {QTMINARM: 0, QTMINEDI: 0}
    let arSlots     = null;
    let retorno     = {}; 

    var Moment = require('moment');
    Moment.locale('pt-BR');
    var MomentRange = require('moment-range');
    var moment = MomentRange.extendMoment(Moment);

    logger.debug("Parametros recebidos:", req.body);

    var armazem = req.body.IDG028;
    //var data    = moment(req.body.DTPESQUI).format('L');

    await db.execute(
      {
        sql: `
        SELECT 
            CASE 
              WHEN QTMINARM IS NULL THEN 0 
              WHEN QTMINARM IS NOT NULL THEN QTMINARM 
            END AS QTMINARM, 
            CASE 
              WHEN QTMINEDI IS NULL THEN 0 
              WHEN QTMINEDI IS NOT NULL THEN QTMINEDI 
            END AS QTMINEDI 
        FROM G028 WHERE IDG028 = ${armazem}
        `,
        param: []               
      })
      .then((result) => {
        arArmazem = {QTMINARM: result[0].QTMINARM, QTMINEDI: result[0].QTMINEDI};
        logger.debug("Retorno:", result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
    
    logger.debug("Fim Select Parâmetros Armazém");

    logger.debug("Select janelas");

    await db.execute(
    {
      sql: `Select H005.NrJanela
              From H005 H005
             Where H005.SnDelete = 0 
               And H005.IdG028 = :id
               And H005.StCadast = 'A'
          Order By H005.NrJanela`,
      param: [armazem]        
    })

    .then((result) => {
      arJanelas = result;
      logger.debug("Retorno:", result);
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });

    logger.debug("Select horario janela");
      
    for (let x in arJanelas) {
      arJanelas2.push(arJanelas[x].NRJANELA);
    }

    logger.debug("Select descrição janela");

    await db.execute(
      {
        sql: `Select H005.dsjanela
                From H005 H005
               Where H005.SnDelete = 0 
                 And H005.IdG028 = :id
                 And H005.StCadast = 'A'
            Order By H005.NrJanela`,
        param: [armazem]        
      })
  
      .then((result) => {
        arDescJan = result;
        logger.debug("Retorno:", result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
        
      for (let x in arDescJan) {
        arDescJan2.push(arDescJan[x].DSJANELA);
      }

      logger.debug("Fim descrição janela");

    await db.execute(
    {
      sql: `Select  x.HoInicio, x.HoFinal, x.QtMinJan 
            From (
                    Select    H010.HoInicio, H010.HoFinal, H009.QtMinJan, 
                              Max(To_Number(Replace(HoInicio, ':')) + To_Number(Replace(HoFinal, ':'))) as VlMax
                    From      H010 H010
                    Join      H009 H009 On H009.IdH009 = H010.IdH009 
                    Where     H010.SnDelete = 0 And H009.IdG028 = :armazem
                    And H009.SnDelete = 0
                    And To_Date(:data, 'dd/mm/yyyy') Between
                    To_Date(H009.DTInicio, 'dd/mm/yy') And
                    To_Date(H009.DtFinal, 'dd/mm/yy')
                    
                    And H010.Nrdia = (Select Case
																								
                      When (To_Char(To_Date(:dataY,
                                            'dd/mm/yyyy'),
                                    'D') - 1) = 0 Then
                       0
                      When (To_Char(To_Date(:dataZ,
                                            'dd/mm/yyyy'),
                                    'D') - 1) = 6 Then
                       6
                      Else
                       1
                    End
               From Dual)
                    Group By  H010.HoInicio, H010.HoFinal, H009.QtMinJan
                    Order By  VlMax Desc) x
            Where   RowNum = 1`,
      param: [armazem, req.body.DTPESQUI, req.body.DTPESQUI, req.body.DTPESQUI]        
    })

    .then((result) => {
      arHorarios = result;
      logger.debug("Retorno:", result);
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });

    arHorarios[0].HOINICIO = arHorarios[0].HOINICIO.split(':');
    arHorarios[0].HOFINAL  = arHorarios[0].HOFINAL.split(':');

    hrInicial = moment.utc({ year: 2017, month: 1, day: 1, hour: arHorarios[0].HOINICIO[0], minute: arHorarios[0].HOINICIO[1] });
    hrFinal   = moment.utc({ year: 2017, month: 1, day: 1, hour: arHorarios[0].HOFINAL[0], minute: arHorarios[0].HOFINAL[1] });

    const rangeMinutos = moment.range(hrInicial, hrFinal);
    //Array.from(rangeMinutos.by('minutes', { step: 30 }))
    for (let minutes of rangeMinutos.by('minutes', { step: arHorarios[0].QTMINJAN })) {
      arHorarios2.push(minutes.format('HH:mm'));
    }

    var sqlAclClient = '';

    //BUSCAR ID DO USUARIO
    if (req.body.IDS001 !== undefined){
      IDS001 = req.body.IDS001;
    }
    else if (req.headers.ids001 !== undefined){
      IDS001 = req.headers.ids001;
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

    logger.debug("Select slots");

        await db.execute(
          {
            sql: `Select    G028.IdG028 as CdArmaze,
                            G028.IDG028,
                            '' as DsSitage,
                            '' as DsTipMov,
                            To_Char(H007.HoInicio,'dd/mm/yyyy hh24:mi') as HoInicio,
                            COALESCE( TO_CHAR(H006.IDG046),
                                      (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046
                                         FROM H024 H024
                                        WHERE H024.IDH006 = H006.IDH006
                                          AND H024.SNDELETE = 0)
                                    ) AS NrCarga,
                            H005.NrJanela,
                            G032.NRFROTA,                --FROTA
                            H006.NRNFCARG,
                            CASE
                            	WHEN H006.TPOPERAC IS NOT NULL THEN H006.TPOPERAC
                            	WHEN H006.TPOPERAC IS NULL THEN
                            		(
                            			SELECT LISTAGG(TPOPERAC, ', ') WITHIN GROUP(ORDER BY TPOPERAC) TPOPERAC
                            			FROM (
                            					SELECT DISTINCT H024.TPOPERAC
                            					FROM H024
                            					WHERE H024.IDH006 = H007.IDH006
                            					AND H024.SNDELETE = 0
                            				 )
                            		)
                            END TPOPERAC,
                            CASE
                              WHEN H006.TPOPERAC IS NOT NULL THEN
                                (SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H006.TPOPERAC)
                              WHEN H006.TPOPERAC IS NULL THEN
                                (
                                  SELECT LISTAGG(DSOPERAC, ', ') WITHIN GROUP(ORDER BY DSOPERAC) DSOPERAC
                                  FROM (
                                      SELECT DISTINCT H024.TPOPERAC, G097.DSVALUE AS DSOPERAC
                                      FROM H024
                                      LEFT JOIN G097 ON G097.IDGRUPO = 1 AND G097.IDKEY = H024.TPOPERAC
                                      WHERE H024.IDH006 = H007.IDH006
                                      AND H024.SNDELETE = 0
                                    )
                                )
                            END DSOPERAC,
                            H006.IDH006,
                            H006.CDLACRE,
                            H006.CDCONTAI,
                            H006.NTFISCA1,
                            H006.IDBOX,
                            REPLACE(H006.NrPlaVei, '-') as NrPlaVei,
                            REPLACE(H006.NrPlaRe1, '-') as NrPlaRe1,
                            REPLACE(H006.NrPlaRe2, '-') as NrPlaRe2, 
                            H006.IdH006 as NrSeqAge,
                            H006.QtPeso as QtPeso,
                            H006.IDH002,
                            H006.NUMNAM,
                            G031.NmMotori as NmMotori, 
                            H006.IdS001,
                            (SELECT LISTAGG(G046.DSCARGA, ',') WITHIN GROUP(ORDER BY G046.DSCARGA)
                            		FROM H024 H024
                            		LEFT JOIN G046 G046 ON H024.IDG046 = G046.IDG046
                            		WHERE H024.IDH006 = H006.IDH006 And H024.SNDELETE = 0
                            ) AS DsCarga,
                            (SELECT SUM(G046.VRCARGA)
                            		FROM H024 H024
                            		LEFT JOIN G046 G046 ON H024.IDG046 = G046.IDG046
                            		WHERE H024.IDH006 = H006.IDH006 And H024.SNDELETE = 0
                            ) AS VrCarga,
                            H017.NmArqNot as LsNotas,
                            H006.IdG024 as IDG024,
                            Case 
                                When Nvl(H006.StAgenda, 1) = 0 Or H007.StHorari = 'B' Then 
                                  0
                                When H007.IDH006 IS NULL And H007.StHorari = 'R' then 
                                  2
                                else
                                    Nvl(H006.StAgenda, 1)
                              End      
                               as StAgenda,

                            H006.TpMovto as CdMovto,

                            Case 
                                When H006.TpMovto = 'C' Then 'Expedição'
                                else
                                    'Recebimento'
                              End      
                               as TpMovto,

                            Case 
                                When (round((CURRENT_DATE - H007.HoInicio) * 24,2) + 12) >= 0 Then '0'
                                else
                                    '1'
                              End      
                               as SnLibera,
                               
                              nvl((SELECT LISTAGG(stagenda, ',')
                                         WITHIN GROUP (ORDER BY IDH008 ) DsMovAge
                                  FROM H008 H008
                                  WHERE H008.IDH006 = H006.IdH006
                                  AND H008.SnDelete = 0),0) as DsMovAge,
                            G024.NmTransp as RsTransp,
                            G028.NmArmaze, 
                            H007.IdH007,
                            H007.STHORARI,
                            H006.IdH006,
                            round((H007.HoFinal - H007.HoInicio) * 24 * 60,0) as TmSlot,
                            H006.QTSLOTS,
                            (
                              SELECT LISTAGG(IDG005, ',') WITHIN GROUP(ORDER BY IDG005) IDG005
                              FROM  (
                                      SELECT DISTINCT G005.IDG005
                                        FROM H019
                                        JOIN G005 ON H019.IDG005 = G005.IDG005
                                        WHERE H019.IDH006 = H006.IDH006
                                          AND H019.SNDELETE = 0
                                          ${sqlAclClient}
                                    )
                            ) AS IDG005,
                            (
                              SELECT LISTAGG(NMCLIENT, ',') WITHIN GROUP(ORDER BY NMCLIENT) RSTOMADO
                              FROM  (
                                      SELECT DISTINCT G005.NMCLIENT
                                        FROM H019
                                        JOIN G005 ON H019.IDG005 = G005.IDG005
                                       WHERE H019.IDH006 = H006.IDH006
                                         AND H019.SNDELETE = 0
                                         ${sqlAclClient}
                                    )
                            ) AS RSTOMADO,
                            H007.STHORARI,
                            H006.TXOBSAGE,
                            H006.REPCHELI,
                            (SELECT LISTAGG(H022.DSMATERI || '- QTD: ' || H023.QTMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI) FROM H023 INNER JOIN H022 ON H023.IDH022 = H022.IDH022 WHERE H006.IDH006 = H023.IDH006) AS PRODUTOS

                  From      H007 H007
                  Join      H005 H005 On H005.IdH005 = H007.IdH005 And H005.StCadast = 'A'
                  Join      G028 G028 On G028.IdG028 = H005.IdG028
             Left Join      H006 H006 On H006.IdH006 = H007.IdH006
             Left Join      G024 G024 On G024.IdG024 = H006.IdG024
             Left Join      G031 G031 on G031.IDG031 = H006.IDG031
             Left Join      G032 G032 on REPLACE(H006.NRPLAVEI, '-') = REPLACE(G032.NRPLAVEI, '-')
             left Join      H017 H017 On H017.IDH006 = H006.IDH006 AND H017.SNDELETE = 0
                  Where     H007.SnDelete = 0 
                    And To_Char(H007.HoInicio,'dd/mm/yyyy') = :data
                    And H005.IdG028 = :armazem
                  Order By  H007.HoInicio, H005.NrJanela`,
            param: [req.body.DTPESQUI, armazem]
          })
    
          .then((result) => {
            arSlots = result;
            //logger.debug("Retorno:", result);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
      });
    
    logger.debug("Select Parâmetros Armazém");


    
    logger.debug("Adicionando janelas, horario, parâmetros e slots");

    retorno.janelas      = arJanelas2;
    retorno.descJan      = arDescJan2;
    retorno.horario      = arHorarios2;
    retorno.slots        = arSlots;
    retorno.parametros   = arArmazem;
    retorno.IDG024       = req.body.IDG024;

    //logger.debug("Retorno Final:", retorno);
    
    return retorno;
  }

  /**
   * @description Gerar slots.
   *
   * @async
   * @function api/gerarAgenda
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
  api.gerarAgenda = async function (req, res, next) {

    logger.debug("Inicio gerarAgenda");

    try {

      logger.debug("Parametros recebidos:", req.body);

      let arParametros       = null;
      let arInterAgendamento = null;
      let arJanelas          = null;
      let stParmIdH009       = true;
      let id = req.body.IDH009;

      stParmIdH009 = await api.stParametro('I', id);
      if (!stParmIdH009) {
        logger.error("Status parametro não atribuido |", id);
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };
      }




      let parametro = await db.execute(
        {
          sql: `Select Distinct H009.*
                  From H007 H007
                  Join H005 H005
                    On H005.Idh005 = H007.Idh005
                  Join G028 G028
                    On H005.Idg028 = G028.Idg028
                
                  Left Join H009 H009
                   On H009.Idg028 = G028.Idg028
                  And To_Date(H009.Dtinicio, 'dd/mm/yy') Between
                      To_Date(H007.Hoinicio, 'dd/mm/yy') And
                      To_Date(H007.Hofinal, 'dd/mm/yy')
                
                Where H009.IDH009 = `+req.body.IDH009+`
                  And To_Date(H007.Hoinicio, 'dd/mm/yy') Between
                      To_Date(H009.DTINICIO, 'dd/mm/yy') And
                      To_Date(H009.DTFINAL, 'dd/mm/yy')
                  And H007.Sndelete = '0'
                  And H009.Sndelete = '0'`,
                  param:[]
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
  
      if (parametro != undefined) {
        logger.error("Slots existentes existente");
        res.status(500);
        return { nrlogerr: -1, response: [req.__('hc.erro.slotsCadastrado')] };
      }




      let objParam = await db.execute(
        {
          sql: ` Select H009.IdH009,   H009.IdG028,   H009.DtInicio, 
                        H009.DtFinal,  H009.StCadast, H009.DtCadast, 
                        H009.IdS001,   H009.SnDelete, H009.IdH015, 
                        H009.QtMinJan, H009.StParame 
                  From  H009 H009 
                  Where H009.IdH009 = :id `,
          param: {id:id},
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

      if (objParam.IDH009 == undefined || objParam.IDG028 == undefined) {
        logger.error("Parametro não encontrado");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };
      }
      

      var Moment = require('moment');
      Moment.locale('pt-BR');
      var MomentRange = require('moment-range');
      var moment = MomentRange.extendMoment(Moment);

      logger.debug("Parametros recebidos:");

      logger.debug("Select configuracoes do armazem");

      await db.execute(
      {
        sql: `Select      H009.IdG028, H009.DtInicio, H009.DtFinal, 
                          H010.NrDia,  H010.HoInicio, H010.HoFinal, H010.QtMinJan
              From        H009 H009 /*Parametros*/
              Left Join   H010 H010 On (H010.IDH009 = H009.IDH009) /*Parametros Dia*/

              Where       nvl(H009.SnDelete,0) = 0 And nvl(H010.SnDelete,0) = 0 And H009.IdG028 = `+ objParam.IDG028 + ` 
              And H009.IdH009 = `+objParam.IDH009 ,
        param: []        
      })

      .then((result) => {
        arParametros = result;
        logger.debug("Retorno:", result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
      logger.debug("Select intervalo");

      await db.execute(
        {
          sql: `Select   H011.NrDia, 
                        H011.HoiniInt, 
                        H011.HofinInt
                From     H011 H011
                Where    H011.SnDelete = 0
                And      IdH009 = `+ objParam.IDH009,
          param: []        
        })

        .then((result) => {
          arInterAgendamento = result;
          logger.debug("Retorno:", result);
        })

        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
        
        logger.debug("Select janelas");

        await db.execute(
          {
            sql: `Select  H005.IdH005
                    From  H005 H005
                  Where  H005.SnDelete = 0
                    And  H005.IdG028   = `+ objParam.IDG028,
            param: []        
          })
    
          .then((result) => {
            arJanelas = result;
            logger.debug("Retorno:", result);
          })
    
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });
      
      //Array.from(moment.range(arParametros[0].DTINICIO, arParametros[0].DTFINAL).by('days'))
      if (arParametros == undefined) {
        logger.error("Parametro não encontrado");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };
      } else if(arParametros[0].HOINICIO == null || arParametros[0].HOFINAL == null) { 
        logger.error("Hora inicio/final não encontrado");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };

      }



      const range   = moment.range(arParametros[0].DTINICIO, arParametros[0].DTFINAL); //moment(arParametros[0].DTINICIO).add(1, 'day'));
      let insert    = '';
      let minutes2  = null;
      let hrInicial = null;
      let hrFinal   = null;

      let isInterAgendamento = '';

      logger.debug("Configuração dias da semana");

      for (let day of range.by('days')) {
        //day.format('DD-MM-YYYY HH:mm');
        //day.utc().set('hour', 13).set('minute', 20);
        let isDiaSemana = -1;
        for (parametro in arParametros) {
          if (arParametros[parametro].NRDIA == day.weekday() && arParametros[parametro].NRDIA == 0) {
            isDiaSemana = 0;
          } else if (arParametros[parametro].NRDIA == day.weekday() && arParametros[parametro].NRDIA == 6) {
            isDiaSemana = 6;
          } else if (arParametros[parametro].NRDIA != 0 &&
            arParametros[parametro].NRDIA != 6 &&
            arParametros[parametro].NRDIA <= day.weekday() &&
            (day.weekday() >= 1 && day.weekday() < 6)) {
            isDiaSemana = 1;
          }
          if (isDiaSemana != -1) {
            if ((typeof arParametros[parametro].HOINICIO) === "string") {
              arParametros[parametro].HOINICIO = arParametros[parametro].HOINICIO.split(":");
              arParametros[parametro].HOFINAL = arParametros[parametro].HOFINAL.split(":");
            }
            hrInicial = moment.utc({ year: day.get('year'), month: day.get('month'), day: day.get('date'), hour: arParametros[parametro].HOINICIO[0], minute: arParametros[parametro].HOINICIO[1] });
            hrFinal = moment.utc({ year: day.get('year'), month: day.get('month'), day: day.get('date'), hour: arParametros[parametro].HOFINAL[0], minute: arParametros[parametro].HOFINAL[1] });
            break;
          }
        }
        if (isDiaSemana != -1) {
          const rangeMinutos = moment.range(hrInicial, hrFinal);
          //Array.from(rangeMinutos.by('minutes', { step: 30 }))
          for (let minutes of rangeMinutos.by('minutes', { step: arParametros[0].QTMINJAN })) {
            minutes2 = null;
            minutes2 = minutes.clone();
            minutes2.add(arParametros[0].QTMINJAN, 'minutes');//.minute(arParametros[0].QTMINJAN);
            for (janela in arJanelas) {
                
              for (interAgendamento in arInterAgendamento) {
                isInterAgendamento = '';
                /*
                if (arInterAgendamento[interAgendamento].NRDIA == isDiaSemana &&
                  minutes.format('HH:mm') == arInterAgendamento[interAgendamento].HOINIINT &&
                  minutes2.format('HH:mm') == arInterAgendamento[interAgendamento].HOFININT) {
                  isInterAgendamento = 'B';
                  break;
                }
                */
               
                
                let compararHora = await utils.compararHoraString(arInterAgendamento[interAgendamento].HOINIINT,
                  arInterAgendamento[interAgendamento].HOFININT,
                  minutes.format('HH:mm'))
               //console.log('compararHoraString', compararHora);
                if (arInterAgendamento[interAgendamento].NRDIA == isDiaSemana && compararHora) {
                  isInterAgendamento = 'B';
                  break;
               }




              }

              //logger.debug("Criando inserts slots");

              insert = insert +
                `Into H007 (IdH007, IdH005, IdH006, HoInicio, HoFinal, StHorari)
                    Values    (FN_NEXTIDH007, `+ arJanelas[janela].IDH005 + `, null, To_Date('` + minutes.format('DD-MM-YYYY HH:mm') + `', 'dd-mm-yyyy hh24:mi'), To_Date('` + minutes2.format('DD-MM-YYYY HH:mm') + `', 'dd-mm-yyyy hh24:mi'), '` + isInterAgendamento + `')\n`;
                    
                
            }
          }
        }
      }
      
      //logger.debug("Insert slots:", insert);

      await db.execute(
        {
          sql: `Insert All `
              + insert +
              ` Select * From dual`,
          param: []
        })

        .then((result) => {
          logger.debug("Retorno:", result);
        })

        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      stParmIdH009 = await api.stParametro('P', id);
      if (!stParmIdH009) {
        logger.error("Status parametro não atribuido P", id);
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };
      }
      
      logger.debug("Fim");
      
      return {responde: req.__('hc.sucesso.inserirRegistro')};
      
    } catch (err) {

      let stParmIdH009 = await api.stParametro('N', req.body.IDH009);
      if (!stParmIdH009) {
        logger.error("Status parametro não atribuido N", req.body.IDH009);
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumRegistro')] };
      }

      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;


    }
	}
  //api.gerarAgenda(null,null,null); 


  api.stParametro = async function (status, id) {

    logger.debug("Inicio stParametro");
    let con = await this.controller.getConnection();
    logger.debug("Parametros recebidos:", status, id);
    
      let result = await
      con.update({
        tabela: 'H009',
        colunas: {
          StParame: status
        },
        condicoes: 'IdH009 = :id',
        parametros: {
          id: id
        }
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return true;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        return false;
        throw err;
        });
    
    await con.close();
    logger.debug("Fim stParametro");
    
    return result;
  }



  /**
   * @description Delete um dado na tabela H009.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.deleteSlots = async function (req, res, next) {

      logger.debug("Inicio deleteSlots");
      let con = await this.controller.getConnection();
  
      try {
      
      let id = req.body.IDH009;
      
      let parametro = await con.execute(
        {
          sql: ` Select H009.Dtinicio,
                        H009.Dtfinal,
                        H009.Idh009,
                        (Select Listagg(Idh005, ',') Within Group(Order By Idh005) Dsmovage
                          From H005 H005
                          Where H005.Idg028 = H009.Idg028) As Idh005s
                  From H009 H009
                 Where H009.IDH009 = :id `,
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
          logger.error("Erro:", err);
          throw err;
        });
  
      if (parametro.IDH009 == undefined) {
        logger.error("Parametro nao encontrado");
        res.status(500);
        return { nrlogerr: -1, armensag: [req.__('hc.erro.slotsIndisponivel')] };
        }
        

      var Moment = require('moment');
      Moment.locale('pt-BR');
      var MomentRange = require('moment-range');
      var moment = MomentRange.extendMoment(Moment);
        
      let paramIni = moment(parametro.DTINICIO).format('L');
      let paramFin = moment(parametro.DTFINAL).format('L');
      let updateH007 = await
        con.execute({
  
            sql: ` Update H007 
                   set SnDelete = '1', 
                       SnFlagDe = IDH007
                   where to_date(HOINICIO, 'dd/mm/yy') Between To_Date('`+paramIni+`', 'dd/mm/yyyy') And
            To_Date('`+ paramFin + `', 'dd/mm/yyyy') and idH005 in (`+parametro.IDH005S+`)`,
            param: []
          })
  
          .then((result1) => {
          logger.debug("Retorno Update delete:", result1);
          return { response: req.__('hc.sucesso.parametrosExcluido') };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
        
      
      let result = await
        con.update({
          tabela: 'H009',
          colunas: {
            StParame: 'S'
          },
          condicoes: ` IdH009 in (`+req.body.IDH009+`)`,
          param: []
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return { response: req.__('hc.sucesso.parametrosExcluido') };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
        
        await con.close();
        logger.debug("Fim deleteSlots");
        return result;
      
      } catch (err) {
  
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      
      }
  
    }; 

    api.buscarListaReservados = async function (req, res, next) {

      logger.debug("Inicio buscar lista com slots reservados");
  
      var strSQL = `
                      Select  H007.IDH007
                      From    H007
                      Inner Join H005 
                        On H005.IDH005 = H007.IDH005
                      Inner Join H020 
                        On H020.IDH007 = H007.IDH007
                      Where H007.SNDELETE = 0 
                      And   H005.IDG028 = ${req.IDG028}
                      And   H007.STHORARI = 'R'
                      And   H007.IDH006 IS NULL
                      And   H020.TPPARAME = '${req.TPPARAME}'
                      And   H020.NRVALUE IN (${req.NRVALUE.join()})
                      And   H020.SNDELETE = 0
                      And  To_Char(H007.HOINICIO, 'DD/MM/YYYY') = '${req.HOINICIO}'
                    `
  
      return await db.execute(
        {
          sql: strSQL,
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
  
      logger.debug("Fim buscar lista com slots reservados");
    };

    api.horariosResumido = async function (req, res, next) {

      logger.debug("Inicio buscar transportadoras com slots reservados");
  
      var strSQL = `
                      SELECT H007.*, H005.NRJANELA FROM H007
                      INNER JOIN H005 ON H005.IDH005 = H007.IDH005
                      WHERE H007.SNDELETE = 0 
                      AND IDH006 IS NULL
                      AND H005.IDG028 = ${req.body.IDG028}
                      AND TO_CHAR(HOINICIO, 'YYYY-MM-DD') = '${req.body.HOINICIO}'
                      AND (H007.STHORARI IS NULL OR H007.STHORARI = 'L') 
                    `
  
      return await db.execute(
        {
          sql: strSQL ,
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
    };
  
  

  return api;
}