module.exports = function (app, cb) {

  var api = {};

  var dao = app.src.modIntegrador.dao.CodigoONUDAO;

  api.listarCodigoONU = async function (req, res, next) {
    await dao.listarCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarCodigoONU = async function (req, res, next) {
    await dao.salvarCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCodigoONU = async function (req, res, next) {
    await dao.buscarCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarCodigoONU = async function (req, res, next) {
    await dao.atualizarCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirCodigoONU = async function (req, res, next) {
    await dao.excluirCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProdutosCodigoONU = async function (req, res, next) {
    await dao.buscarProdutosCodigoONU(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
