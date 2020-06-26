module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;

  api.listarEmbalagemProduto = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
                    G016.IDG016, 
                    G016.IDG010, 
                    G016.ID011, 
                    G016.SNEMBPAD
              FROM  G016`,
        param: []
      })
    .then((result) => {
      return (result);
    })
    .catch((err) => {
      throw err;
    });
  };

  api.salvarEmbalagemProduto = async function (req, res, next) {
    return await db.insert({
      tabela: 'G016',
      colunas: {
        IdG010: req.body.IdG010,
        IdG011: req.body.IdG011
      },
      key: 'IDG016'
    })
    .then((result) => {
      return (result);
    })
    .catch((err) => {
      throw err;
    });
  };

  api.buscarEmbalagemProduto = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
                    G016.IDG016, 
                    G016.IDG010, 
                    G016.ID011, 
                    G016.SNEMBPAD
              FROM  G016
              WHERE G016.IDG016 = ${req.params.id}`,
        param: [],
      })
    .then((result) => {
      return (result);
    })
    .catch((err) => {
      throw err;
    });
  };

  api.atualizarEmbalagemProduto = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G016',
        colunas: {
          IdG010: req.body.IdG010,
          IdG011: req.body.IdG011
        },
        condicoes: 'IDG016 = :id',
        parametros: {
          id: id
        }
      })
    .then((result) => {
      return { response: "Embalagem do produto atualizada com sucesso." };
    })
    .catch((err) => {
      throw err;
    });
  };
};
