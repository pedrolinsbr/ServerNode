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
          arrOrder = ' H013.IdH013';
        }

        return await db.execute(
          {

            sql: `Select H013.IDH013, H013.DSPORTAR, H013.STCADAST, H013.IDS001,
            TO_CHAR(H013.DtCadast,'DD/MM/YYYY') as DtCadast,
             G028.NMARMAZE,
                         COUNT(H013.IdH013) OVER () as COUNT_LINHA
                    From H013 H013
                    Join G028 G028 on (H013.IdG028 = G028.IdG028)
                   Where H013.SnDelete = 0
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
        sql: 'select * from H013 where IdH013 = ' + id + ' and SnDelete = 0',
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
      tabela: 'H013',
      colunas: {

        DsPortar : req.body.DSPORTAR,
        StCadast: req.body.STCADAST,
        DtCadast: new Date(),
        IdG028  : req.body.IDG028,
        IdS001  : 4,

      },
      key: 'IdH013'
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
        tabela: 'H013',
        colunas: {
          DsPortar:  req.body.DSPORTAR,
          StCadast: req.body.STCADAST,
          IdG028  : req.body.IDG028
        },
        condicoes: 'IdH013 = :id',
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
        tabela: 'H013',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdH013 = :id',
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

  api.listarSolicitarEntradaAuto = async function (req, res, next) {
    sql= `
            Select  H006.IDH006, 
                    H006.STAGENDA, 
                    H007.HOINICIO AS HOINICIO
            From H006
            Inner Join (SELECT H007.IDH006, MIN(H007.HOINICIO) HOINICIO FROM H007 GROUP BY H007.IDH006) H007 
              ON H007.IDH006 = H006.IDH006
            Where H006.IDG028 = 10
            And STAGENDA = 3
            And TO_CHAR(H007.HOINICIO, 'DD/MM/YYYY') = TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY')
            And H007.HOINICIO < (CURRENT_DATE - 30/24/60) --diminuir 30 minutos 
            Order By H007.HOINICIO DESC
          `

    return await db.execute(
      {
        sql: sql,
        param: [],
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  };

  return api;
};
