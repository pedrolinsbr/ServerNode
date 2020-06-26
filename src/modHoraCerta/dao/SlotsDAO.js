/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 09/03/2018
 * 
*/

/** 
 * @module dao/Slots
 * @description H007.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;
  var db     = app.config.database;


  /**
   * @description Busca slots.
   *
   * @async
   * @function api/getSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
 api.getSlots = async function (req, res, next) {

  logger.debug("Inicio getSlots");

  let arJanelas   = null;
  let arJanelas2  = [];
  let arHorarios  = null;
  let arHorarios2 = [];
  let arSlots     = null;
  let retorno     = {}; 

  var Moment = require('moment');
  Moment.locale('pt-BR');
  var MomentRange = require('moment-range');
  var moment = MomentRange.extendMoment(Moment);

  logger.debug("Parametros recebidos:", req.body);

  var armazem = req.body.IDG028;
  var data    = moment(req.body.DTPESQUI).format('L');

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

  let acl1 = '';
  if ( req.headers.dsmodulo !== undefined  && req.headers.dsmodulo !== "") {
    acl1 = await acl.montar({
      ids001: req.headers.ids001,
      dsmodulo: req.headers.dsmodulo,
      nmtabela: [{ G024: 'G024' }]
    });
    acl1 = ' And ' + acl1;
  }

  logger.debug("ACL:", acl1);

  logger.debug("Select slots", data, armazem);

      await db.execute(
        {
          sql: `Select    G028.IdG028 as CdArmaze, 
                          '' as DsSitage, 
                          '' as DsTipMov, 
                          To_Char(H007.HoInicio,'dd/mm/yyyy hh24:mi') as HoInicio, 
                          '' as NrCarga, 
                          H005.NrJanela, 
                          H006.NrPlaVei as NrPlaVei, 
                          H006.IdH006 as NrSeqAge, 
                          H006.IdS001,
                          G005.NmClient as RsTomado,
                          
                          Case
                            When H007.IDH006 Is Not Null Then 
                              'O'
                            else
                              Nvl(H007.StHorari, 'L')
                          End as StHorari,
                          

                          Case
                              When Nvl(H006.StAgenda, 1) = 0 And H007.StHorari = 'R' Then 0  
                              When Nvl(H006.StAgenda, 1) = 0 And H007.StHorari = 'B' Then 0 
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
                              When Nvl(H006.StAgenda, 1) = 0 Or H007.StHorari = 'B' Then 'Inativo' 
                              When Nvl(H006.StAgenda, 1) = 1 And (round((CURRENT_DATE - H007.HoInicio) * 24,2) + 12) >= 0 Then 'Tempo limite expirado' 
                              When Nvl(H006.StAgenda, 1) = 1 Then 'Livre' 
                              When Nvl(H006.StAgenda, 1) = 2 Then 'Pré-reservado' 
                              When Nvl(H006.StAgenda, 1) = 3 Then 'Reservado' 
                              When Nvl(H006.StAgenda, 1) = 4 Then 'Chegou na portaria' 
                              When Nvl(H006.StAgenda, 1) = 5 Then 'Entrou na portaria' 
                              When Nvl(H006.StAgenda, 1) = 6 Then 'Iniciou a operação' 
                              When Nvl(H006.StAgenda, 1) = 7 Then 'Check-out' 
                              When Nvl(H006.StAgenda, 1) = 8 Then 'Saiu na portaria' 
                              When Nvl(H006.StAgenda, 1) = 9 Then 'Faltou'
                              When Nvl(H006.StAgenda, 1) = 10 Then 'Cancelado' 
                              else
                                  ''
                            End      
                             as DsStaAge,
                            Case 
                              When Nvl(H006.StAgenda, 1) = 0 Or H007.StHorari = 'B' Or Nvl(H006.StAgenda, 1) = 2 Then 'inative' 
                              When Nvl(H006.StAgenda, 1) = 1 Then 'secondary' 
                              When Nvl(H006.StAgenda, 1) = 3 Or Nvl(H006.StAgenda, 1) = 4 Or
                                   Nvl(H006.StAgenda, 1) = 5 Or Nvl(H006.StAgenda, 1) = 6 Or
                                   Nvl(H006.StAgenda, 1) = 8 Then 'primary'
                              When Nvl(H006.StAgenda, 1) = 7 Then 'success' 
                              When Nvl(H006.StAgenda, 1) = 9 Then 'danger' 
                              else
                                  ''
                            End      
                             as ClAgenda, 
                             
                            G024.NmTransp as RsTransp,
                            G028.NmArmaze, 
                            H007.IdH007,
                            H006.IdH006,
                            round((H007.HoFinal - H007.HoInicio) * 24 * 60,0) as TmSlot,
                            H006.QTSLOTS
                From      H007 H007
                Join      H005 H005 On H005.IdH005 = H007.IdH005
                Join      G028 G028 On G028.IdG028 = H005.IdG028
           Left Join      H006 H006 On H006.IdH006 = H007.IdH006
           Left Join      G024 G024 On G024.IdG024 = H006.IdG024
           Left Join      G005 G005 On G005.IdG005 = H006.IdG005
                Where     H007.SnDelete = 0 
                  And To_Char(H007.HoInicio,'dd/mm/yyyy') =  :data  /*'09/02/2018'*/
                  And H005.IdG028 = :armazem `+acl1+`
                  
                  /*And (Nvl(H006.IDH006, 0) <> 0 Or (round((CURRENT_DATE - H007.HoInicio) * 24,2) + 12) >= 0)*/
                Order By  H007.HoInicio, H005.NrJanela`,
          param: [req.body.DTPESQUI,armazem]
        })
  
        .then((result) => {
          arSlots = result;
          logger.debug("Retorno:", result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
    });
  
  logger.debug("Adicionando janelas, horario e slots");

  retorno.janelas = arJanelas2;
  retorno.horario = arHorarios2;
  retorno.slots   = arSlots;

  logger.debug("Retorno Final:", retorno);
  
  return retorno;
}

  /**
   * @description Atualizar um dado na tabela H007.
   *
   * @async
   * @function api/atribuirStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atribuirStatus = async function (req, res, next) {

    logger.debug("Inicio atribuirStatus");
    let con = await this.controller.getConnection();
    try {

      var slots = req.body.IDH007;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H007',
          colunas: {
              StHorari: req.body.STAGENDA
            , StHorAnt: req.body.STAGENDA
          },
          condicoes: 'IDH007 in ('+slots+') And IDH006 IS NULL',
          parametros: {}
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      await con.close();
      logger.debug("Fim atribuirStatus");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };


  /**
   * @description Atualizar um dado na tabela H007.
   *
   * @async
   * @function api/replicarStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.replicarStatus = async function (req, res, next) {

    logger.debug("Inicio replicarStatus");
    let con = await this.controller.getConnection();
    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await
       db.execute(
        {
            sql: `
            Update H007 H007
            Set H007.Sthorari =
                (Select b.Sthorari
                   From H007 b
                  Where To_Char(b.Hoinicio, 'HH24:mi:ss') =
                        To_Char(H007.Hoinicio, 'HH24:mi:ss')
                    And b.Idh005 = H007.Idh005
                    And To_Date(b.Hoinicio, 'dd/mm/yy') =
                        To_Date(:dataReplica, 'dd/mm/yyyy')
                    And b.SnDelete = 0 )
              , H007.SthorAnt =
                    (Select b.Sthorari
                       From H007 b
                      Where To_Char(b.Hoinicio, 'HH24:mi:ss') =
                            To_Char(H007.Hoinicio, 'HH24:mi:ss')
                        And b.Idh005 = H007.Idh005
                        And To_Date(b.Hoinicio, 'dd/mm/yy') =
                            To_Date(:dataReplica, 'dd/mm/yyyy')
                        And b.SnDelete = 0 )
          Where To_Date(H007.Hoinicio, 'dd/mm/yy') Between
                To_Date(:dataInicio, 'dd/mm/yyyy') And
                To_Date(:dataFinal, 'dd/mm/yyyy')
            And H007.Idh005 In
                (Select Idh005 From H005 Where Idg028 = :armazem)
            And H007.SnDelete = 0 `,
            param: {
              armazem: req.body.IDG028,
              dataReplica: req.body.DTREPLICA,
              dataInicio: req.body.DTINICIO,
              dataFinal: req.body.DTFINAL
            }      
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      await con.close();
      logger.debug("Fim replicarStatus");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };

      /**
   * @description Insere uma reserva do(s) slots.
   *
   * @async
   * @function api/atribuirStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvarReserva = async function (req, res, next) {

    logger.debug("Inicio salvarReserva");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      await con.insert({
        tabela: 'H020',
        colunas: {
          TPPARAME: req.TPPARAME,
          NRVALUE: req.NRVALUE,
          DTCADAST: new Date(),
          IDH007: req.IDH007
        },
        key: 'Idh020'
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

      await con.close();
      logger.debug("Fim salvar");
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }
  };

    /**
   * @description Exclui uma reserva do(s) slots.
   *
   * @async
   * @function api/atribuirStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluirReserva = async function (req, res, next) {

    logger.debug("Inicio excluirReserva");
    let con = await this.controller.getConnection();
    try {

      var slots = req.body.IDH007;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H020',
          colunas: {
            SNDELETE: 1
          },
          condicoes: `IDH007 in (${req.body.IDH007}) AND TPPARAME = 'T' AND SNDELETE = 0`,
          parametros: {}
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      await con.close();
      logger.debug("Fim excluirReserva");
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
