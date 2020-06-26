module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.MobileDAO;

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

  api.listarDocumentos = async function (req, res, next) {
    await dao.listarDocumentos(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.desmontarMobile = async function (req, res, next) {
    await dao.desmontarMobile(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.cancelarMobile = async function (req, res, next) {
    await dao.cancelarMobile(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.indicadoresMobile = async function(req,res,next){
    await dao.indicadoresMobile(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  }

  api.qtdSituacaoMobile = async function(req,res,next){
    await dao.qtdSituacaoMobile(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  }

  api.validaCancelar = async function(req,res,next){
    await dao.validaCancelar(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  }

  api.atribuirVeiculoMotorista = async function(req,res,next){
    await dao.atribuirVeiculoMotorista(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  }

  api.mapaMobile = async function(req,res,next){
    await dao.mapaMobile(req, res, next)
      .then((result1) => {
          res.json(result1);
      })
      .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
  }

  

  return api;
};
