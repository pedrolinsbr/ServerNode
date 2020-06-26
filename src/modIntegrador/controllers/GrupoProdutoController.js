module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.GrupoProdutoDAO;

  api.listarGrupoProdutos = async function (req, res, next) {
    await dao.listarGrupoProdutos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarGrupoProdutos = async function (req, res, next) {
    await dao.buscarGrupoProdutos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarGrupoProdutos = async function (req, res, next) {
    await dao.salvarGrupoProdutos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarGrupoProdutos = async function (req, res, next) {
    await dao.atualizarGrupoProdutos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirGrupoProdutos = async function (req, res, next) {
    await dao.excluirGrupoProdutos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProdutosGrupo = async function (req, res, next) {
    await dao.buscarProdutosGrupo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
