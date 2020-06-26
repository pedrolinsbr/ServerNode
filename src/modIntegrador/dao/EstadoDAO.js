module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  api.listarEstado = async function (req, res, next) {
    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = `G002.IDG002`;
    }

    return await db.execute({
      sql: `SELECT
                G002.IDG002,
                G002.IDS001,
                G002.CDIDENUF,
                G002.CDESTADO,
                G002.NMESTADO,
                G002.SNDELETE,
                G002.STCADAST,
                G001.NMPAIS,
                COUNT(G002.IDG002) OVER () AS COUNT_LINHA
            FROM  G002
            INNER JOIN G001
              ON G001.IDG001 =  G002.IDG001
            WHERE G002.SNDELETE = 0
            ORDER BY `+ arrOrder,
      param: []
    }).then((result) => {
      return (utils.construirObjetoRetornoBD(result));
    }).catch((err) => {
      throw err;
    });
  };

  api.listarBusca = async function (req, res, next) {

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
      arrOrder = `G002.IDG002`;
    }

    return await db.execute({
      sql: `SELECT
                G002.IDG002,
                G002.NMESTADO,
                COUNT(G002.IDG002) OVER () AS COUNT_LINHA
            FROM  G002            
            WHERE G002.SNDELETE = 0 
              AND G002.NMESTADO LIKE '` + req.params.busca.toUpperCase() + `%' AND ROWNUM <= 50
            ORDER BY `+ arrOrder,
      param: []
    }).then((result) => {
      return (utils.nmEstadoId(result));
    }).catch((err) => {
      throw err;
    });
  };

  api.buscarEstado = async function (req, res, next) {
    var sqlCommand = `SELECT
                            G002.IDG002,
                            G002.CDIDENUF,
                            G002.CDESTADO,
                            G002.NMESTADO,
                            G002.SNDELETE,
                            G002.STCADAST
                      FROM  G002
                      WHERE G002.SNDELETE = 0
                        AND IDG002 = ${req}`;
    return await db.execute({
      sql: sqlCommand,
      param: [],
    })
    .then((result) => {
      return (result[0]);
    })
    .catch((err) => {
      throw err;
    });
  };

  api.salvarEstado = async function (req, res, next) {
    return await db.insert({
      tabela: `G002`,
      colunas: {
        IDG001: req.body.IDG001,
        IDS001: req.body.IDS001,
        CDIDENUF: req.body.CDIDENUF,
        STCADAST: req.body.STCADAST,
        DtCadast: new Date(),
        CDESTADO: req.body.CDESTADO.toUpperCase(),
        NMESTADO: req.body.NMESTADO.toUpperCase()
      },
      key: `G002.IDG002`
    }).then((result) => {
      return (result);
    }).catch((err) => {
      throw err;
    });
  };

  api.atualizarEstado = async function (req, res, next) {
    return await db.update({
      tabela: `G002`,
      colunas: {
        IDG001: req.body.IDG001,
        IDS001: req.body.IDS001,
        CDIDENUF: req.body.CDIDENUF,
        STCADAST: req.body.STCADAST,
        CDESTADO: req.body.CDESTADO.toUpperCase(),
        NMESTADO: req.body.NMESTADO.toUpperCase()
      },
      condicoes: `G002.IDG002 = ${req.params.id}`,
      parametros: {
        id: req.params.id
      }
    }).then((result) => {
      return { response: "Estado atualizado com sucesso" };
    }).catch((err) => {
      throw err;
    });
  };

  api.excluirEstado = async function (req, res, next) {
    return await db.update({
      tabela: `G002`,
      colunas: {
        SnDelete: 1
      },
      condicoes: `G002.IDG002 = ${req.params.id}`,
      parametros: {
        id: req.params.id
      }
    })
    .then((result) => {
      return { response: "Estado excluído com sucesso." };
    })
    .catch((err) => {
      throw err;
    });
  };

  api.buscarEstadosPais = async function (req, res, next) {

    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = `G002.IDG002`;
    }

    return await db.execute(
      {
        sql: `SELECT
                    G002.IDG002,
                    G002.CDIDENUF,
                    G002.CDESTADO,
                    G002.NMESTADO,
                    G002.SNDELETE,
                    G002.STCADAST,
                    COUNT( G002.IDG002) OVER () AS COUNT_LINHA
              FROM  G002 
              WHERE G002.SNDELETE = 0
                AND G002.IDG001 = ${req.params.id}
              ORDER BY ` + arrOrder,
        param: [],
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarFiltro = async function (req, res, next) {
    return await utils.searchComboBox("G002", "G002.NMESTADO", req.body.parameter);
  };

  return api;
};
