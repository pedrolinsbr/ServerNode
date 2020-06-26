module.exports = function (app, cb) {

  var api     = {};
  const dao   =   app.src.modHoraCerta.dao.AceiteDAO;


  api.buscar = async function (req, res, next) {
    await dao.controller.setConnection(req.objConn);
    var result = await dao.buscar(req, res, next);
    
  }




  
  return api;
};
