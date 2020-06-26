module.exports = function (app, cb) {
  
  var api = {};
  var dao = app.src.modIntegrador.dao.EmbalagemDAO;

  api.listarEmbalagem = async function (req, res, next) {
    await dao.listarEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEmbalagem = async function (req, res, next) {
    await dao.buscarEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarEmbalagem = async function (req, res, next) {
    await dao.salvarEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarEmbalagem = async function (req, res, next) {
    await dao.atualizarEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirEmbalagem = async function (req, res, next) {
    await dao.excluirEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProdutosEmbalagem = async function (req, res, next) {
    await dao.buscarProdutosEmbalagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {

        next(err);
      });
  };

  return api;
};
