module.exports = function (app) {

  var api = {};
  var dao = app.src.modMonitoria.dao.TabelaDAO;

  api.buscarAcl = async function (req, res, next) {
    await dao.buscarAcl(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarValueTabela = async function (req, res, next) {
    await dao.buscarValueTabela(req, res, next)
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
