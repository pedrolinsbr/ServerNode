/**
 * @description Possui os métodos responsaveis por validar e reagendar uma carga
 * @author Everton
 * @since 25/04/2018
 * 
*/

/** 
 * @module dao/Reagendamento
 * @description H006/H007/H008.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  var fs = require('fs');
  var api         = {};
  var utils       = app.src.utils.FuncoesObjDB;
  //var deliveryDAO = app.src.modIntegrador.dao.DeliveryDAO;
  var dtatu       = app.src.utils.DataAtual;
  var asnDAO      = app.src.modIntegrador.dao.ASNDAO;
  var DAOAgendamento      = app.src.modHoraCerta.dao.AgendamentoDAO;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  var db = require(process.cwd() + '/config/database');
  const tmz 		= app.src.utils.DataAtual;

  /**
   * @description Busca um dado na tabela H007.
   *
   * @async
   * @function api/buscarHorarioReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */ 
  api.buscarHorarioReagendar = async function (req, res, next) {

    logger.debug("Inicio buscarHorarioReagendar");
    
    logger.debug("Parametros recebidos:", req.body);

    var data = moment(req.body.DTPESQUI).format('L');
    var armazem = req.body.IDG028;
    
    logger.debug("Select buscando janelas e horarios disponiveis");

    return await db.execute(
      {
        sql: `Select H007.*,
                     'Janela ' || H005.NrJanela || ' - ' || To_Char(H007.HoInicio,'HH24:mi') as dt
                From H007 H007
                Join H005 H005 on H005.IdH005 = H007.Idh005
               Where H007.IdH006   is null
                 And H007.StHorari is null
                 And H005.IdG028   = :armazem
                 And H007.SnDelete = '0'
                 And To_Char(H007.HoInicio,'dd/mm/yyyy') = :data /*'25/12/2017'*/
            Order by H005.NrJanela `,
        param: [armazem, data],
      })
      .then((result) => {

        var retorno = utils.array_change_key_case(result);
        logger.debug("Retorno:", retorno);
        return retorno;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim buscarHorarioReagendar");
  };


  /**
   * @description Validação do slot reagendado.
   *
   * @async
   * @function api/validaSlotReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.validaSlotReagendar = async function (req, res, next) {

    logger.debug("Inicio validaSlotReagendar");

    var Moment = require('moment');
    Moment.locale('pt-BR');
    var MomentRange = require('moment-range');
    var moment = MomentRange.extendMoment(Moment);

    var data = moment(req.body.DTPESQUI).format('L');
    var idSlot  = req.body.DTAGENDA; //62373
    var qtSlot  = req.body.QTSLOTS; //4

    logger.debug("Quantidade de slots");

    var sqlCommAnd = ` Select Temp.*
                         From (Select H007.*
                                 From H007 H007
                                 Join H005 H005
                                   On H005.Idh005 = H007.Idh005
                                Where To_Char(H007.Hoinicio, 'dd/mm/yyyy') = '`+data+`'
                                     /*And IdH007 >= idSlot */
                                  And Hoinicio >= (Select H007a.Hoinicio
                                                     From H007 H007a
                                                    Where H007a.Idh007 = `+idSlot+`)
                                  And H005.Idg028 =
                                      (Select H005.Idg028
                                         From H007 H007
                                         Join H005 H005
                                           On H005.Idh005 = H007.Idh005
                                        Where H007.Idh007 = `+idSlot+`)
                                  And (Round((Current_Date - H007.Hoinicio) * 24, 2) + 12) < 0
                                Order By H005.Idh005, H007.Hoinicio Asc) Temp
                        Where Rownum <= `+qtslot;
             
    return await db.execute(
      {
        sql: sqlCommAnd,
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

    logger.debug("Fim validaSlotReagendar");
  };

  /**
   * @description Salvar um dado na tabela H006.
   *
   * @async
   * @function api/reagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.reagendar = async function (req, res, next) {
    
    logger.debug("Inicio reagendar");

    var id            =   0;
    var reasonCode    =   req.body.IDI015;
    var IdH006Atual   =   req.body.IDH006;


    logger.debug("Buscando quantidade de agendas");

    let qtd = await db.execute(
      {
        sql: ` Select Count(IdH006) As Qtd 
                 From H007 H007 
                Where IdH007   In (`+req.body.idSlots.join()+`) 
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
      logger.error("Nem todos os Slots estão liberados. Por favor atualize refaça a pesquisa");
      res.status(500);
      return { nrlogerr: -1, armensag: [req.__('hc.erro.slotsLiberados')] };
    }

    logger.debug("Buscar dados da agenda antiga");

    let agendaAntiga = await db.execute(
      {
        sql: `Select H006.* 
                From H006 H006 
               Where IdH006 = `+IdH006Atual,
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

    if (agendaAntiga == undefined) {
      logger.error("Agendamento não encontrado");
      res.status(500);
      return { nrlogerr: -1, armensag: [req.__('hc.erro.agendaNaoEncontrado')] };
    }
    
    await db.insert({
      tabela: 'H006',
      colunas: {

        IDG028:   agendaAntiga.IDG028,
        STAGENDA: agendaAntiga.STAGENDA,
        IDH002:   agendaAntiga.IDH002,
        TPMOVTO:  agendaAntiga.TPMOVTO,
        IDG024:   agendaAntiga.IDG024,// 1,
        QTSLOTS:  agendaAntiga.QTSLOTS,
        NRNFCARG: agendaAntiga.NRNFCARG,
        IDG030:   agendaAntiga.IDG030,
        IDG005:   agendaAntiga.IDG005,
        QTPESO:   agendaAntiga.QTPESO,
        NRPLAVEI: agendaAntiga.NRPLAVEI,
        IDG031:   agendaAntiga.IDG031,
        IDH003:   agendaAntiga.IDH003,
        /*IDG032: agendaAntiga.IDG032,*/
        NRPLARE1: agendaAntiga.NRPLARE1,
        NRPLARE2: agendaAntiga.NRPLARE2,
        TXOBSAGE: agendaAntiga.TXOBSAGE,
        SNIMPMAP: agendaAntiga.SNIMPMAP,
        NRREGIST: agendaAntiga.NRREGIST,
        NRTUSAP:  agendaAntiga.NRTUSAP,
        SNDELETE: agendaAntiga.SNDELETE,
        IDS001:   req.body.IDS001, //agendaAntiga.IDS001,
        IDG046:   agendaAntiga.IDG046,
        STAGENDA: 3, /*Reservado*/
        SNDELETE: 0,
        QTTEMPRE: agendaAntiga.QTTEMPRE,
        DTCADAST: tmz.dataAtualJS()
      },
      key: 'IDH006'
    })
      .then(async (result1) => {
        var HOINICIO = await DAOAgendamento.buscarHoinicio({idSlots:req.body.idSlots}, res, next)
        await DAOAgendamento.mudarEtapa({IDS001: req.body.IDS001, IDH006: result1, ETAPA: 11, IDI015: req.body.IDI015, HOINICIO: HOINICIO[0].HOINICIO}, res, next);
        logger.debug("Retorno:", result1);
        id = result1;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      logger.debug("Atribuindo agenda no slot", id);

      await db.update({
        tabela: 'H007',
        colunas: {
          IDH006: id
        },
        condicoes: 'IDH007 In ('+req.body.idSlots.join()+')',
        parametros: {
          //id: slot
        }
      })
      .then( (result1) => {

        logger.debug("Retorno:", result1);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      
      var dataAgenda = await db.execute(
        {
          sql: ` 
                Select  DISTINCT DT_AGENDA_ANTIGA.Hoinicio AS DT_AGENDA_ANTIGA, DT_AGENDA_NOVA.Hoinicio AS DT_AGENDA_NOVA
                  From H007
                  Inner Join (Select IDH006, Hoinicio FROM H007) DT_AGENDA_ANTIGA ON DT_AGENDA_ANTIGA.IDH006 = ${IdH006Atual}
                  Inner Join (Select IDH006, Hoinicio FROM H007) DT_AGENDA_NOVA	ON DT_AGENDA_NOVA.IDH006 = ${id}
              `,
  
          param: [],
        })
  
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    
     let alterarPreSai =  await db.execute(
        {
         sql: ` Select Idh007,
                       To_Char(Hoinicio, 'YYYY-MM-DD HH24:MI:SS') HoInicio,
                       To_Char(Hofinal,  'YYYY-MM-DD HH24:MI:SS') As HoFinal
                  From H007 
                 Where IdH007 In (`+req.body.idSlots.join()+`)
                 Order by IDH007 Asc`,
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

        if (alterarPreSai.length < 1) {
          logger.error("Nenhum agendamento localizado");
          res.status(500);
          return { nrlogerr: -1, armensag: [req.__('hc.erro.nenhumMilestoneGerado')] };
        }

      await db.execute(
        {
            sql: ` Update G046 
                      Set DtPreSai = TO_DATE('` + alterarPreSai[0].HOFINAL +`', 'YYYY-MM-DD HH24:MI:SS')            
                    Where IDG046 = (Select idG046 From h006 Where idh006 = `+IdH006Atual+`)` ,
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
          

      logger.debug("Atribuindo DTAGENDA na G046", id);

      // data de agenda
      var datinha = new Date();
      await db.execute(
        {
            sql: `Update G046 Set DtAgenda = :Datinha Where Idg046 = `+ agendaAntiga.IDG046,
            param: [datinha],
        })
        .then((result) => {

          logger.debug("Retorno:", result);

        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        });
        
           
      logger.debug("Atribuindo SnDelete = 1 na H006:", IdH006Atual);

      await db.update({
        tabela: 'H006',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IDH006 = :id',
        parametros: {
          id: IdH006Atual
        }
      })
      .then( (result1) => {
        logger.debug("Retorno:", result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      logger.debug("Atribuindo IDH006 = '' na H007:", IdH006Atual);
      
      return await db.update({
        tabela: 'H007',
        colunas: {
          IDH006: ''
        },
        condicoes: 'IDH006 = :id',
        parametros: {
          id: IdH006Atual
        }
      })
      .then( (result1) => {

        logger.debug("Retorno:", result1);
        return id;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

    logger.debug("Fim reagendar");
  };

  return api;

};
