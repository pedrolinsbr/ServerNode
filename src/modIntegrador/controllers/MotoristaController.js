module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.MotoristaDAO;

  api.listarMotorista = async function (req, res, next) {
    await dao.listarMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotorista = async function (req, res, next) {
    await dao.buscarMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarMotorista = async function (req, res, next) {
    await dao.salvarMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarMotorista = async function (req, res, next) {
    await dao.atualizarMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirMotorista = async function (req, res, next) {
    await dao.excluirMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
