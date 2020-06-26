module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;

  api.listarEmbalagem = async function (req, res, next) {
    return await db.execute({
      sql: `SELECT
                  G011.IDG011,
                  G011.STCADAST, 
                  G011.IDG009, 
                  G011.QTALTURA,
                  G011.QTPROFUN,
                  G011.QTLARGUR, 
                  G011.QTLASTRO, 
                  G011.QTCAMADA, 
                  G011.PSBRUTO, 
                  G011.PSLIQUID, 
                  TO_CHAR(G011.DTCADAST,'DD/MM/YYYY') DTCADAST, 
                  S001.NMUSUARI
            FROM  G011
            INNER JOIN S001 
              ON G011.IDS001 = S001.IDS001
            WHERE G011.SNDELETE = 0`,
      param: []
    }).then((result) => {
      return (result);
    }).catch((err) => {
      throw err;
    });
  };

  api.buscarEmbalagem = async function (req, res, next) {
    return await db.execute({
        sql: `SELECT
                    G011.IDG011, 
                    G011.IDG009, 
                    G011.QTALTURA, 
                    G011.QTPROFUN,
                    G011.QTLARGUR, 
                    G011.QTLASTRO, 
                    G011.QTCAMADA, 
                    G011.PSBRUTO,
                    G011.PSLIQUID, 
                    G011.DTCADAST, 
                    S001.NMUSUARI
              FROM  G011
              INNER JOIN S001 
                ON G011.IDS001 = S001.IDS001
              WHERE G011.IDG011 = ${req.params.id}`,
        param: [],

    }).then((result) => {
      return (result);

    }).catch((err) => {
      return err;
    });
  };

  api.salvarEmbalagem = async function (req, res, next) {
    return await db.insert({
      tabela: 'G011',
      colunas: {
        IdG009: req.body.IDG009,
        IdS001: req.body.IDS001,
        QtAltura: req.body.QtAltura,
        QtProfun: req.body.QtProfun,
        QtLargur: req.body.QtLargur,
        QtLastro: req.body.QtLastro,
        QtCamada: req.body.QtCamada,
        PsBruto: req.body.PsBruto,
        PsLiquid: req.body.PsLiquid,
        DtCadast: new Date(),
        StCadast: req.body.StCadast
      },
      key: 'IDG011'
    })
    .then((result) => {
      return (result);
    })
    .catch((err) => {
      throw err;
    });
  };

  api.atualizarEmbalagem = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G011',
        colunas: {
          IDG009: req.body.IDG009,
          IDS001: req.body.IDS001,
          QTALTURA: req.body.QTALTURA,
          QTPROFUN: req.body.QTPROFUN,
          QTLARGUR: req.body.QTLARGUR,
          QTLASTRO: req.body.QTLASTRO,
          QTCAMADA: req.body.QTCAMADA,
          PSBRUTO: req.body.PSBRUTO,
          PSLIQUID: req.body.PSLIQUID,
          STCADAST: req.body.STCADAST
        },
        condicoes: 'IDG011 = :id',
        parametros: {
          id: id
        }
      })
    .then( (result) => {
      return {result};
    })
    .catch((err) => {
      throw err;
    });
  };

  api.excluirEmbalagem = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G011',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IDG011 = :id',
        parametros: {
          id: id
        }
      })
    .then( (result) => {
      return {response: "Embalagem excluída com sucesso."};
    })
    .catch((err) => {
      throw err;
    });
  };

  api.buscarProdutosEmbalagem = async function (req, res, next) {      
    return await db.execute({
      sql: `SELECT
                  G016.IDG010,   
                  G016.IDG011, 
                  G010.IDS001,
                  G010.IDG037,
                  G010.IDG014,
                  G010.IDG038, 
                  G010.IDG010, 
                  G010.IDG015, 
                  G010.STCADAST, 
                  G010.DSPRODUT, 
                  G010.CDNCM,    
                  G010.SNINFLAM, 
                  G010.TPORIPRO,
                  G010.SNDELETE, 
                  G010.DSREFFAB,    
                  G010.STENVOTI, 
                  TO_CHAR(G010.DTCADAST, 'DD/MM/YYYY') AS DTCADAS
            FROM  G016
            INNER JOIN  G010 
              ON G016.IDG010 = G010.IDG010
            WHERE G016.IDG011 = ${req.params.id}
              AND G010.SNDELETE = 0`,
      param: [],
    })
    .then((result) => {
      return (result);
    })
    .catch((err) => {
      throw err;
    });
  };

  return api;
};
