module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.DocumentoPendenteCargaDAO;

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  // api.buscar = async function (req, res, next) {
  //   await dao.buscar(req, res, next)
  //     .then((result1) => {
  //       res.json(result1);
  //     })
  //     .catch((err) => {
  //       err.stack = new Error().stack + `\r\n` + err.stack;
  //       next(err);
  //     });
  // };

  return api;
};
