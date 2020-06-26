module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.TipoContatoClienteDAO;

  api.listarTipoContatoCliente = async function (req, res, next) {
    await dao.listarTipoContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoContatoCliente = async function (req, res, next) {
    await dao.buscarTipoContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarTipoContatoCliente = async function (req, res, next) {
    await dao.salvarTipoContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarTipoContatoCliente = async function (req, res, next) {
    await dao.atualizarTipoContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirTipoContatoCliente = async function (req, res, next) {
    await dao.excluirTipoContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
