module.exports = function (app) {

  var api = {};
  var dao = app.src.modMonitoria.dao.CidadeTarifaDAO;

  api.getDiasEntrega = async function (req, res, next) {
    await dao.getDiasEntrega(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  

  return api;
};
