module.exports = function (app, cb) {

  var api = {};

  var util = app.src.utils.Utils;
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;

  api.listarPais = async function (req, res, next) {

    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = ' G001.IdG001';
    }

    return await db.execute(
      {
        sql: `SELECT
                   G001.IDG001, 
                   G001.NMPAIS, 
                   G001.CDPAIS, 
                   G001.STCADAST,
                   TO_CHAR(G001.DTCADAST,'DD/MM/YYYY') AS DTCADAST,
                   COUNT(G001.IDG001) OVER () AS COUNT_LINHA
            FROM   G001
            WHERE  G001.SNDELETE = 0`,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.listarBuscaPais = async function (req, res, next) {
    if (req.params.busca.length < 3) {
      return;
    }

    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = `G001.IDG001`;
    }

    return await db.execute(
      {
        sql: `SELECT
                    G001.IDG001,
                    G001.NMPAIS,
                    COUNT(G001.IDG001) OVER () AS COUNT_LINHA
              FROM  G001
              WHERE G001.SNDELETE = 0 
                AND G001.NMPAIS LIKE '` + req.params.busca.toUpperCase() + `%' AND ROWNUM <= 50
              ORDER BY ` + arrOrder,
        param: []

      })
      .then((result) => {
        return (utils.nmPaisId(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarPais = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
                    G001.IDG001, 
                    G001.NMPAIS, 
                    G001.CDPAIS, 
                    G001.STCADAST
              FROM  G001
              WHERE G001.IDG001 = ${req.params.id}`,
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarPais = async function (req, res, next) {
    var dataBr = await util.timezoneBr();

    return await db.insert({
      tabela: 'G001',
      colunas: {
        StCadast: 'A',
        DtCadast: new Date(dataBr),
        IdS001: req.body.IDS001,
        NmPais: req.body.NMPAIS.toUpperCase(),
        CdPais: req.body.CDPAIS.toUpperCase()
      },
      key: 'IDG001'
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.atualizarPais = async function (req, res, next) {
    var id = req.params.id;
    return await
      db.update({
        tabela: 'G001',
        colunas: {
          CdPais: req.body.CDPAIS,
          StCadast: req.body.STCADAST.toUpperCase(),
          NmPais: req.body.NMPAIS.toUpperCase()
        },
        condicoes: 'IdG001 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Paí­s Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  api.excluirPais = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G001',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG001 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "País excluido com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };
  
  return api;
};