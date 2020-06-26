module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.ComprovanteAgendamentoDAO;

  api.gerarComprovanteCarga = async function (req, res, next) {
    await dao.gerarComprovanteCarga(req, res, next)
      .then((header) => {
        var objComprovanteRecarga = {};
        objComprovanteRecarga.cabecalho = header;
        req.params.idCarga = header["IDG046"];

        dao.buscarDeliveriesCarga(req, res, next)
          .then((deliveries) => {
            objComprovanteRecarga.deliveries = deliveries;
            res.json(objComprovanteRecarga);
          });

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.gerarComprovanteAgendamento = async function (req, res, next) {
    await dao.gerarComprovanteAgendamento(req, res, next)
      .then((objComprovanteAgendamento) => {
        console.log(objComprovanteAgendamento);
        res.json(objComprovanteAgendamento);
      })
      .catch((err) => {
        console.log(err, "Error ComprovanteAgendamentoController");
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
