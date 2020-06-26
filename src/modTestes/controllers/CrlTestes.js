//var db = require(process.cwd() + '/config/database');

module.exports = function (app, cb) {
  
  var api = {};
  var dao = app.src.modTestes.dao.DaoTestes;
  var log = app.config.logger;
  var CrlTestesC2 = app.src.modTestes.controllers.CrlTestesC2;
  var utils = app.src.utils.FuncoesObjDB;
  
  api.nivel2 = async (req, res, next) => {
    let con = await dao.controller.getConnection();
    try {
      
      await dao.controller.setConnection(con);
      req.con = con;
      let id = await dao.nivel2(req, res, next)
        .then((result1) => {
          log.debug(result1);
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
        });
    
      CrlTestesC2.dao.controller.setConnection(con);
      await CrlTestesC2.save2(id, con);
    
      con.close();
    } catch(err) {
      con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  };
  //api.nivel2({}, null, null);



  api.teste = async function (req, res, next) {

    utils.construirExcel(null);
    // await dao.teste(req, res, next)
    //   .then((result1) => {
    //     res.json(result1);
    //   })
    //   .catch((err) => {
    //     err.stack = new Error().stack + `\r\n` + err.stack;
    //     next(err);
    //   });
  };

  return api;
};