module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.salvar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //console.log('req', req.body);
    try {          
      let result = await con.insert({
        tabela: `S026`,
        colunas: req.body,
        key: `S026.IDS026`
      })
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  api.deletar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.update({
        tabela: `S026`,
        colunas: {
          SNDELETE: 1
        },
        condicoes: `IDS026 = :id`,
        parametros: {
          id: req.body.IDS026
        }
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  return api;
};
