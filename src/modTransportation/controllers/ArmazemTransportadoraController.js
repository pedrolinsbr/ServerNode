module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.ArmazemTransportadoraDAO;

  //############################################################################################################
  // ROTAS

  api.listarArmazemTransp = async function (req, res, next) {
    await dao.listarArmazemTransp(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarArmazemTransp = async function (req, res, next) {
    await dao.buscarArmazemTransp(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarArmazemTransp = async function (req, res, next) {
    await dao.salvarArmazemTransp(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizarArmazemTransp = async function (req, res, next) {
    await dao.atualizarArmazemTransp(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluirArmazemTransp = async function (req, res, next) {
    await dao.excluirArmazemTransp(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
