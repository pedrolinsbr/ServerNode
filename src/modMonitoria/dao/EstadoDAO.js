/* module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.buscarFiltro = async function (req, res, next) {
    return await utils.searchComboBox("G002","G002.NmEstado",req.body.parameter);
  };

  return api;
};
*/