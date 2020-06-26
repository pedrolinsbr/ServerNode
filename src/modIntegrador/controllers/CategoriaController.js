module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.CategoriaDAO;

  api.listarCategoria = async function (req, res, next) {
    await dao.listarCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCategoria = async function (req, res, next) {
    await dao.buscarCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarCategoria = async function (req, res, next) {
    await dao.salvarCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarCategoria = async function (req, res, next) {
    await dao.atualizarCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirCategoria = async function (req, res, next) {
    await dao.excluirCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProdutosCategoria = async function (req, res, next) {
    await dao.buscarProdutosCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;  
};
