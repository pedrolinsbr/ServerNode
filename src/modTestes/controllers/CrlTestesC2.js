//var db = require(process.cwd() + '/config/database');

module.exports = function (app, cb) {
  
  var api = {};
  api.dao = app.src.modTestes.dao.DaoTestesC2;
  var log = app.config.logger;
  
  api.save2 = async function(id, con) {
    
    await this.dao.insertTeste(id, con)
      .then((result1) => {
        retorno = result1;
      //res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

  };

  return api;
};