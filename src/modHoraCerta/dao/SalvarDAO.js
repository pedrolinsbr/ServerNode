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
  var api         = {};
  var utils       = app.src.utils.FuncoesObjDB;
  var asnDAO      = app.src.modIntegrador.dao.ASNDAO;
  var cargasDAO   = app.src.modIntegrador.dao.CargasDAO;
  var dtatu       = app.src.utils.DataAtual;
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;


  const gdao = app.src.modGlobal.dao.GenericDAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');

  api.verificarSlotLivre = async function (req, res, next){

    req.sql = 
              `Select Count(IdH006) As Qtd 
                From H007 H007 
                Where IdH007   In (${req.body.idSlots.join()}) 
                And IdH006   Is Not Null
                And StHorari Is Null`;
    
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  api.buscarHoinicio = async function (req, res, next) {

    req.sql = `
                Select MIN(IDH007) AS IDH007, 
                       IDH006,
                       to_char(MIN(HOINICIO), 'dd/mm/yyyy hh24:mi:ss') AS HOINICIO
                From h007 Where idh007 in (${req.body.idSlots.join()})
                Group by idh006
          `

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarDtpsmanu = async function (req, res, next) {

    req.sql = `
                SELECT DTPSMANU 
                  FROM G046 
                WHERE IDG046 = ${req.body.dadosCarga.IDG046}
              `

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarDeliveries = async function (req, res, next) {

    req.sql = `
                Select  Carga.Idg046,
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
                Group By Carga.Idg046, Parada.Idg048
              `

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarDataAgenda = async function (req, res, next) {

    req.sql = `
                  Select Idh007, To_Char(Hoinicio, 'YYYY-MM-DD HH24:MI:SS') Hoinicio
                  From H007
                Where Idh007 In (`+ slots + `)
                Order By Idh007 Asc
              `

    return await gdao.executar(req, res, next).catch((err) => { throw err });
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
        return 1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
  };

  api.atualizarDtPreAtu = async function (req, res, next){

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

  api.inserir = async function (req, res, next){

    var objBanco = {
        table:    'H006'
      , key:      ['IDH006']
      , vlFields:  {}
    }

    objBanco.vlFields.IDG028      =     req.body.dadosCarga.IDG028.id;
    objBanco.vlFields.IDH002      =     req.body.dadosCarga.IDH002.id;
    objBanco.vlFields.TPMOVTO     =     req.body.dadosCarga.TPMOVTO;
    objBanco.vlFields.IDG024      =     req.body.dadosCarga.IDG024.id;
    objBanco.vlFields.QTSLOTS     =     req.body.dadosCarga.numSlots;
    objBanco.vlFields.IDG030      =     req.body.dadosCarga.IDG030.id;
    objBanco.vlFields.NRNFCARG    =     req.body.dadosCarga.NRNFCARG;
    objBanco.vlFields.QTPESO      =     req.body.dadosCarga.PSCARGA;
    objBanco.vlFields.NRPLAVEI    =     req.body.dadosCarga.NRPLAVEI;
    objBanco.vlFields.IDG031      =     req.body.dadosCarga.IDG031;
    objBanco.vlFields.NRPLARE1    =     req.body.dadosCarga.NRPLARE1;
    objBanco.vlFields.NRPLARE2    =     req.body.dadosCarga.NRPLARE2;
    objBanco.vlFields.TXOBSAGE    =     req.body.dadosCarga.obs;
    objBanco.vlFields.IDS001      =     req.body.IDS001;
    objBanco.vlFields.IDG046      =     req.body.dadosCarga.IDG046;
    objBanco.vlFields.STAGENDA    =     3;
    objBanco.vlFields.SNDELETE    =     0;
    objBanco.vlFields.QTTEMPRE    =     req.body.dadosCarga.tempoOp;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
    objBanco.vlFields.LSNOTAS     =     req.body.dadosCarga.notas.join();
    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.inserirTerceiros = async function (req, res, next){

    var objBanco = {
        table:    'H006'
      , key:      ['IDH006']
      , vlFields:  {}
    }
    objBanco.vlFields.IDH002      =     1;
    objBanco.vlFields.IDG024      =     15;
    objBanco.vlFields.NRPLAVEI    =     req.body.NRPLAVEI;
    objBanco.vlFields.IDG031      =     req.body.IDG031;
    objBanco.vlFields.TXOBSAGE    =     req.body.TXOBSAGE;
    objBanco.vlFields.IDS001      =     req.body.IDS001;
    objBanco.vlFields.STAGENDA    =     3;
    objBanco.vlFields.SNDELETE    =     0;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
    objBanco.vlFields.TPOPERAC    =     8
    objBanco.vlFields.IDG028      =     req.body.IDG028;  
    objBanco.vlFields.AREASERV    =     req.body.AREASERV ;
    objBanco.vlFields.NUMAUTO     =     req.body.NUMAUTO;
    objBanco.vlFields.AUTORIZA    =     req.body.AUTORIZA;
    objBanco.vlFields.PRSERVIC    =     req.body.PRSERVIC;

    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.atualizarEtapaDelivery = async function (req, res, next) {
    return await
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
                                 Where g046.idg046 = ${req.body.dadosCarga.IDG046})`,
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
  


    
  return api;

};



/*     sql = `Insert Into H006 
                      ( IDG028, IDH002, TPMOVTO, IDG024, QTSLOTS, IDG030, NRNFCARG, QTPESO,
                        NRPLAVEI, IDG031, NRPLARE1, NRPLARE2, TXOBSAGE, IDS001, 
                        IDG046, STAGENDA, SNDELETE, QTTEMPRE, DTCADAST, LSNOTAS
                      ) 
                       Values(  ${colunas.IDG028}, ${colunas.IDH002}, '${colunas.TPMOVTO}', ${colunas.IDG024}, ${colunas.QTSLOTS}, ${colunas.IDG030}, '${colunas.NRNFCARG}', ${colunas.QTPESO},
                                '${colunas.NRPLAVEI}', ${colunas.IDG031}, '${colunas.NRPLARE1}', '${colunas.NRPLARE2}', '${colunas.TXOBSAGE}', ${colunas.IDS001}, 
                                ${colunas.IDG046}, '${colunas.STAGENDA}', ${colunas.SNDELETE}, ${colunas.QTTEMPRE}, TO_DATE('${colunas.DTCADAST}' ,'DD/MM/YYYY HH24:MI:SS'), '${colunas.LSNOTAS}'
                              )`; */