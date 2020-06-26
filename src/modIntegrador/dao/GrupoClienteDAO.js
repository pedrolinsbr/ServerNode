module.exports = function (app, cb) {

  var api = {};
  var db = require(process.cwd() + '/config/database');
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.listarGrupoClientes = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G040',true);
      
      
      let result = await con.execute(
        {
          sql: ` Select G040.IDG040,
                        G040.STCADAST,
                        G040.DTCADAST,
                        G040.IDS001,
                        G040.DSGRUCLI,
                        COUNT(G040.IdG040) OVER () as COUNT_LINHA
                   From G040 G040`+
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
    
      await con.close();
      return result;
    
    } catch (err) {

      await con.closeRollback();
      throw err;
    
    }
  };

  api.buscarGrupoClientes = async function (req, res, next) {
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDG040;

      let result = await con.execute(
      {
        sql: ` Select G040.IDG040,
                      G040.STCADAST,
                      G040.DTCADAST,
                      G040.IDS001,
                      G040.DSGRUCLI
                 From G040 G040
                Where G040.IdG040   = : id
                  And G040.SnDelete = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
      
      await con.close();
      return result;
    
    } catch (err) {

      await con.closeRollback();
      throw err;
    }
  };

  api.salvarGrupoClientes = async function (req, res, next) {
    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G040',
        colunas: {

          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: 1,
          DSGRUCLI: req.body.DSGRUCLI,

        },
        key: 'IdG040'
      })
      .then((result) => {
        return { response: req.__('it.sucesso.insert') };
      })
      .catch((err) => {
        throw err;
        });      
  
      await con.close();
      return result;
    
    } catch (err) {

      await con.closeRollback();
      throw err;
    
    }
  };

  api.atualizarGrupoClientes = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDG040;

      let result = await con.update({
        tabela: 'G040',
        colunas: {

          STCADAST: req.body.STCADAST,
          DSGRUCLI: req.body.DSGRUCLI,

        },
        condicoes: 'IdG040 = :id',
        parametros: {
          id: id
        }
      }).then((result) => {
        return {response: req.__('it.sucesso.update')};

      }).catch((err) => {
        throw err;
      });
      
      await con.close();
      return result;
    
    } catch (err) {
      await con.closeRollback();
      throw err;    
    }
  };

  api.excluirGrupoClientes = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {
 
      var ids = req.body.IDG040;  
    
      let result = await con.update({
        tabela: 'G040',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG040 in (`+ids+`)`

      }).then((result) => {
        return { response: req.__('it.sucesso.delete') };

      }).catch((err) => {
        throw err;
      });
      
      await con.close();
      return result;
    
    } catch (err) {
      await con.closeRollback();
      throw err;    
    }
  };

  api.buscarClientesGrupo = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: `SELECT
		               G005.IDG005,   G005.NMCLIENT, G005.RSCLIENT,
                   G005.TPPESSOA, G005.CJCLIENT, G005.IECLIENT,
                   G005.IMCLIENT, G005.DSENDERE, G005.NRENDERE,
                   G005.DSCOMEND, G005.BIENDERE, G005.CPENDERE,
                   G005.IDG003,   G005.NRLATITU, G005.NRLONGIT,
                   G005.STCADAST, G005.NRSELLER, G005.IDS001,
                   G005.SNDELETE, G005.STENVOTI, G005.IDG040,
                   G005.NRDEPART,
                   TO_CHAR(G005.DtCadast,'DD/MM/YYYY') DtCadast
              FROM  G019 G019
              JOIN G005 G005 ON (G019.IDG005 = G005.IDG005)
              WHERE G005.SNDELETE = 0 AND G019.IDG018 =` +id ,
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
