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
  var dtatu       = app.src.utils.DataAtual;
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;


  const gdao = app.src.modGlobal.dao.GenericDAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');

  //-----------------------------------------------------------------------\\

  api.verificarSlotLivre = async function (req, res, next){

    req.sql = 
              `Select Count(H007.IdH007) As Qtd
                From H007 H007
                Join H005 H005 On H005.Idh005 = H007.Idh005 And H005.StCadast = 'A'
                Where H007.IdH007   In (${req.body.idSlots.join()}) 
                And (H007.IdH006 Is Not Null Or H007.StHorari In ('B'))`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  //-----------------------------------------------------------------------\\

  api.buscarHoraSlots = async function (req, res, next) {

    req.sql = `
                Select MIN(IDH007) AS IDH007, 
                       IDH006,
                       to_char(MIN(HOINICIO), 'dd/mm/yyyy hh24:mi:ss') AS HOINICIO,
                       to_char(MAX(HOFINAL), 'dd/mm/yyyy hh24:mi:ss') AS HOFINAL
                From h007 Where idh007 in (${req.body.idSlots.join()})
                Group by idh006
          `
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  //-----------------------------------------------------------------------\\

  api.buscarTpModCar = async function (req, res, next) {

    req.sql = `
                SELECT TPMODCAR
                  FROM G046 
                WHERE IDG046 in (${req.body.dadosCarga.IDG046.join()})
                GROUP BY TPMODCAR
              `

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarEtapas = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
                Select Distinct
                        G046.Idg046,
                        G048.Idg048,
                        G003OR.IDG003 IDG003OR,
                        G003DE.IDG003 IDG003DE
                From G046
                Inner Join G048
                  On G048.Idg046 = G046.Idg046
                  Inner Join G049 
                  On G049.Idg048 = G048.Idg048
                Inner Join G043
                  On G043.Idg043 = G049.Idg043
                Inner Join G014
                  On G014.Idg014 = G043.Idg014
                Inner Join G005 G005OR
                  On G005OR.IDG005 = G048.IDG005OR
                Inner Join G005 G005DE
                  On G005DE.IDG005 = G048.IDG005DE
                Inner Join G003 G003OR
                  On G003OR.IDG003 = G005OR.IDG003
                Inner Join G003 G003DE
                  On G003DE.IDG003 = G005DE.IDG003
                Where G046.Idg046 in (${req.body.dadosCarga.IDG046.join()})
                  And G014.SN4PL = 1
                  And G014.IDG097DO = ${req.body.IDG097DO}
            `;

  //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  
  };

  //-----------------------------------------------------------------------\\

  api.buscarDataAgenda = async function (req, res, next) {

    req.sql = `
                  Select Idh007, To_Char(Hoinicio, 'YYYY-MM-DD HH24:MI:SS') Hoinicio
                  From H007
                Where Idh007 In (`+ slots + `)
                Order By Idh007 Asc
              `
  //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\ 

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  //-----------------------------------------------------------------------\\

  api.mudarEtapa = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    var IDH006, ETAPA, IDI015, H0INICIO, IDS001;
    
      IDH006    =   req.IDH006.id;
      ETAPA     =   req.ETAPA;
      IDI015    =   req.IDI015;
      HOINICIO  =   req.HOINICIO;
      IDS001    =   req.IDS001;
    

    logger.debug("iniciando mudar etapa");

    req.sql = `
    Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, HoInicio, IdS001, IdH005, HoPreIni)
    Values
    ((Select Count(IdH006)+1 From H008 Where IdH006 = `+ IDH006 + `), 
    ` + IDH006 + `, ${ETAPA}, ${IDI015}, 
    to_date('`+ moment().format("DD/MM/YYYY HH:mm:ss") + `', 'dd/mm/yyyy hh24:mi:ss'), 
    to_date('${HOINICIO}', 'dd/mm/yyyy hh24:mi:ss'),
    ${IDS001}, 
    null, 
    null)`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\ 

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  //-----------------------------------------------------------------------\\

  api.atualizarDtEntrega= async function (req, res, next){
    await this.controller.setConnection(req.objConn);
    
    req.sql = `
                Update G048 Set
                  DTPREATU = to_date('${req.dtSla}', 'dd/mm/yyyy hh24:mi:ss')
                Where IDG048 = ${req.IDG048}
              `

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\ 
    return await gdao.executar(req, res, next).catch((err) => { throw err });    
  }

  //-----------------------------------------------------------------------\\

  api.atualizarStIntCli= async function (req, res, next){
    await this.controller.setConnection(req.objConn);
    
    req.sql = `
                Update G048 Set
                  STINTCLI = 0
                Where IDG048 = ${req.IDG048}
              `
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });    
  }

//-----------------------------------------------------------------------\\

  api.atualizarDtColeta = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);
    
    req.sql = `
                Update g046 Set 
                    STCARGA = 'S',
                    DTPRESAI = to_date('${req.HOFINAL}', 'dd/mm/yyyy hh24:mi:ss'),
                    DTAGENDA = to_date('${req.DATAATUAL}', 'dd/mm/yyyy hh24:mi:ss')                   

                Where IDG046 in (${req.IDG046.join()})
              `
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  //-----------------------------------------------------------------------\\

  api.atualizarPlacasMotorista = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);
    
    req.sql = `
                Update g046 Set 
                    NRPLAVEI = '${req.NRPLAVEI}',
                    NRPLARE1 = '${req.NRPLARE1}',
                    NRPLARE2 = '${req.NRPLARE2}',
                    IDG031M1 = '${req.IDG031}'
                Where IDG046 in (${req.IDG046.join()})
              `
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  //-----------------------------------------------------------------------\\
  
  api.atualizarDtColori = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);
    
    req.sql = `
                Update g046 Set 
                    DTCOLORI = to_date('${req.HOFINAL}', 'dd/mm/yyyy hh24:mi:ss')
                Where IDG046 in (${req.IDG046.join()}) And DTAGENDA Is Null
              `
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  api.atualizarSlots = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);
    
    req.sql = `
                Update H007 Set 
                IDH006 = ${req.IDH006},
                STHORARI = null
                Where IDH007 in (${req.body.idSlots.join()})
                And IDH006 IS NULL
              `

    await gdao.executar(req, res, next).catch((err) => { throw err });

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
    objBanco.vlFields.QTSLOTS     =     (req.body.dadosCarga.numSlots) ? req.body.dadosCarga.numSlots : req.body.dadosCarga.QTSLOTS;
    objBanco.vlFields.IDG030      =     req.body.dadosCarga.IDG030.id;
    objBanco.vlFields.NRNFCARG    =     req.body.dadosCarga.NRNFCARG;
    objBanco.vlFields.QTPESO      =     parseFloat(req.body.dadosCarga.PSCARGA);
    objBanco.vlFields.NRPLAVEI    =     req.body.dadosCarga.NRPLAVEI;
    objBanco.vlFields.IDG031      =     req.body.dadosCarga.IDG031;
    objBanco.vlFields.NRPLARE1    =     req.body.dadosCarga.NRPLARE1;
    objBanco.vlFields.NRPLARE2    =     req.body.dadosCarga.NRPLARE2;
    objBanco.vlFields.TXOBSAGE    =     req.body.dadosCarga.obs;
    objBanco.vlFields.IDS001      =     parseInt(req.body.IDS001);
    
    if(req.body.dadosCarga.TPMOVTO == "D"){
      objBanco.vlFields.IDG046      =     req.body.dadosCarga.IDG046;
    }
    
    objBanco.vlFields.STAGENDA    =     3;
    objBanco.vlFields.SNDELETE    =     0;
    objBanco.vlFields.QTTEMPRE    =     (req.body.dadosCarga.tempoOp) ? req.body.dadosCarga.tempoOp : req.body.dadosCarga.QTTEMPRE;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
    // objBanco.vlFields.LSNOTAS     =     req.body.dadosCarga.notas.join();

    /*########NOVOS CAMPOS SYNGENTA##################################*/
      objBanco.vlFields.TPOPERAC = req.body.dadosCarga.TPOPERAC;
    if (req.body.dadosCarga.TPPESAGE) {
      objBanco.vlFields.TPPESAGE = (req.body.dadosCarga.TPPESAGE.id)?req.body.dadosCarga.TPPESAGE.id:req.body.dadosCarga.TPPESAGE;
    } else {
      objBanco.vlFields.TPPESAGE = null;
    }

    objBanco.vlFields.NTFISCA1    =     req.body.dadosCarga.NTFISCA1;
    objBanco.vlFields.NTFISCA2    =     req.body.dadosCarga.NTFISCA2;

    var peso1, peso2;
    //Se não vier valor precisa salvar null
    if(!req.body.dadosCarga.PESCOMP1){
      peso1 = null;
    } else {
      peso1 = parseFloat(req.body.dadosCarga.PESCOMP1);
    }

    //Se não vier valor precisa salvar null
    if(!req.body.dadosCarga.PESCOMP2){
      peso2 = null;
    } else {
      peso2 = parseFloat(req.body.dadosCarga.PESCOMP2);
    }

    objBanco.vlFields.PESCOMP1    =     peso1;
    objBanco.vlFields.PESCOMP2    =     peso2;
    objBanco.vlFields.FORNECED    =     req.body.dadosCarga.FORNECED;
    objBanco.vlFields.UNIDRECE    =     req.body.dadosCarga.UNIDRECE;
    objBanco.vlFields.CDLACRE     =     req.body.dadosCarga.CDLACRE;
    objBanco.vlFields.CDCONTAI    =     req.body.dadosCarga.CDCONTAI;
    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.salvarAgrupamentoCargas = async function (req, res, next){

    var objBanco = {
        table:    'H024'
      , key:      ['IDH024']
      , vlFields:  {}
    }

    objBanco.vlFields.IDH006      =     req.IDH006;
    objBanco.vlFields.IDG046      =     req.IDG046;
    objBanco.vlFields.NTFISCA1    =     req.NTFISCA1;
    objBanco.vlFields.NTFISCA2    =     req.NTFISCA2;
    objBanco.vlFields.TPOPERAC    =     req.TPOPERAC;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')

    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }


  api.salvarMateriais = async function (req, res, next){

    var objBanco = {
        table:    'H023'
      , key:      ['IDH023']
      , vlFields:  {}
    }

    if (req.QTMATERI) {
      req.QTMATERI = parseFloat(req.QTMATERI.replace(',','.'));
    }

    objBanco.vlFields.IDH006      =     req.IDH006;
    objBanco.vlFields.IDH022      =     req.IDH022;
    objBanco.vlFields.IDG009      =     req.IDG009;
    objBanco.vlFields.QTMATERI    =     req.QTMATERI;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS(), //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')
        
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }


  api.salvarTomador = async function (req, res, next){

    var objBanco = {
        table:    'H019'
      , vlFields:  {}
    }

    objBanco.vlFields.IDH006      =     req.IDH006;
    objBanco.vlFields.IDG005      =     req.IDG005;
    objBanco.vlFields.IDG046      =     req.IDG046;
    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
    
  }

  api.editar = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);

    var dadosCarga   = req.body.dadosCarga;

    var camposUpdate = `SNDELETE = 0`;

    if(dadosCarga.IDG031){ // MOTORISTA
      camposUpdate += `,IDG031   = ${dadosCarga.IDG031}`;
    }

    if (dadosCarga.IDG030.id) { // TIPO VEÍCULO
      camposUpdate += `,IDG030   = ${dadosCarga.IDG030.id}`;
    }

    if (dadosCarga.TPPESAGE) { // TIPO PESAGEM
      if(dadosCarga.TPPESAGE.id){
        camposUpdate += `,TPPESAGE = ${dadosCarga.TPPESAGE.id}`;
      }
    }

    if(dadosCarga.PESCOMP1 && dadosCarga.PESCOMP1 != '0,00'){ // PESO COMPOSIÇÃO 1
      camposUpdate += `,PESCOMP1 = ${parseFloat(dadosCarga.PESCOMP1)}`;
    }

    if(dadosCarga.PESCOMP2 && dadosCarga.PESCOMP1 != '0,00'){ // PESO COMPOSIÇÃO 2
      camposUpdate += `,PESCOMP2 = ${parseFloat(dadosCarga.PESCOMP2)}`;
    }

    if(dadosCarga.NRPLAVEI){ // PLACA VEÍCULO
      camposUpdate += `,NRPLAVEI ='${dadosCarga.NRPLAVEI}'`;
    }

    if(dadosCarga.NRPLARE1){ // PLACA REBOQUE 1
      camposUpdate += `,NRPLARE1 ='${dadosCarga.NRPLARE1}'`;
    } else {
      camposUpdate += `,NRPLARE1 =''`;
    }

    if(dadosCarga.NRPLARE2){ // PLACA REBOQUE 2
      camposUpdate += `,NRPLARE2 ='${dadosCarga.NRPLARE2}'`;
    } else {
      camposUpdate += `,NRPLARE2 =''`;
    }

    if(dadosCarga.NTFISCA1){ // NOTA FISCAL 1
      camposUpdate += `,NTFISCA1 ='${dadosCarga.NTFISCA1}'`;
    } else {
      camposUpdate += `,NTFISCA1 =''`;
    }

    if(dadosCarga.NTFISCA2){ // NOTA FISCAL 2
      camposUpdate += `,NTFISCA2 ='${dadosCarga.NTFISCA2}'`;
    } else {
      camposUpdate += `,NTFISCA2 =''`;
    }

    if(dadosCarga.CDLACRE){ // LACRE
      camposUpdate += `,CDLACRE ='${dadosCarga.CDLACRE}'`;
    } else {
      camposUpdate += `,CDLACRE =''`;
    }

    if(dadosCarga.NUMNAM){ // NÚMERO DO NAM
      camposUpdate += `,NUMNAM ='${dadosCarga.NUMNAM}'`;
    }

    if(dadosCarga.CDCONTAI){ // CONTAINER
      camposUpdate += `,CDCONTAI ='${dadosCarga.CDCONTAI}'`;
    } else {
      camposUpdate += `,CDCONTAI =''`;
    }

    if(dadosCarga.TXOBSAGE){ // OBSERVAÇÃO
      camposUpdate += `,TXOBSAGE ='${dadosCarga.TXOBSAGE}'`;
    } else {
      camposUpdate += `,TXOBSAGE =''`;
    }

    req.sql = `
                Update H006 Set ${camposUpdate}
                Where IDH006 =  ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.editarAgrupamentoCargas = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);

    var camposUpdate = `NTFISCA1 ='${req.NTFISCA1}',
                        NTFISCA2 ='${req.NTFISCA2}'`;

    if(req.TPOPERAC){ // MOTORISTA
      camposUpdate += `,TPOPERAC = ${req.TPOPERAC}`;
    }

    req.sql = `
                Update H024 Set ${camposUpdate}
                Where IDH006 =  ${req.IDH006}
                And   IDG046 =  ${req.IDG046}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
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
  
  api.buscarSlots = async function (req, res, next) {

    let IDH006 = (req.body.IDH006.length) ? req.body.IDH006.join() : req.body.IDH006;

    req.sql = `
                SELECT IDH007 
                  FROM H007
                WHERE IDH006 IN (${IDH006})
                AND SNDELETE = 0
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.limparSlots = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);
    
    req.sql = `
                Update H007 
                Set IDH006 = null
                  , StHorari = StHorAnt
                Where IDH007 in (${req.slots.join()})
              `

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  api.buscarAgendamento = async function (req, res, next) {

    req.sql = `
                SELECT H006.TPMOVTO,
                       (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
                           FROM H024
                           WHERE H024.IDH006 = H006.IDH006
                           AND H024.SNDELETE = 0
                       ) AS IDG046
                  FROM H006
                WHERE  IDH006 = ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarStatusAgendamento = async function (req, res, next) {

    req.sql = `
                SELECT STAGENDA
                  FROM H006
                WHERE IDH006 = ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.updateEditar = async function (req, res, next){
    await gdao.controller.setConnection(req.objConn);

    var placa1    = '';
    var placa2    = '';
    var nota1     = '';
    var nota2     = '';
    var transp    = '';

    if(req.body.NRPLARE1){
      placa1 = `NRPLARE1 ='${req.body.NRPLARE1}',`;
    }

    if(req.body.NRPLARE2){
      placa2 = `NRPLARE2 ='${req.body.NRPLARE2}',`;
    }

    if(req.body.NTFISCA1){
      nota1 = `NTFISCA1 ='${req.body.NTFISCA1}',`;
    }

    if(req.body.NTFISCA2){
      nota2 = `NTFISCA2 ='${req.body.NTFISCA2}',`;
    }

    if(req.body.IDG024){
      transp = `IDG024 ='${req.body.IDG024}',`;
    }
    
    req.sql = `
                Update H006 Set 
                  NRPLAVEI =   '${req.body.NRPLAVEI}',

                  ${transp} ${placa1} ${placa2} ${nota1} ${nota2}

                  IDS001 =      ${req.body.IDS001},
                  IDG031 =      ${req.body.IDG031},
                  QTPESO =     '${req.body.QTPESO}'
                Where IDH006 =  ${req.body.IDH006}
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /** 
 * @module dao/Agendamento2
 * @description Verifica se já a carga já possui agendamentos
 * @param {application} app - IDG046
 * @return {JSON} Um array JSON.
*/

  api.verificarAgendamento = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
                Select H007.IDH006 
                From H007
                  Inner Join H006 On H007.IDH006 = H006.IDH006
                  Inner Join H024 On H007.IDH006 = H024.IDH006
                Where H024.IDG046 in (${req.body.IDG046.join()})
                And H006.STAGENDA NOT IN  (9,10)
                And H006.TPMOVTO = 'C'
            `;
                
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.verificarAGP = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              Select G048.STINTCLI
              From G046 
              Left Join G048 
                On G046.IDG046 = G048.IDG046
              Where G046.IDG046 = ${req.body.IDG046}
            `;
                
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /******************************************************************************************
   * @description Função utilizada para cancelar um ou vários agendamentos de cargas
   * @author Walan Cristian Ferreira Almeida
   * @since 29/04/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.cancelarAgendamento = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              Update H006 set STAGENDA = 10, SNDELETE = 1
              Where IDH006 in (${req.body.IDH006.join()})
            `;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /******************************************************************************************
   * @description Função utilizada para cancelar um ou vários agrupamentos de cargas
   * @author Walan Cristian Ferreira Almeida
   * @since 13/05/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.cancelarAgrupamento = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              Update H024 set SNDELETE = 1
              Where IDH006 in (${req.body.IDH006.join()})
            `;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /******************************************************************************************
   * @description Função utilizada para listar numero de cargas para voltar para aceite
   * @author Walan Cristian Ferreira Almeida
   * @since 30/05/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.listarCargasAgendamentoAgrupado = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
              FROM H024  
              WHERE H024.IDH006 = ${req.body.IDH006}
              AND H024.SNDELETE = 0
            `;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  /******************************************************************************************
   * @description Função utilizada para voltar cargas desagrupadas para aceite
   * @author Walan Cristian Ferreira Almeida
   * @since 30/05/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.voltarCargaAceite = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              Update G046 set STCARGA = 'A'
              Where IDG046 in (${req.body.IDG046})
            `;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  /******************************************************************************************
   * @description Função utilizada para cancelar um ou vários tomadores da cargas
   * @author Walan Cristian Ferreira Almeida
   * @since 13/05/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.cancelarTomador = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `
              Update H019 set SNDELETE = 1
              Where IDH006 in (${req.body.IDH006.join()})
            `;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.changeShipmentStatus = async function (req, res, next) {
        
    req.sql = 
        `UPDATE G043 
            SET STETAPA = ${req.STETAPA}
            WHERE IDG043 IN
                (SELECT G049.IDG043 
                FROM G049 
                INNER JOIN G048 
                    ON G048.IDG048 = G049.IDG048
                    AND G048.IDG046 in (${req.IDG046.join()}))`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  api.updateCarga = async function (req, res, next) {
        
    req.sql = 
        `UPDATE G046
            SET IDH006 = ${req.IDH006}
            WHERE IDG046 IN (${req.body.dadosCarga.IDG046.join()})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  api.salvarMotorista = async function (req, res, next) {
        
    var objBanco = {
      table:    'G031'
    , key:      ['IDG031']
    , vlFields:  {}
  }

  objBanco.vlFields.NMMOTORI    =     req.body.dadosCarga.NMMOTORI;
  objBanco.vlFields.CJMOTORI    =     (req.body.dadosCarga.CJMOTORI)?req.body.dadosCarga.CJMOTORI:req.body.dadosCarga.CPF;
  objBanco.vlFields.RGMOTORI    =     (req.body.dadosCarga.RGMOTORI)?req.body.dadosCarga.RGMOTORI:req.body.dadosCarga.RG;
  objBanco.vlFields.NRCNHMOT    =     (req.body.dadosCarga.NRCNHMOT)?req.body.dadosCarga.NRCNHMOT:req.body.dadosCarga.CNH;
  objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS();
  objBanco.vlFields.IDS001      =     (req.body.dadosCarga.IDS001)?req.body.dadosCarga.IDS001:req.body.IDS001;
  objBanco.vlFields.IDG024      =     req.body.dadosCarga.IDG024.id;

  await this.controller.setConnection(req.objConn);

  objBanco.objConn = req.objConn;
  
  return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  /**********************************************************************************************
   * @description Função utilizada para cancelar status de um agendamento ao desatrelar caminhão
   * @author Walan Cristian Ferreira Almeida
   * @since 14/06/2019
   *
   * @async
   * @function api/desatrelar
  ***********************************************************************************************/
  api.cancelarStatus = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `UPDATE H008 SET SNDELETE = 1
                WHERE IDH006 = ${req.body.IDH006}
                  AND STAGENDA IN (7,8,9,14,15)`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /******************************************************************************************************
   * @description Função utilizada para alterar tipo de pesagem de um agendamento ao desatrelar caminhão
   * @author Walan Cristian Ferreira Almeida
   * @since 14/06/2019
   *
   * @async
   * @function api/desatrelar
  ******************************************************************************************************/
  api.alterarTipoPesagem = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `UPDATE H006 
                  SET TPPESAGE = ${req.body.TPPESAGE}
                WHERE IDH006 = ${req.body.IDH006}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /******************************************************************************************************************
   * @description Função utilizada para verificar se há calculo de pesagem de um agendamento ao desatrelar caminhão
   * @author Walan Cristian Ferreira Almeida
   * @since 14/06/2019
   *
   * @async
   * @function api/desatrelar
  ******************************************************************************************************************/
  api.verificarCalculoPessagem = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = ` SELECT COUNT(*) AS CALCULADO 
                  FROM H021
                 WHERE IDH006 = ${req.body.IDH006}
                   AND LIBERADO IS NOT NULL`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*****************************************************************************************************
   * @description Função utilizada para limpar calculo pesagem de um agendamento ao desatrelar caminhão
   * @author Walan Cristian Ferreira Almeida
   * @since 14/06/2019
   *
   * @async
   * @function api/desatrelar
  ******************************************************************************************************/
  api.limparCalculoPessagem = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `UPDATE H021
                  SET LIBERADO = NULL,
                      DESVIOKG = NULL,
                      DESVIOPE = NULL
                WHERE IDH006  = ${req.body.IDH006}
                  AND TPMOVTO = 'S'`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /********************************************************************************************************
   * @description Função utilizada para salvar a quantidade de pallet e peso unitário do pallet p/ cálculo
   * @author Walan Cristian Ferreira Almeida
   * @since 28/06/2019
   *
   * @async
   * @function api/salvarPesoPallet
  *********************************************************************************************************/
  api.salvarPesoPallet = async function (req, res, next) {

    req.sql = `UPDATE H006
                  SET QTPALLET = ${req.body.QTPALLET},
                      PSPALLET = ${req.body.PSPALLET}
                WHERE IDH006 = ${req.body.IDH006}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /********************************************************************************************************
   * @description Função utilizada para editar peso de agendamentos manuais e descargas
   * @author Walan Cristian Ferreira Almeida
   * @since 07/01/2020
   *
   * @async
   * @function api/updatePesoAg
  *********************************************************************************************************/
  api.updatePesoAg = async function (req, res, next) {

    req.sql = `UPDATE H006
                  SET QTPESO   = ${req.body.QTPESO}
                    , QTTEMPRE = ${req.body.QTTEMPRE}
                    , QTSLOTS  = ${req.body.QTSLOTS}
                WHERE IDH006   = ${req.body.IDH006}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  api.atualizarMotorista = async function (req, res, next) {

    req.sql = `UPDATE G031
                  SET NRCNHMOT = ${req.body.NRCNHMOT}
                WHERE IDG031   = ${req.body.IDG031}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  api.verificaOperacao = async function (req, res, next) {

    req.sql = ` SELECT DISTINCT G014.IDG097DO
                  FROM G046 G046
                  JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                  JOIN G049 G049 ON G049.IDG048 = G048.IDG048
                  JOIN G043 G043 ON G043.IDG043 = G049.IDG043
                  JOIN G014 G014 ON G014.IDG014 = G043.IDG014
                 WHERE G046.TPMODCAR = 2
                   AND G046.SNDELETE = 0
                   AND G014.SN4PL    = 1
                   AND G014.IDG097DO = ${req.IDG097DO}
                   AND G046.IDG046 IN (${req.IDG046})`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  return api;

};
