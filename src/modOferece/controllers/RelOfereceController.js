/**
 * @file Relatorio de cargas para Oferecimento
 * @module modOferece/controllers/RelOfereceController
 * 
 * @requires utils/ConversorArquivos
 * @requires utils/Formatador
 * @requires modOferece/dao/RelOfereceDAO
*/
module.exports = function (app, cb) {

    var api = {};

    const dao = app.src.modOferece.dao.RelOfereceDAO;
    // const utilsCA  = app.src.utils.ConversorArquivos;
    // const utilsFMT = app.src.utils.Formatador;
  
    api.listar = async function (req, res, next) {

      var results = await dao.listar(req, res, next).catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
      });
      
      res.json(results);

    }
    return api;
};
