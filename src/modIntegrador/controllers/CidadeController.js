module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.CidadeDAO;

  api.listarCidade = async function (req, res, next) {
    await dao.listarCidade(req, res, next)
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

  api.buscarCidade = async function (req, res, next) {
    await dao.buscarCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarCidade = async function (req, res, next) {
    await dao.salvarCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarCidade = async function (req, res, next) {
    await dao.atualizarCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirCidade = async function (req, res, next) {
    await dao.excluirCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCidadesEstado = async function (req, res, next) {
    await dao.buscarCidadesEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarClientesCidade = async function (req, res, next) {
    await dao.buscarClientesCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;  
};
