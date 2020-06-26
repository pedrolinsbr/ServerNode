module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;

  api.listarTipoContatoCliente = async function (req, res, next) {
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G008', true);

    return await db.execute(
      {
        sql: `Select  
                      G008.IDG008, 
                      G008.IDG007,   
                      G008.TPCONTAT, 
                      G008.DSCONTAT
              From   G008 G008 `+
              sqlWhere +
              sqlOrder +
              sqlPaginate,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarTipoContatoCliente = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: `Select  
                      G008.IDG008, 
                      G008.IDG007,   
                      G008.TPCONTAT, 
                      G008.DSCONTAT,
                      G008.IDS001 
              From   G008 G008 
              Where  G008.IdG008 = :id` ,
        param: {id:id}
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarTipoContatoCliente = async function (req, res, next) {
    return await db.insert({
      tabela: 'G008',
      colunas: {
        IDG007:   req.body.IDG007,
        IDS001:   req.body.IDS001,
        TPCONTAT: req.body.TPCONTAT,
        DSCONTAT: req.body.DSCONTAT,
        DTCADAST: new Date(),
      },
      key: 'IDG008'
    })
      .then((result) => {
        return {id:result};
      })
      .catch((err) => {
        throw err;
      });
  };

  api.atualizarTipoContatoCliente = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G008',
        colunas: {
          IDG007: req.body.IDG007,
          TPCONTAT: req.body.TPCONTAT,
          DSCONTAT: req.body.DSCONTAT,
          IDS001: req.body.IDS001
        },
        condicoes: 'IDG008 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return {response: "Contato atualizado com sucesso."};
        })
        .catch((err) => {
          throw err;
        });
  };

  api.excluirTipoContatoCliente = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G008',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG008 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return {response: "Excluído com sucesso"};
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
