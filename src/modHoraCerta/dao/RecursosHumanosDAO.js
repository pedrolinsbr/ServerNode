module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = require(process.cwd() + '/config/database');

  api.listar = async function (req, res, next) {

        var params    = req.query;
        var strStart  = (req.query.start  != undefined ? req.query.start : 0);
        var strLength = (req.query.length != undefined ? req.query.length : 10);
        var arrOrder = [];

        if(params.order != null) {
          params.order.forEach(function (order) {
            arrOrder.push(params.columns[order.column]['name']  + ' ' + order['dir']);
          })
          arrOrder = arrOrder.join();
        }else{
          arrOrder = ' H001.IdH001';
        }

        return await db.execute(
          {

            sql: `Select H001.*, G028.NMARMAZE,
                         COUNT(H001.IdH001) OVER () as COUNT_LINHA
                    From H001 H001
                    Join G028 G028 on (H001.IdG028 = G028.IdG028)
                   Where H001.SnDelete = 0
                Order By `+ arrOrder + `
                  Offset `+strStart+` rows
              Fetch next `+strLength+` rows only`,
            param: []
          })
          .then((result) => {
            console.log(result);
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
        sql: 'select * from H001 where IdH001 = ' + id + ' and SnDelete = 0',
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
    return await db.insert({
      tabela: 'H001',
      colunas: {

        NmRecHum : req.body.NMRECHUM.toUpperCase(),
        StCadast: 'A',
        DtCadast: new Date(),
        IdG028  : req.body.IDG028,
        IdS001  : 4,

      },
      key: 'IdH001'
    })
      .then((result1) => {
        return (result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  };

  api.atualizar = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'H001',
        colunas: {
          NmRecHum:  req.body.NMRECHUM.toUpperCase(),
          StCadast: req.body.STCADAST.toUpperCase(),
          IdG028  : req.body.IDG028
          },
        condicoes: 'IdH001 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result1) => {
          return {response: "Atualizado com sucesso"};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          //erro(err);
          throw err;
        });
  };

  api.excluir = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'H001',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdH001 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result1) => {
          return {response: "Excluido com sucesso"};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          //erro(err);
          throw err;
        });

  };

  return api;
};
