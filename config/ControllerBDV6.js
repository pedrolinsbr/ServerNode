

module.exports = function (app) {
  var api = {};
  var BD = require(process.cwd() + '/config/databaseV6.js');//app.config.databaseV4;

  //Responsavel por aumentar o nivel da conexão
  api.addNivel = async function (obj) {
    const { con } = obj;
    if (con != null && con != undefined) {
      con.addNivel();
    }
  }

  //Responsavel por abrir a conexâo com o banco
  api.openDB = async function (obj) {
    let { con, user } = obj;
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