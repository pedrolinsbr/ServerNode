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
          arrOrder = ' H003.IdH003';
        }

        return await db.execute(
          {

            sql: `Select H003.*, G028.NMARMAZE,
                         COUNT(H003.IdH003) OVER () as COUNT_LINHA
                    From H003 H003
                    Join G028 G028 on (H003.IdG028 = G028.IdG028)
                   Where H003.SnDelete = 0
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
        sql: 'select * from H003 where IdH003 = ' + id + ' and SnDelete = 0',
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
      tabela: 'H003',
      colunas: {

        NmEquipe : req.body.NMEQUIPE,
        StCadast: req.body.STCADAST,
        DtCadast: new Date(),
        IdG028  : req.body.IDG028,
        IdS001  : 4,

      },
      key: 'IdH003'
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
        tabela: 'H003',
        colunas: {
          NmEquipe:  req.body.NMEQUIPE,
          StCadast: req.body.STCADAST,
          IdG028  : req.body.IDG028
        },
        condicoes: 'IdH003 = :id',
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
        tabela: 'H003',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdH003 = :id',
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
