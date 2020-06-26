module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTracking.dao.CTeDAO;

  api.listar = async function (req, res, next) {
    var result = await dao.listar(req, res, next)
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
    await dao.fillDeliveries(req, res, next, result).then((result) => {
      res.json(result);
    });

  };

  api.buscar = async function (req, res, next) {
    var result = await dao.buscar(req, res, next)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
    await dao.fillAll(req, res, next, result).then((result) => {
      res.json(result);
    });

  };

  api.buscarCargasCTe = async function (req, res, next) {
    await dao.buscarCargasCTe(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;

};
