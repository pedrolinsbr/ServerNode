module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.EmbalagemProdutoDAO;

  api.listarEmbalagemProduto = async function (req, res, next) {
    await dao.listarEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarEmbalagemProduto = async function (req, res, next) {
    await dao.salvarEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEmbalagemProduto = async function (req, res, next) {
    await dao.buscarEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarEmbalagemProduto = async function (req, res, next) {
    await dao.atualizarEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
