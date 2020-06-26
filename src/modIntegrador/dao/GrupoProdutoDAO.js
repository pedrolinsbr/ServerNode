module.exports = function (app, cb) {

  var api = {};
  var db = require(process.cwd() + '/config/database');
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.listarGrupoProdutos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G038',true);
            
      let result = await con.execute({
          sql: ` Select G038.IDG038,
                        G038.DSGRUPRO,
                        G038.SNDELETE,
                        G038.STCADAST,
                        G038.DTCADAST,
                        G038.IDS001,
                        COUNT(G038.IdG038) OVER () as COUNT_LINHA
                   From G038 G038`+
                    sqlWhere +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        
        }).then((result) => {
          return (utils.construirObjetoRetornoBD(result));
        
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

  api.buscarGrupoProdutos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDG038;

      let result = await con.execute({
        sql: ` Select G038.IDG038,
                      G038.DSGRUPRO,
                      G038.SNDELETE,
                      G038.STCADAST,
                      G038.DTCADAST,
                      G038.IDS001,
                      COUNT(G038.IdG038) OVER () as COUNT_LINHA
                 From G038 G038
                Where G038.IdG038   = : id
                  And G038.SnDelete = 0`,
        param: {
          id: id
        }

      }).then((result) => {
        return (result[0]);

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

  api.salvarGrupoProdutos = async function (req, res, next) {
    
    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G038',
        colunas: {

          DSGRUPRO:  req.body.DSGRUPRO,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: 1,

        },
        key: 'IdG038'

      }).then((result) => {
        return { response: req.__('it.sucesso.insert') };

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

  api.atualizarGrupoProdutos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDG038;

      let result = await con.update({
        tabela: 'G038',
        colunas: {

          DSGRUPRO:  req.body.DSGRUPRO,
          STCADAST: req.body.STCADAST,

        },
        condicoes: 'IdG038 = :id',
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

  api.excluirGrupoProdutos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var ids = req.body.IDG038;  
    
      let result = await con.update({
        tabela: 'G038',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG038 in (`+ids+`)`

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

  //---------------------------------------------------------------------//

  api.buscarProdutosGrupo = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: `SELECT
                		G010.IDG010,   G010.DSPRODUT, G010.IDG015,
                    G010.CDNCM,    G010.SNINFLAM, G010.TPORIPRO,
                    G010.SNDELETE, G010.DSREFFAB, G010.IDG014,
                    G010.IDG038,   G010.STENVOTI, G010.IDG037,
                    G010.STCADAST, G010.IDS001,
                    TO_CHAR(G010.DTCADAST, 'DD/MM/YYYY') AS DTCADAST
              FROM  G010 G010
          	  WHERE G010.SNDELETE = 0 AND G010.IDG038 = '`+id+`'`,
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
