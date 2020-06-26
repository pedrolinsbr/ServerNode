module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  var dao       = app.src.modHoraCerta.dao.SalvarDAO;
  var utils     = app.src.utils.DataAtual;

  //var crlTomador = app.src.modHoraCerta.controllers.TomadorController;
  

  api.salvar = async function (req, res, next) {

    console.log("teste");

    //var data = dtatu.tempoAtual('YYYY-MM-DD HH:mm:ss')

    try {
/*
      var blOK = false;
      var msgErro = null;
      if (verificarSlotLivre) {
          if (IDH006) {
             blOK = true;
          } else {
            msgErro = 'nao tem agendamento'
          }

      } else {
         msgErro = 'Slot nao ta livre'
      }


      if (blOK) {
        close 

      } else {
        return res.status(500).send( { nrlogerr: -1, armensag: [req.__('hc.erro.slotsIndisponivel')] });
      }
*/
      req.objConn = await dao.controller.getConnection();

      var verificarSlotLivre = await api.verificarSlotLivre(req, res, next);
      
      if (verificarSlotLivre > 0) {
        return res.status(500).send( { nrlogerr: -1, armensag: [req.__('hc.erro.slotsIndisponivel')] });
      }

      var IDH006 = await dao.inserir(req, res, next);

      if (!IDH006.id) {
        return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao registrar o agendamento' });
      }

      var HOINICIO = await api.buscarHoinicio(req, res, next);

      if (HOINICIO) {
        return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao buscar hora de inicio' });
      }

      var mudarEtapa = await api.mudarEtapa({IDS001: req.body.IDS001, IDH006: IDH006, ETAPA: 3, IDI015: null, HOINICIO: HOINICIO}, res, next);
      
      if (mudarEtapa != 1) {
        return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao registrar etap de agendamento' });
      }


      if(req.body.dadosCarga.IDG046 != null){
        var DTPSMANU = await api.buscarDtpsmanu(req, res, next);

        if (DTPSMANU) {
          return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao buscar DTPSMANU' });
        }
      }

      if (req.body.dadosCarga.IDG046 != '' && req.body.dadosCarga.IDG046 != null && req.body.dadosCarga.TPMOVTO !="D" && DTPSMANU == null) {
        var atualizarEtapaDelivery = await api.atualizarEtapaDelivery(req, res, next);

        if (atualizarEtapaDelivery) {
          return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao atualizar etapa das deliveries' });
        }

        var deliveries = await api.buscarDeliveries(req, res, next);

        if (deliveries) {
          return res.status(500).send( { nrlogerr: -1, armensag: 'Erro ao buscar deliveries' });
        }

        var parm = { idParada: deliveries[0].IDG048, idEvento: 9, dtEvento: data };

        await asnDAO.salvarEventoEntrega(parm, res, next);

        if (deliveries[0].DTENTCON != null) {
          await dao.atualizarDtPreAtu(deliveries, res, next);  
        }
        
        var buscarDataAgenda = await api.buscarDataexternalTerminalAgenda(req, res, next);
externalTerminal
        if (buscarDataAgenda) {externalTerminal
          return res.status(500).send( { nrlogerr: externalTerminal-1, armensag: 'Erro ao buscar a data Agenda' });
        }


      }

      await objConn.close();
      //await objConn.closeRollback();

            
    } 
    catch (err) {
      res.status(500).send(err.message);
    }

  };

  api.verificarSlotLivre = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.verificarSlotLivre(req, res, next).catch((err) => { throw err });
    return result[0].QTD
  }

  api.buscarHoinicio = async function (req, res, next) {
    var result = await dao.buscarHoinicio(req, res, next).catch((err) => { throw err });
    return result[0].HOINICIO
  }

  api.buscarDtpsmanu = async function (req, res, next) {
    var result = await dao.buscarDtpsmanu(req, res, next).catch((err) => { throw err });
    if (result){
      return result[0].DTPSMANU
    } else{
      return null
    }
  }

  api.mudarEtapa = async function (req, res, next) {
    var result = await dao.buscarHoinicio(req, res, next).catch((err) => { throw err });
    return result[0].HOINICIO
  }

 



  return api;
};
