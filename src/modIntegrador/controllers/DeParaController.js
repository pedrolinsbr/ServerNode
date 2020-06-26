module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.DeParaDAO;

  api.listarDePara = async function (req, res, next) {
    await dao.listarDePara(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarDePara = async function (req, res, next) {
    await dao.buscarDePara(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarDePara = async function (req, res, next) {
    await dao.salvarDePara(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizarDePara = async function (req, res, next) {
    await dao.atualizarDePara(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluirDePara = async function (req, res, next) {
    await dao.excluirDePara(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
