const Joi = require('joi');

module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.UnidadeMedidaDAO;

  api.listarUnidadeMedida = async function (req, res, next) {
    await dao.listarUnidadeMedida(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarUnidadeMedida = async function (req, res, next) {
    await dao.salvarUnidadeMedida(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarUnidadeMedida = async function (req, res, next) {
    await dao.buscarUnidadeMedida(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizarUnidadeMedida = async function (req, res, next) {
    await dao.atualizarUnidadeMedida(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
        throw err;
      });
  };

  api.excluirUnidadeMedida = async function (req, res, next) {
    await dao.excluirUnidadeMedida(req, res, next)
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
