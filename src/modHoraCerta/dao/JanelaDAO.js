module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = require(process.cwd() + '/config/database');
  const tmz = app.src.utils.DataAtual;
  
  api.controller = app.config.ControllerBD;

  api.listar = async function (req, res, next) {

        var params    = req.query;
        var arrOrder = [];

        if(params.order != null) {
          params.order.forEach(function (order) {
            arrOrder.push(params.columns[order.column]['name']  + ' ' + order['dir']);
          })
          arrOrder = arrOrder.join();
        }else{
          arrOrder = ' H005.IdH005';
        }

        return await db.execute(
          {

            sql: `SELECT
                        H005.IDH005,
                        H005.IDG028,
                        H005.NRJANELA,
                        H005.DSJANELA,
                        TO_CHAR(H005.DTCADAST,'DD/MM/YYYY') AS DTCADAST,
                        H005.IDS001,
                        G028.NMARMAZE,
                        H005.STCADAST,
                        COUNT(H005.IDH005) OVER () AS COUNT_LINHA
                  FROM H005
                  INNER JOIN G028 ON (H005.IDG028 = G028.IDG028)
                  WHERE H005.SNDELETE = 0
                ORDER BY `+ arrOrder,
            param: []
          })
          .then((result) => {
            return (utils.construirObjetoRetornoBD(result));
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
      };

  api.buscar = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: 'SELECT * FROM H005 WHERE IDH005 = ' + id + ' AND SNDELETE = 0',
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  };

  api.salvar = async function (req, res, next) {

    let con = await this.controller.getConnection(null, req.UserId);

    return await con.insert({
      tabela: 'H005',
      colunas: {

        DsJanela : req.body.DSJANELA,
        NrJanela : req.body.NRJANELA,
        StCadast : req.body.STCADAST,
        DtCadast : tmz.dataAtualJS(),
        IdG028   : req.body.IDG028,
        IdS001   : req.UserId

      },
      key: 'IdH005'
    })
      .then(async (result) => {
        await con.close();
        return (result);
      })
      .catch(async (err) => {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  };

  api.atualizar = async function (req, res, next) {

    var id = req.params.id;
    let con = await this.controller.getConnection(null, req.UserId);

    return await con.update({
        tabela: 'H005',
        colunas: {
          DsJanela: req.body.DSJANELA,
          NrJanela: req.body.NRJANELA,
          StCadast: req.body.STCADAST,
          IdG028  : req.body.IDG028
        },
        condicoes: 'IdH005 = :id',
        parametros: {
          id: id
        }
      })
      .then(async (result) => {
        await con.close();
        return {response: "Atualizado com sucesso"};
      })
      .catch(async (err) => {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  };

  api.excluir = async function (req, res, next) {

    var id = req.params.id;
    let con = await this.controller.getConnection(null, req.UserId);

    return await con.update({
        tabela: 'H005',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdH005 = :id',
        parametros: {
          id: id
        }
      })
      .then(async (result) => {
        await con.close();
        return {response: "Excluido com sucesso"};
      })
      .catch(async (err) => {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

  };

  return api;
};
