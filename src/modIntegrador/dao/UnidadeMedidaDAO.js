module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;

  api.controller = app.config.ControllerBD;

  api.listarUnidadeMedida = async function (req, res, next) {

    let con = await this.controller.getConnection();

      try {

        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G009',true);
        
        let result = await con.execute({
          sql: ` Select G009.IDG009,
                        G009.CDUNIDAD,
                        G009.DSUNIDAD,
                        G009.STCADAST,
                        G009.DTCADAST,
                        G009.IDS001,
                        G009.SNDELETE,
                        COUNT(G009.IdG009) OVER () as COUNT_LINHA
                    From G009 G009`+
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

  api.buscarUnidadeMedida = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.execute({
        sql: ` Select G009.IDG009,
                      G009.CDUNIDAD,
                      G009.DSUNIDAD,
                      G009.STCADAST,
                      G009.DTCADAST,
                      G009.IDS001,
                      G009.SNDELETE,
                      COUNT(G009.IdG009) OVER () as COUNT_LINHA
                 From G009 G009
                Where G009.IdG009   = :id
                  And G009.SnDelete = 0`,
        param: {
          id: req.body.IDG009
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

  }

  api.salvarUnidadeMedida = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G009',
        colunas: {

          CDUNIDAD:  req.body.CDUNIDAD,
          DSUNIDAD:  req.body.DSUNIDAD,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: 1,
          
        },

        key: 'IdG009'

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

  api.atualizarUnidadeMedida = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.update({
        tabela: 'G009',
        colunas: {

          CDUNIDAD:  req.body.CDUNIDAD,
          DSUNIDAD:  req.body.DSUNIDAD,
          STCADAST: req.body.STCADAST,

        },
        condicoes: 'IdG009 = :id',
        parametros: {
          id: req.body.IDG009
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

  api.excluirUnidadeMedida = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var ids = req.body.IDG009;  
    
      let result = await con.update({
        tabela: 'G009',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG009 in (`+ids+`)`

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

  return api;

};
