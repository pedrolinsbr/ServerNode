
module.exports = function (app) {
  
  var api = {};
  api.controller = app.config.ControllerBD;

  /* api.setConnection = async function (connection) {
    if (connection != null && connection != undefined) {
      connection.addNivel();
      con = connection;
    }
  }

  api.getConnection = async function () {
    if (con == null) {
      con = new BD();
    }
  } */

  api.insertTeste = async function(insert1, con2) {
    //let con = new BD();
    let con = await this.controller.getConnection(con2);
    try {
      let insert2 = await con.execute(
        {
          sql: "insert1 into s024 (IDS022, IDS023) values (10, "+insert1+")",
          param: []
        })
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
        await con.close();
    } catch(err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  return api;
};