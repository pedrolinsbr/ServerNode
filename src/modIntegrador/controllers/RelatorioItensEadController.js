/**
 * @file Relatório de itens por delivery.
 * @module modIntegrador/controllers/RelatorioItensEadController
 * 
 * @requires modIntegrador/dao/RelatorioItensEadDAO
*/
module.exports = function (app, cb) {

  var api = {};

  const dao = app.src.modIntegrador.dao.RelatorioItensEadDAO;

  api.listar = async function (req, res, next) {

    var results = await dao.listar(req, res, next)
    
    .catch((err) => {
      next(err);
    });
    
    res.json(results);

  };

  return api;
};
