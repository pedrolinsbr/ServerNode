module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;

  api.listarEvento = async function (req, res, next) {

    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = `I001.IDI001`;
    }

    return await db.execute( 
      {
        sql: `SELECT 
                    I001.IDI001,
                    I001.IDS001,
                    I001.DSEVENTO,
                    I001.STCADAST,
                    I001.SNDELETE,
                    TO_CHAR(I001.DTCADAST, 'dd/mm/yyyy') DTCADAST,

                    S001.IDS001, 
                    S001.NMUSUARI,
                    
                    COUNT(I001.IDS001) OVER () as COUNT_LINHA
              FROM  I001
              INNER JOIN S001  
                ON (S001.IDS001 = I001.IDS001)
              WHERE I001.SNDELETE = 0`,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarEvento = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT 
                    I001.IDI001,
                    I001.DSEVENTO,
                    I001.STCADAST,
                    I001.IDS001,
                    I001.SNDELETE,
                    TO_CHAR(I001.DTCADAST, 'dd/mm/yyyy') DTCADAST,

                    S001.IDS001 , 
                    S001.NMUSUARI 
              FROM  I001
              JOIN  S001 
                    on (S001.IDS001  = I001.IDS001)
              WHERE I001.IDI001 = ${req.params.id} AND 
                    I001.SNDELETE = 0`,
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarEvento = async function (req, res, next) {
    return await db.insert({
      tabela: `I001`,
      colunas: {
        DSEVENTO: req.body.DSEVENTO.toUpperCase(),
        STCADAST: req.body.STCADAST.toUpperCase(),
        DTCADAST: new Date(),
        IDS001: 4
      },
      key: `I001.IDI001`
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.atualizarEvento = async function (req, res, next) {

    return await
      db.update({
        tabela: `I001`,
        colunas: {
          DSEVENTO: req.body.DSEVENTO.toUpperCase(),
          STCADAST: req.body.STCADAST.toUpperCase(),
          IDS001: 4
        },
        condicoes: `I001.IDI001 = ${req.params.id}`,
        parametros: {
          id: req.params.id
        }
      })
        .then((result) => {
          return { response: "Evento Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  api.excluirEvento = async function (req, res, next) {

    return await
      db.update({
        tabela: `I001`,
        colunas: {
          SnDelete: 1
        },
        condicoes: `I001.IDI001 = ${req.params.id}`,
        parametros: {
          id: req.params.id
        }
      })
        .then((result) => {
          return { response : "Evento excluido com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
