module.exports = function (app, cb) {
  
  var api = {};
  var dao = app.src.modIntegrador.dao.PaisDAO;

  api.listarPais = async function (req, res, next) {
    await dao.listarPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarBuscaPais = async function (req, res, next) {
    await dao.listarBuscaPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarPais = async function (req, res, next) {
    await dao.buscarPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarPais = async function (req, res, next) {
    await dao.salvarPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
 
  api.atualizarPais = async function (req, res, next) {
    await dao.atualizarPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirPais = async function (req, res, next) {
    await dao.excluirPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarFiltroPais = async function (req, res, next) {
    await dao.buscarFiltroPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
