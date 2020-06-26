module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.EstadoDAO;

  api.listarEstado = async function (req, res, next) {
    await dao.listarEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarBusca = async function (req, res, next) {
    await dao.listarBusca(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEstado = async function (req, res, next) {
    await dao.buscarEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarEstado = async function (req, res, next) {
    await dao.salvarEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarEstado = async function (req, res, next) {
    await dao.atualizarEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirEstado = async function (req, res, next) {
    await dao.excluirEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEstadosPais = async function (req, res, next) {
    await dao.buscarEstadosPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarFiltro = async function (req, res, next) {
    await dao.buscarFiltro(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
