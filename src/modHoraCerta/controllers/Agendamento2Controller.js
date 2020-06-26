module.exports = function (app, cb) {
  var api = {};
  var dao       = app.src.modHoraCerta.dao.Agendamento2DAO;
  var agDAO     = app.src.modHoraCerta.dao.AgendamentoDAO;
  var nextDAO   = app.src.modDocSyn.dao.NextIdDAO;
  var utils     = app.src.utils.DataAtual;
  var statusDAO = app.src.modOferecimento.dao.StatusDAO;
  var viagemCTRL= app.src.modOferece.controllers.ViagemController;

  api.salvar = async function (req, res, next) {

    var dataAtual = utils.tempoAtual('YYYY-MM-DD HH:mm:ss');
    var dataAtualBr = utils.tempoAtual('DD/MM/YYYY HH:mm:ss');

    try {

      if (req.body.dadosCarga.obs === undefined) {
        req.body.dadosCarga.obs = req.body.dadosCarga.TXOBSAGE;
      }

      if (req.body.dadosCarga.NRPLAVEI != undefined && req.body.dadosCarga.NRPLAVEI != null) {
        req.body.dadosCarga.NRPLAVEI = req.body.dadosCarga.NRPLAVEI.replace('-', '');
      }
      if (req.body.dadosCarga.NRPLARE1 != undefined && req.body.dadosCarga.NRPLARE1 != null) {
        req.body.dadosCarga.NRPLARE1 = req.body.dadosCarga.NRPLARE1.replace('-', '');
      }
      if (req.body.dadosCarga.NRPLARE2 != undefined && req.body.dadosCarga.NRPLARE2 != null) {
        req.body.dadosCarga.NRPLARE2 = req.body.dadosCarga.NRPLARE2.replace('-', '');
      }

      var msgErro = null;

      var blOk = false;

      req.objConn = await dao.controller.getConnection();

      if(req.body.dadosCarga.TPMOVTO == "C" && req.body.dadosCarga.IDG046 !== null){

        // VERIFICA SE É AGRUPAMENTO DE CARGAS
        if (req.body.snAgrupar) {

          var cancelar = await api.cancelarAgendamento(req, res, next)
                                  .then((result) => { return 'Ok'; })
                                  .catch((err) => { throw err; });
          blOk = (cancelar == 'Ok');

        } else {
          blOk = true;
        }

        // VERIFICA SE JÁ POSSUI AGENDAMENTO COM ESSA CARGA
        if (blOk) {
          var reqCarga = {
            body:{IDG046: req.body.dadosCarga.IDG046}, 
            objConn:req.objConn
          };

          var verificarAgendamento = await api.verificarAgendamento(reqCarga, res, next); //testar

          var blOk = (verificarAgendamento.length == 0);

        } else {
          msgErro = "Ocorreu um erro ao agrupar cargas para agendamento.";
        }

      } else{
        blOk = true;
      }

      if (blOk){

        var verificarSlotLivre = await api.verificarSlotLivre(req, res, next);

        blOk = (verificarSlotLivre == 0);

        if(blOk){
          if(req.body.dadosCarga.IDG031 === undefined || req.body.dadosCarga.IDG031 === null || req.body.dadosCarga.IDG031 === ""){
            var motorista = await dao.salvarMotorista(req, res, next); 
            blOk = (motorista.id !== undefined);
            if (blOk) {
              req.body.dadosCarga.IDG031 = motorista.id;
            }
          }

          if (blOk) {
            var IDH006 = await dao.inserir(req, res, next);
            req.IDH006 = IDH006.id;

            blOk = (IDH006.id !== undefined);


            if (blOk) {

              if(req.body.dadosCarga.produtos != undefined){
                for(i of req.body.dadosCarga.produtos){
                  req.IDH022 = i.IDH022;
                  req.QTMATERI = i.QTMATERI;
                  req.IDG009 = i.IDG009;
                  await dao.salvarMateriais(req, res, next);
                }
              }

              var horaSlots = await api.buscarHoraSlots(req, res, next);

              blOk = (horaSlots !== null);

              if (blOk) {

                await dao.mudarEtapa({ objConn: req.objConn, IDS001: req.body.IDS001, IDH006: IDH006, ETAPA: 3, IDI015: null, HOINICIO: horaSlots.HOINICIO }, res, next);

                if (req.body.dadosCarga.IDG046 && req.body.dadosCarga.IDG046.length) { // mudar pra length
                  var TPMODCAR = await api.buscarTpModCar(req, res, next);
                }

                /* Atualizar placa da carga */
                var NRPLAVEI = req.body.dadosCarga.NRPLAVEI;
                var NRPLARE1 = '';
                var NRPLARE2 = '';

                if (req.body.dadosCarga.NRPLARE1 != undefined) {
                  NRPLARE1 = req.body.dadosCarga.NRPLARE1;
                }

                if (req.body.dadosCarga.NRPLARE2 != undefined) {
                  NRPLARE2 = req.body.dadosCarga.NRPLARE2;
                }

                var params = {};
                params.IDG046   = req.body.dadosCarga.IDG046;
                params.IDG031   = req.body.dadosCarga.IDG031;
                params.NRPLAVEI = NRPLAVEI;
                params.NRPLARE1 = NRPLARE1;
                params.NRPLARE2 = NRPLARE2;
                params.objConn  = req.objConn;

                var blCarga4PL = ((req.body.dadosCarga.IDG046 != '') && (req.body.dadosCarga.IDG046 != null) && (req.body.dadosCarga.TPMOVTO == "C") && (TPMODCAR != 1))

                if (blCarga4PL) {// se for carga 4pl

                  let objVerOperac = { objConn: req.objConn, IDG046: req.body.dadosCarga.IDG046, IDG097DO: 145 };
                  var verificaOperacao = await dao.verificaOperacao(objVerOperac, res, next);
                  blOk = (verificaOperacao.length);

                  if (blOk) {
                    if (verificaOperacao.length > 0) {
                      params.STETAPA   = 3;
                      params.TPTRANSP  = (req.body.dadosCarga.TPTRANSP)?req.body.dadosCarga.TPTRANSP:'';
                      params.HOFINAL   = horaSlots.HOFINAL;
                      params.DATAATUAL = dataAtualBr;

                      await dao.controller.setConnection(params.objConn);
                      await dao.changeShipmentStatus(params, res, next);

                      await dao.atualizarDtColori(params, res, next);

                      req.body.IDG097DO = 145;
                      var etapas = await dao.buscarEtapas(req, res, next);
                      blOk = (etapas.length > 0);

                      if (blOk) {

                        for (var i of etapas) {
                          i.objConn = req.objConn;
                          i.HOFINAL = horaSlots.HOFINAL;
                          i.TPTRANSP = (req.body.dadosCarga.TPTRANSP)?req.body.dadosCarga.TPTRANSP:'';;

                          await dao.atualizarStIntCli(i, res, next);

                          var parm = { IDG048: i.IDG048, IDI001: 9, DTEVENTO: dataAtual, objConn: i.objConn };

                          await dao.controller.setConnection(i.objConn);
                          await nextDAO.insereEventoEtapa(parm, res, next);
                        }

                      } else {
                        msgErro = "Não foram encontradas etapas";
                      }
                    }
                  } else {
                    msgErro = `Falha ao verificar operação da carga.`;
                  }

                } else {
                  blOk = true;
                }

                if(TPMODCAR && req.body.dadosCarga.TPMOVTO == "C"){  //não atualiza em casos de descargas e carga manual

                  var objOferece = {post:{}};

                  objOferece.post.IDG046 = req.body.dadosCarga.IDG046;
                  objOferece.post.IDS001 = req.body.IDS001;
                  objOferece.post.STCARGA = 'S';
                  objOferece.objConn = req.objConn;
                  await statusDAO.trocaStatusOferec (objOferece, res, next);

                  var obj = {};
                  obj.HOFINAL = horaSlots.HOFINAL;
                  obj.DATAATUAL = dataAtualBr;
                  obj.IDG046 = req.body.dadosCarga.IDG046;
                  obj.objConn = req.objConn;
                  await dao.atualizarDtColeta(obj, res, next); //testar
                }

                await dao.atualizarSlots(req, res, next);

                if (req.body.dadosCarga.TPMOVTO == "C" && req.body.dadosCarga.IDG046 !== null) {
                  await dao.atualizarPlacasMotorista(params, res, next);

                  blOk = await api.salvarAgrupamentoCargas(req, res, next);

                  if (blOk) {
                    await api.salvarTomador(req, res, next);
                  } else {
                    msgErro = "Erro ao agrupar as cargas";
                  }
                } else {
                  await api.salvarTomador(req, res, next);
                }

              } else {
                msgErro = "Não foi encontrada a Hora de Início do Slot";
              }

            } else {
              msgErro = "Não foi posível inserir o Agendamento";
            }
          } else {
            msgErro = "Erro ao salvar motorista";
          }
        } else {
          msgErro = "O Slot está ocupado";
        }
      } else{
        msgErro = `Esta carga já foi agendada. Agendamento: ${verificarAgendamento[0].IDH006}`;
      }

      if (blOk) {
        await req.objConn.close();
        //return res.status(200).send("Mensagem OK");
        res.json(req.IDH006);

      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    }
    catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }

  };

  //*---------------------------------------------------------------

  api.reagendar = async function (req, res, next) {

    var dataAtual   = utils.tempoAtual('YYYY-MM-DD HH:mm:ss');
    var dataAtualBr = utils.tempoAtual('DD/MM/YYYY HH:mm:ss');

      try {

        var msgErro = null;

        req.objConn = await dao.controller.getConnection();

        var verificarSlotLivre = await api.verificarSlotLivre(req, res, next);

        var blOk = (verificarSlotLivre == 0);

        if (blOk) {

          var statusAgendamento = await dao.buscarStatusAgendamento(req, res, next);

          var blOk = (statusAgendamento[0].STAGENDA < 6);

          if (blOk) {

            var horaSlots = await api.buscarHoraSlots(req, res, next);

            blOk = (horaSlots !== null);

            if (blOk) {
              await dao.mudarEtapa({ objConn: req.objConn, IDS001: req.body.IDS001, IDH006: { id: req.body.IDH006 }, ETAPA: 11, IDI015: req.body.IDI015, HOINICIO: horaSlots.HOINICIO }, res, next);

              req.body.dadosCarga = await api.buscarAgendamento(req, res, next)

              if (req.body.dadosCarga.IDG046 != null) {
                var TPMODCAR = await api.buscarTpModCar(req, res, next);
              }

              /*Acrescentei a conferência se é Carga porque em casos de reagendamento de Descarga estava voltando a carga para Agendado e ferindo o fluxo da Carga no Integrador
                agora só será voltado o status da Carga para Agendado se o agendamento for do TPMOVTO Carga - ENOS*/
              if(TPMODCAR && req.body.dadosCarga.TPMOVTO == "C"){
                var obj = {};
                obj.HOFINAL = horaSlots.HOFINAL;
                obj.DATAATUAL = dataAtualBr;
                obj.IDG046 = req.body.dadosCarga.IDG046;
                obj.objConn = req.objConn;

                await dao.atualizarDtColeta(obj, res, next);
              }

              var blCarga4PL = ((req.body.dadosCarga.IDG046 != '') && (req.body.dadosCarga.IDG046 != null) && (req.body.dadosCarga.TPMOVTO == "C") && (TPMODCAR != 1))

              if (blCarga4PL) {// se for carga 4pl
                let objVerOperac = { objConn: req.objConn, IDG046: req.body.dadosCarga.IDG046, IDG097DO: 145 };
                var verificaOperacao = await dao.verificaOperacao(objVerOperac, res, next);
                blOk = (verificaOperacao.length);

                if (blOk) {
                  if (verificaOperacao.length > 0) {
                    req.body.IDG097DO = 145;
                    var etapas = await dao.buscarEtapas(req, res, next);

                    blOk = (etapas.length > 0);

                    if (blOk) {
                      for (var i of etapas) {
                        i.objConn = req.objConn;
                        i.HOFINAL = horaSlots.HOFINAL;

                        await dao.atualizarStIntCli(i, res, next);

                        var parm = { IDG048: i.IDG048, IDI001: 9, DTEVENTO: dataAtual, objConn: i.objConn };

                        await dao.controller.setConnection(i.objConn);
                        await nextDAO.insereEventoEtapa(parm, res, next);
                      }
                    } else {
                      msgErro = "Não foram encontradas etapas";
                    }
                  }
                } else {
                  msgErro = `Falaha ao verificar operação da carga.`;
                }

              } else {
                blOK = true;
              }
              req.IDH006 = req.body.IDH006;

              await api.limparSlots(req, res, next);
              await dao.atualizarSlots(req, res, next);

            } else {
              msgErro = "Não foi posível buscar a hora de início";
            }

          } else {
            blOk = false;
            msgErro = "Não é permitido reagendar com status superior ao de Entrou. Por Favor atualize a grade.";
          }

        } else {
          msgErro = "Não há slots disponíveis, atualize a grade pois o slot ja deve estar ocupado.";
        }

        if (blOk) {
          await req.objConn.close();
          res.json(req.IDH006);
        } else {
          await req.objConn.closeRollback();
          res.status(400).send({message:msgErro});
        }
      }
      catch (err) {
          await req.objConn.closeRollback();
          res.status(500).send({message:"Ocorreu um erro ao Salvar o agendamento, ERRO: 0004"});
      }

  };

  //-------------------------------------------------------------------------//

  api.editarPesoAgendamento = async function (req, res, next) {

      try {

        let blOk = false, msgErro = null;
        req.objConn = await dao.controller.getConnection();

        let updatePesoAg = await dao.updatePesoAg(req, res, next).then((result) => 'Ok');
        blOk = (updatePesoAg == 'Ok');

        if (blOk) {
          switch (req.body.TIPO) {
            case 1: // Apenas atualiza o peso
              break;
            case 2: // Libera os slots em excesso
              req.slots = req.body.arrLibSlots;
              let limparSlots = await dao.limparSlots(req, res, next).then((result) => 'Ok');
              blOk = (limparSlots == 'Ok');

              if (!blOk) { msgErro = `Falha ao limpar slots ${req.slots.join()}.`; }
              break;
            case 3: // Reagendamento (Pois passa a ocupar mais slots)
              let limparSlots2 = await api.limparSlots(req, res, next).then((result) => 'Ok');
              blOk = (limparSlots2 == 'Ok');

              if (blOk) {
                req.body.idSlots = req.body.arrAddSlots;
                let verificarSlotLivre = await api.verificarSlotLivre(req, res, next);
                blOk = (verificarSlotLivre == 0);

                if (blOk) {
                  let horaSlots = await api.buscarHoraSlots(req, res, next);
                  blOk = (horaSlots !== null);

                  if (blOk) {
                    let mudarEtapa = await dao.mudarEtapa({   objConn: req.objConn
                                                            , IDS001: req.body.IDS001
                                                            , IDH006: { id: req.body.IDH006 }
                                                            , ETAPA: 11
                                                            , IDI015: req.body.IDI015
                                                            , HOINICIO: horaSlots.HOINICIO
                                                          }, res, next).then((result) => 'Ok');
                    blOk = (mudarEtapa == 'Ok');

                    if (blOk) {
                      req.IDH006 = req.body.IDH006;
                      let atualizarSlots = await dao.atualizarSlots(req, res, next).then((result) => 'Ok');
                      blOk = (atualizarSlots == 'Ok');

                      if (!blOk) {
                        msgErro = `Falha ao atualizar slots.`;
                      }
                    } else {
                      msgErro = `Falha ao mudar etapa do agendamento ${req.body.IDH006}.`;
                    }
                  } else {
                    msgErro = `Não foi posível buscar a hora de início.`;
                  }
                } else {
                  msgErro = `Não há slots disponíveis, atualize a grade pois o slot ja deve estar ocupado.`;
                }
              } else {
                msgErro = `Falha ao limpar slots do agendamento ${req.body.IDH006}.`;
              }
              break;
          }
        } else {
          msgErro = `Falha ao editar peso do agendamento ${req.body.IDH006}.`;
        }

        if (blOk) {
          await req.objConn.close();
          res.json(req.body.IDH006);
        } else {
          await req.objConn.closeRollback();
          res.status(400).send({message:msgErro});
        }
      }
      catch (err) {
        await req.objConn.closeRollback();
        res.status(500).send({message:"Ocorreu um erro ao editar o peso do agendamento!"});
      }

  };

  //-------------------------------------------------------------------------//

  api.editar = async function (req, res, next){
    try {

      req.objConn = await dao.controller.getConnection();

      var blOk    = false;
      var msgErro = null;

      if (req.body.dadosCarga.NRPLAVEI != undefined && req.body.dadosCarga.NRPLAVEI != null) {
        req.body.dadosCarga.NRPLAVEI = req.body.dadosCarga.NRPLAVEI.replace('-', '');
      }
      if (req.body.dadosCarga.NRPLARE1 != undefined && req.body.dadosCarga.NRPLARE1 != null) {
        req.body.dadosCarga.NRPLARE1 = req.body.dadosCarga.NRPLARE1.replace('-', '');
      }
      if (req.body.dadosCarga.NRPLARE2 != undefined && req.body.dadosCarga.NRPLARE2 != null) {
        req.body.dadosCarga.NRPLARE2 = req.body.dadosCarga.NRPLARE2.replace('-', '');
      }

      if(req.body.dadosCarga.IDG031 === undefined || req.body.dadosCarga.IDG031 === null || req.body.dadosCarga.IDG031 === ""){
        req.body.dadosCarga.IDG031 = await dao.salvarMotorista(req, res, next).then((result) => { return result.id; }); 
        blOk = (req.body.dadosCarga.IDG031 !== undefined);
      } else {
        blOk = true;
      }

      if (blOk) {

        await dao.editar(req, res, next);
        blOk = await api.editarAgrupamentoCargas(req, res, next);

        if (blOk) {
          var params = {};
          params.IDG046   = req.body.dadosCarga.IDG046;
          params.IDG031   = req.body.dadosCarga.IDG031;
          params.NRPLAVEI = req.body.dadosCarga.NRPLAVEI;
          params.NRPLARE1 = req.body.dadosCarga.NRPLARE1;
          params.NRPLARE2 = req.body.dadosCarga.NRPLARE2;
          params.objConn  = req.objConn;

          await dao.atualizarPlacasMotorista(params, res, next);

        } else {
          msgErro = "Erro ao editar dados das cargas!";
        }

      } else {
        msgErro = "Erro ao salvar motorista.";
      }

      if (blOk) {
        await req.objConn.close();
        res.status(200).send({message: "Agendamento atualizado com sucesso."});
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch(err) {
      await req.objConn.closeRollback();
      return res.status(500).send({message:"Erro ao editar agendamento.", erro:err});
    }

  }

  api.verificarSlotLivre = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.verificarSlotLivre(req, res, next).catch((err) => { throw err });
    return result[0].QTD
  }

  api.buscarHoraSlots = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.buscarHoraSlots(req, res, next).catch((err) => { throw err });

    if(result.length == 0){
      return null;
    }else{
      return result[0];
    }
  }

  api.buscarTpModCar = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.buscarTpModCar(req, res, next).catch((err) => { throw err });
    if (result){
      return result[0].TPMODCAR
    } else{
      return null
    }
  }

  api.limparSlots = async function(req, res, next){
    await dao.controller.setConnection(req.objConn);
    var slots = await dao.buscarSlots(req, res, next);
    var arSlots =[];
    for(var i of slots){ 
      arSlots.push(i.IDH007);
    };

    req.slots = arSlots;

    return await dao.limparSlots(req, res, next);

  }

  api.buscarAgendamento = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.buscarAgendamento(req, res, next).catch((err) => { throw err });
    if (result){
      var dadosCarga = {};
      dadosCarga.IDG046 = (result[0].IDG046)?result[0].IDG046.split(','):null;
      dadosCarga.TPMOVTO = result[0].TPMOVTO;
      return dadosCarga;
    } else{
      return null
    }
  }

  api.salvarTomador = async function (req, res, next){

    if (req.body.dadosCarga.TPMOVTO == "C" && req.body.dadosCarga.IDG046 !== null) {
      var cargas = req.body.dadosCarga.cargas;

      for (let carga of cargas) {
        for (let IDG005 of carga.IDG005) {
          var obj = { IDH006: req.IDH006, IDG046: carga.IDG046, IDG005: IDG005, objConn: req.objConn };
          await dao.salvarTomador(obj, res, next);
        }
      }
    } else {
      let tomador = req.body.dadosCarga.IDG005;
      req.body.dadosCarga.IDG005 = (tomador.length) ? tomador : [tomador];

      for (let IDG005 of req.body.dadosCarga.IDG005) {
        var obj = { IDH006: req.IDH006, IDG046: null, IDG005: IDG005, objConn: req.objConn };
        await dao.salvarTomador(obj, res, next);
      }
    }


  }

  api.updateEditar = async function (req, res, next){
    try {

      let msgErro = null;
      let blOk    = false;
      req.objConn = await dao.controller.getConnection();

      if (req.body.IDG031 === undefined || req.body.IDG031 === null || req.body.IDG031 === '') {
        req.body.dadosCarga = {
            CJMOTORI: req.body['CJMOTORI'].replace('.','').replace('.','').replace('-','')
          , NMMOTORI: req.body['NMMOTORI']
          , RGMOTORI: req.body['RGMOTORI']
          , NRCNHMOT: req.body['NRCNHMOT']
          , IDG024  : { id: req.body['IDG024'] }
        }

        let motorista = await dao.salvarMotorista(req, res, next); 
        blOk = (motorista.id !== undefined);

        if (blOk) { req.body.IDG031 = motorista.id; };
      } else {
        blOk = true;
      }

      if (blOk) {
        let editar = await dao.updateEditar(req, res, next).then(result => { return 'Ok'; });
        blOk = (editar === 'Ok');

        if (!blOk) { msgErro = `Falha ao editar dados agendamento!`; };
      } else {
        msgErro = `Falha ao salvar motorista!`;
      }

      if (blOk) {
        await req.objConn.close();
        res.json(req.body.IDH006);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {

      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});

    }

  }

  api.verificarAgendamento = async function (req, res, next){

    try {

      if(!req.objConn){
        req.objConn = await dao.controller.getConnection();
      }

      var result = await dao.verificarAgendamento(req, res, next);

      if(req.headers){
        res.status(200).send(result);
      } else{
        return result;
      }

    } catch(err) {

      if(req.headers){
        res.status(500).send({message:`Erro ao verificar agendamento, 
        se o erro persistir entre em contato com o suporte. ERRO: A001`, erro:err});
      }else{
        return err;
      }
    }
  }

  api.verificarAGP = async function (req, res, next){
    
    try {
      req.objConn = await dao.controller.getConnection();

      var result = await dao.verificarAGP(req, res, next);

      res.status(200).send(result);
      
    } catch(err) {
      res.status(500).send({message:`Erro ao verificar envio de AGP, 
      se o erro persistir entre em contato com o suporte. ERRO: A002`});
    }
  }

  /******************************************************************************************
   * @description Função utilizada para cancelar um ou vários agendamentos de cargas
   * @author Walan Cristian Ferreira Almeida
   * @since 29/04/2019
   *
   * @async
   * @function api/cancelarAgendamento
  ********************************************************************************************/
  api.cancelarAgendamento = async function (req, res, next) {

    try {
      req.body.IDH006 = req.body.agendamentosAgrupar;
      var limparSlots = await api.limparSlots(req, res, next)
                                 .then((result) => { return 'Ok'; })
                                 .catch((err) => { throw err; });

      if (limparSlots == 'Ok') {
        await dao.cancelarAgendamento(req, res, next);
        await dao.cancelarAgrupamento(req, res, next);
        await dao.cancelarTomador(req, res, next);
        return true;
      }

      return false;

    } catch (err) {
      throw err;
    }
  }

  api.salvarAgrupamentoCargas = async function (req, res, next){

    try {
      var oldIDG046;
      for (key of req.body.dadosCarga.cargas) {
        let validaSalvar = true; // Validação para não duplicar registro na H024
        if (oldIDG046 == null) {
          oldIDG046 = key.IDG046;
        } else {
          if (oldIDG046 == key.IDG046) {
            validaSalvar = false;
          } else {
            oldIDG046 = key.IDG046;
          }
        }
        var obj = {
          IDH006: req.IDH006,
          IDG046: key.IDG046,
          NTFISCA1: key.NTFISCA1,
          NTFISCA2: key.NTFISCA2,
          TPOPERAC: key.TPOPERAC.id,
          objConn: req.objConn
        };
        if (validaSalvar) { // Validação para não duplicar registro na H024
          await dao.salvarAgrupamentoCargas(obj, res, next);
        } else {
          console.log('Esta carga já foi agendada!');
        }
      }
    } catch(err) {
      return false
    }
    return true

  }

  api.editarAgrupamentoCargas = async function (req, res, next){

    req.IDH006 = req.body.IDH006;
    var placasAntigas = await agDAO.buscarPlaca(req, res, next)
                                   .catch((err) => {
                                     err.stack = new Error().stack + `\r\n` + err.stack;
                                     next(err);
                                   });

    try{
      for (key of req.body.dadosCarga.cargas) {
        var obj = {
          IDH006: req.IDH006,
          IDG046: key.IDG046,
          NTFISCA1: key.NTFISCA1,
          NTFISCA2: key.NTFISCA2,
          TPOPERAC: key.TPOPERAC.id,
          objConn: req.objConn
        };
        await dao.editarAgrupamentoCargas(obj, res, next);

        //gerar pre-asn
        if (placasAntigas[0].NRPLAVEI  != req.body.dadosCarga.NRPLAVEI) {
          await agDAO.editarPreASN({ IDG046: key.IDG046, STINTCLI: 7 }, res, next);
        }

      }
    } catch(err) {
        return false
    }
    return true

  }

  api.desagruparCargas = async function (req, res, next) {

    try {
      var msgErro = '';
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      let result = await dao.listarCargasAgendamentoAgrupado(req, res, next);
      req.body.IDG046 = result[0].IDG046;

      if (req.body.IDG046) {
        req.body.IDH006 = [req.body.IDH006];
        var limparSlots = await api.limparSlots(req, res, next)
                                   .then((result) => { return 'Ok'; })
                                   .catch((err)   => { throw err; });

        if (limparSlots == 'Ok') {
          await dao.cancelarAgendamento(req, res, next);
          await dao.cancelarAgrupamento(req, res, next);
          await dao.cancelarTomador(req, res, next);

          let voltarAceite = await dao.voltarCargaAceite(req, res, next)
                                      .then((result) => { return 'Ok' })
                                      .catch((err)   => { throw err; });

          blOk = (voltarAceite == 'Ok');

          if (!blOk) {
            msgErro = 'Erro ao voltar cargas para aceite!'
          }
        } else {
          msgErro = 'Erro ao limpar slots!'
        }
      } else {
        msgErro = 'Erro ao listar cargas agrupadas!';
      }

      if (blOk) {
        await req.objConn.close();
        return res.status(200).send({message: 'Cargas desagrupadas com sucesso!'});
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }

  }

  /********************************************************************************************************
   * @description Função utilizada para salvar a quantidade de pallet e peso unitário do pallet p/ cálculo
   * @author Walan Cristian Ferreira Almeida
   * @since 28/06/2019
   *
   * @async
   * @function api/salvarPesoPallet
  *********************************************************************************************************/
  api.salvarPesoPallet = async function (req, res, next){
    await dao.salvarPesoPallet(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.montarCarga = async function (req, res, next) {

    try {

      let blOk     = false;
      req.objConn  = await dao.controller.getConnection();
      let arDados  = (req.body.carga    === undefined) ? [] : req.body.carga;
      let arIDG043 = (req.body.arIDG043 === undefined) ? [] : req.body.arIDG043;

      if (arDados.length > 0) {

        let parm      = { arDados, objConn: req.objConn };
        var objResult = await viagemCTRL.insereViagens(parm, res, next).catch((err) => next(err));
        blOk          = (arDados.length == objResult.arID.length);

        if (blOk) {
          let obj          = { objConn: req.objConn, IDG043: arIDG043, STFINALI: 1 };
          let mudaStFinali = await agDAO.mudarStFinali(obj, res, next).then(result => { return 'Ok'; });
          blOk             = (mudaStFinali == 'Ok');
        }

        if (blOk) {
          await req.objConn.close();
        } else {
          await req.objConn.closeRollback();
          objResult = { arID: [], arOcorre: ['Falha ao alterar status da nota'] };
        }

      } else {
        var objResult = { arID: [], arOcorre: ['Não foram encontrados dados para a operação'] };
      }

      let cdStatus = (arDados.length == objResult.arID.length) ? 200 : 500;
      res.status(cdStatus).send(objResult);

    } catch (error) {

      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${error.message}`});

    }

  }

  return api;
};
