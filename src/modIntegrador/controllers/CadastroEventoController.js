module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.CadastroEventoDAO;

  api.listarEvento = async function (req, res, next) {
    await dao.listarEvento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEvento = async function (req, res, next) {
    await dao.buscarEvento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarEvento = async function (req, res, next) {
    await dao.salvarEvento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarEvento = async function (req, res, next) {
    await dao.atualizarEvento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirEvento = async function (req, res, next) {
    await dao.excluirEvento(req, res, next)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
