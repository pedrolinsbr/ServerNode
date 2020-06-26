module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.GrupoClienteDAO;

  api.listarGrupoClientes = async function (req, res, next) {
    await dao.listarGrupoClientes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarGrupoClientes = async function (req, res, next) {
    await dao.buscarGrupoClientes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarGrupoClientes = async function (req, res, next) {
    await dao.salvarGrupoClientes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarGrupoClientes = async function (req, res, next) {
    await dao.atualizarGrupoClientes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirGrupoClientes = async function (req, res, next) {
    await dao.excluirGrupoClientes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarClientesGrupo = async function (req, res, next) {
    await dao.buscarClientesGrupo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
