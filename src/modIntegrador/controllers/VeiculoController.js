module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.VeiculoDAO;

  api.listarVeiculo = async function (req, res, next) {
    await dao.listarVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarVeiculo = async function (req, res, next) {
    await dao.buscarVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarVeiculo = async function (req, res, next) {
    await dao.salvarVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarVeiculo = async function (req, res, next) {
    await dao.atualizarVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirVeiculo = async function (req, res, next) {
    await dao.excluirVeiculo(req, res, next)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  
  return api;
};
