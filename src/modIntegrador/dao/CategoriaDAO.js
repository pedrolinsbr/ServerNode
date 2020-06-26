module.exports = function (app, cb) {

  var api = {};
  var db = require(process.cwd() + '/config/database');
  var utils = app.src.utils.FuncoesObjDB;

  api.controller = app.config.ControllerBD;

  api.listarCategoria = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G037',true);
            
      let result = await con.execute({
        sql: ` Select G037.IDG037,
                      G037.DSCATEGO,
                      G037.SNDELETE,
                      G037.STCADAST,
                      G037.IDS001,
                      G037.TPAPRESE,
                      G037.DSARMAZE,
                      G037.DTCADAST,
                      COUNT(G037.IdG037) OVER () as COUNT_LINHA
                  From G037`+
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

  api.buscarCategoria = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.execute({
        sql: ` Select G037.IDG037,
                      G037.DSCATEGO,
                      G037.SNDELETE,
                      G037.STCADAST,
                      G037.IDS001,
                      G037.TPAPRESE,
                      G037.DSARMAZE,
                      G037.DTCADAST,
                      COUNT(G037.IdG037) OVER () as COUNT_LINHA
                 From G037
                Where G037.IdG037   = :id
                  And G037.SnDelete = 0`,
        param: {
          id: req.body.IDG037
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

  api.salvarCategoria = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G037',
        colunas: {

          DSCATEGO:  req.body.DSCATEGO,
          TPAPRESE:  req.body.TPAPRESE,
          DSARMAZE: req.body.DSARMAZE,
          STCADAST: req.body.STCADAST,
          IDG037: req.body.IDG037,
          DTCADAST: new Date(),
          IDS001: 1,
          
        }

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

  api.atualizarCategoria = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = null;

      let resultValida = await con.execute({
        sql: ` Select G037.IDG037,
                      G037.DSCATEGO,
                      G037.SNDELETE,
                      G037.STCADAST,
                      G037.IDS001,
                      G037.TPAPRESE,
                      G037.DSARMAZE,
                      G037.DTCADAST,
                      COUNT(G037.IdG037) OVER () as COUNT_LINHA
                 From G037
                Where G037.IdG037 = :id
                  And G037.SnDelete = 0`,
        param: {
          id: req.body.IDG037
        }
      }).then((result) => {
        return (result[0]);

      }).catch((err) => {
        throw err;
      });

      if (resultValida == undefined) {
        
        result = await con.insert({
        tabela: 'G037',
        colunas: {

          DSCATEGO:  req.body.DSCATEGO,
          TPAPRESE:  req.body.TPAPRESE,
          DSARMAZE: req.body.DSARMAZE,
          STCADAST: req.body.STCADAST,
          IDG037: req.body.IDG037,
          DTCADAST: new Date(),
          IDS001: 1,
        
        }
      }).then((result) => {
        return { response: req.__('it.sucesso.insert') };

      }).catch((err) => {
      throw err;
      });
      
      await con.close();

      } else {
        
      result = await con.update({
        tabela: 'G037',
        colunas: {

          DSCATEGO: req.body.DSCATEGO,
          TPAPRESE: req.body.TPAPRESE,
          DSARMAZE: req.body.DSARMAZE,
          STCADAST: req.body.STCADAST,

        },
        condicoes: 'IdG037 = :id',
        parametros: { id: req.body.IDG037 }

      }).then((result) => {
          return { response: req.__('it.sucesso.update') };

      }).catch((err) => {
        throw err;
      });
      
      await con.close();
      
    }
      return result;
    
    } catch (err) {
      await con.closeRollback();
      throw err;
    }

  };

  api.excluirCategoria = async function (req, res, next) {
   
    let con = await this.controller.getConnection();

    try {
    
    let result = await con.update({
        tabela: 'G037',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG037 = '${req.body.IDG037}'`

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

  api.buscarProdutosCategoria = async function (req, res, next) {

    return await db.execute({
      sql: `SELECT
                  G010.IDG010,   G010.DSPRODUT, G010.IDG015,
                  G010.CDNCM,    G010.SNINFLAM, G010.TPORIPRO,
                  G010.SNDELETE, G010.DSREFFAB, G010.IDG014,
                  G010.IDG038,   G010.STENVOTI, G010.IDG037,
                  G010.STCADAST, G010.IDS001,
                  TO_CHAR(G010.DTCADAST, 'DD/MM/YYYY') AS DTCADAST
            FROM  G010
            WHERE G010.SNDELETE = 0 AND G010.IDG037 = '${req.params.id}'`,
      param: [],

    }).then((result) => {
      return (result);

    }).catch((err) => {
      throw err;
    });
  };

  return api;
};
