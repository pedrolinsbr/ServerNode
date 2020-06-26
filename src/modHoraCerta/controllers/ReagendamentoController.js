module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  var dao = app.src.modHoraCerta.dao.ReagendamentoDao;
  var daoAgendamento = app.src.modHoraCerta.dao.AgendamentoDAO;
  

  api.buscarHorarioReagendar = async function (req, res, next) {
    await dao.buscarHorarioReagendar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validaSlotReagendar = async function (req, res, next) {
    await dao.validaSlotReagendar(req, res, next)
      .then((result1) => {
        //res.json(result1);
        var slots = '';
        for (var i = result1.length - 1; i >= 0; i--) {
          slots = slots + result1[i].IDH007 + ',';
        }          
        
        slots = slots.substring(0,(slots.length - 1));

        var objResult = {VALID: 1, DATA: slots};
        for (var i = result1.length - 1; i >= 0; i--) {
          if(result1[i].IDH006 != null && result1[i].STHORARI != null){
            objResult = {VALID: 0, DATA: slots};
            break;
          }
          
        }

      res.json(objResult);
      //return objResult;

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.reagendar = async function (req, res, next) {

    tomadores = await daoAgendamento.buscarTomador({IDH006:req.body.IDH006}, res, next);
    
    await dao.reagendar(req, res, next)
      .then(async (result1) => {
        console.log("teste")
        for (key of tomadores[0].IDG005.split(',')) {
          var obj = { IDH006: result1, IDG005: key };
          await daoAgendamento.salvarTomador(obj, res, next)
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });
        }
           
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
