module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.NotaDAO;

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

  api.listarCarga = async function (req, res, next) {
    await dao.listarCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.listarNfe = async function (req, res, next) {
    await dao.listarNfe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.atribuirDataEntrega = async function(req,res,next){
    await dao.atribuirDataEntrega(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  };

  api.alteracaoDataPrevisaoEntrega = async function(req,res,next){
    await dao.alteracaoDataPrevisaoEntrega(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  };

  api.liberarConhecimento = async function(req,res,next){
    await dao.liberarConhecimento(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  };

  api.listarLiberaConhecimentos = async function(req,res,next){
    await dao.listarLiberaConhecimentos(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  };

  api.listarInfConhecimento = async function (req, res, next) {
    await dao.listarInfConhecimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarInfNotas = async function (req, res, next) {
    await dao.listarInfNotas(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarInfMovimento = async function (req, res, next) {
    await dao.listarInfMovimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarInfProdutos = async function (req, res, next) {
    await dao.listarInfProdutos(req, res, next)
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
