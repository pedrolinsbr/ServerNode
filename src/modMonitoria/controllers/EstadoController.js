/* module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modMonitoria.dao.EstadoDAO;

  api.buscarFiltro = async function (req, res, next) {
    await dao.buscarFiltro(req, res, next)
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
*/