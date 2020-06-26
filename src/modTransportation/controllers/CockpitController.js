module.exports = function (app, cb) {

  const axios = require('axios');
  var api = {};
  var dao = app.src.modTransportation.dao.CockpitDAO;

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

  api.buscarDetalhe = async function (req, res, next) {
    await dao.buscarDetalhe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };



  api.buscarDetalheRedirect = async function (req, res, next) {

    axios.post('http://34.238.36.203/api/tp/cockpit/buscarDetalhe', req.body)
      .then((result) => {
        res.json(result.data);
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }


  return api;
};
