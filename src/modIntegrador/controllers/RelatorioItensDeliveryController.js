/**
 * @file Relatório de itens por delivery.
 * @module modIntegrador/controllers/RelatorioItensDeliveryController
 * 
 * @requires modIntegrador/dao/RelatorioItensDeliveryDAO
*/
module.exports = function (app, cb) {

  var api = {};

  const dao = app.src.modIntegrador.dao.RelatorioItensDeliveryDAO;

  api.listar = async function (req, res, next) {

    var results = await dao.listar(req, res, next)
    
    .catch((err) => {
      next(err);
    });
    
    res.json(results);

  };

  return api;
};
