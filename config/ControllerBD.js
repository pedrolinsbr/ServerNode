

module.exports = function (app) {
  var api = {};
  var BD = require(process.cwd() + '/config/databaseV4.js');//app.config.databaseV4;
  //var con = null;
  //var teste = app.Router();

  api.setConnection = async function (connection) {
    if (connection != null && connection != undefined) {
      connection.addNivel();
      //con = connection;
    }
  }

  api.getConnection = async function (con, user = null) {
    if (con == null || con == undefined) {
      con = new BD();
    } 
    if (user != null && user != undefined) {
      await con.execute(
        {
          sql: `Insert Into TEMP Values (` + user + `)`,
          param: []
        });
    }  
    return con;
  }

  return api;
}