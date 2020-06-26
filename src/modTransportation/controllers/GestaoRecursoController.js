module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.GestaoRecursoDAO;

  api.listarFrota = async function (req, res, next) {
    await dao.listarFrota(req, res, next)
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
