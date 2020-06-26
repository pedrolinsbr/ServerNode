module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  var daoAgendamento = app.src.modHoraCerta.dao.AgendamentoDAO;
  var dao =  app.src.modHoraCerta.dao.MobileDAO;

  var socket = require('socket.io-client').connect('http://34.235.52.140:3020');
  
  
  api.buscarAgendamento = async function (req, res, next) {
    await dao.buscarAgendamento(req, res, next)
      .then(async (result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarMotorista = async function (req, res, next) {
    await dao.buscarMotorista(req, res, next)
      .then(async (result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.solicitarEntrada = async function (req, res, next) {

    var data = await dao.buscarSolicitarEntrada(req, res, next);


    socket.emit('emitRoom', {room:req.body.IDH006,  type:1, IDH006:data[0].IDH006, 
                NMMOTORI:data[0].NMMOTORI, HOOPERAC: data[0].HOOPERAC, 
                TXOBSERV: data[0].TXOBSERV, text:"rafael"
            });
    res.status(200).send( "ok");
  };

  api.solicitarEntradaPainel = async function (req, res, next) {
    
    try{ 
      var data = await dao.buscarSolicitarEntrada(req, res, next);

      socket.emit('emitRoom', {
        room: 'hc-painel', type: 1, IDH006: data[0].IDH006,
        NMMOTORI: data[0].NMMOTORI, HOOPERAC: data[0].HOOPERAC,
        TXOBSERV: data[0].TXOBSERV, text: "rafael"
      });
      res.status(200).send( "ok");
    }
    catch (err) {
      res.status(500).send( "erro");
    } 
    
  }

  api.solicitarEntradaAuto = async function (req, res, next) {
    
    try{ 
      
      res.status(200).send( "ok");
    }
    catch (err) {
      res.status(500).send( "erro");
    } 
    
  }


  


  return api;
};
