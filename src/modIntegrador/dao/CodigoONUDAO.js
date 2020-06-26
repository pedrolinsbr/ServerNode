module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  api.controller = app.config.ControllerBD;

  api.listarCodigoONU = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G015',true);
      
      let result = await con.execute({
        sql: ` Select   G015.IDG015,
                        G015.NRONU,
                        G015.DSGRUEMB,
                        G015.DSONU,
                        G015.DSCLARIS,
                        G015.SNDELETE,
                        G015.STCADAST,
                        G015.DTCADAST,
                        G015.IDS001,
                      COUNT(G015.IdG015) OVER () as COUNT_LINHA
                  From G015 `+
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

  api.salvarCodigoONU = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G015',
        colunas: {

          NRONU:  req.body.NRONU,
          DSGRUEMB:  req.body.DSGRUEMB,
          DSONU:  req.body.DSONU,
          DSCLARIS:  req.body.DSCLARIS,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: 1,
          
        },
        key: 'IdG015'

      }).then((result) => {
        return { response: res.__('it.sucesso.insert') };

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

  api.buscarCodigoONU = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.execute({
        sql: ` Select   G015.IDG015,
                        G015.NRONU,
                        G015.DSGRUEMB,
                        G015.DSONU,
                        G015.DSCLARIS,
                        G015.SNDELETE,
                        G015.STCADAST,
                        G015.DTCADAST,
                        G015.IDS001,
                      COUNT(G015.IdG015) OVER () as COUNT_LINHA
                 From G015 G015
                Where G015.IdG015   = : id
                  And G015.SnDelete = 0`,
        param: {
          id: req.body.IDG015
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

  api.excluirCodigoONU = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var ids = req.body.IDG015;  
    
      let result = await con.update({
          tabela: 'G015',
          colunas: {
            SnDelete: 1
          },
          condicoes: ` IdG015 in (`+ids+`)`
      
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

  api.atualizarCodigoONU = async function (req, res, next) {

    let con = await this.controller.getConnection();
    
    try {

      let result = await con.update({
        tabela: 'G015',
        colunas: {

          NRONU:  req.body.NRONU,
          DSGRUEMB:  req.body.DSGRUEMB,
          DSONU:  req.body.DSONU,
          DSCLARIS:  req.body.DSCLARIS,
          STCADAST: req.body.STCADAST,

        },
        condicoes: 'IdG015 = :id',
        parametros: {
          id: req.body.IDG015
        }

      }).then((result) => {
        return {response: req.__("it.sucesso.update")};

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

  api.buscarProdutosCodigoONU = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
                    G010.IDG010,   
                    G010.IDG015,
                    G010.IDG014,
                    G010.IDG038,
                    G010.IDG037,
                    G010.IDS001, 
                    G010.DSPRODUT,
                    G010.CDNCM,    
                    G010.SNINFLAM, 
                    G010.TPORIPRO,
                    G010.SNDELETE, 
                    G010.DSREFFAB,    
                    G010.STENVOTI,   
                    G010.STCADAST,
                    TO_CHAR(G010.DTCADAST, 'DD/MM/YYYY') DTCADAST
              FROM  G010
              WHERE G010.IDG015 = ${req.params.id}
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
