module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.ParadaDAO;

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

  api.listarInfparada = async function (req, res, next) {
    await dao.listarInfparada(req, res, next)
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

  api.listarNotaRaioX = async function (req, res, next) {
    await dao.listarNotaRaioX(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarPorCargaRaioX = async function (req, res, next) {
    await dao.listarPorCargaRaioX(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarPorConhecimentoRaioX = async function (req, res, next) {
    await dao.listarPorConhecimentoRaioX(req, res, next)
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
