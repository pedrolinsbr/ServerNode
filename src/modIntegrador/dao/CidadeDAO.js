module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  api.controller = app.config.ControllerBD;

  api.listarCidade = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G003',true);
      
      let result = await con.execute({
        sql: ` Select G003.IdG003,
                      G003.IdG002,
                      G003.CdMunici,
                      G003.CpCidade,
                      G003.NmCidade,
                      G003.NrLatitu,
                      G003.NrLongit,
                      G003.SnDelete,
                      G002.NMESTADO,
                      G003.STCADAST,
                      G003.DTCADAST,
                      COUNT(G003.IDG003) OVER () as COUNT_LINHA
                  From G003 G003
            INNER JOIN G002 G002 ON (G003.IDG002  = G002.IDG002)`+
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
      arrOrder = `G003.IDG003`;
    }

    return await db.execute({
      sql: `SELECT
                  G003.IDG003,
                  G003.NMCIDADE,
                  COUNT(G003.IDG003) OVER () AS COUNT_LINHA
            FROM  G003
            INNER JOIN G002
              ON (G002.IDG002 = G003.IDG002)
            WHERE G003.SNDELETE = 0 
              AND G003.NMCIDADE LIKE '` + req.params.busca.toUpperCase() + `%' AND ROWNUM <= 50
            ORDER BY `+ arrOrder,
      param: []

    }).then((result) => {
      return (utils.nmCidadeId(result));

    }).catch((err) => {
      throw err;
    });

  };

  api.buscarCidade = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.execute({
        sql: ` Select G003.IdG003,
                      G003.IdG002,
                      G003.CdMunici,
                      G003.CpCidade,
                      G003.NmCidade,
                      G003.NrLatitu,
                      G003.NrLongit,
                      G003.SnDelete,
                      G002.NMESTADO,
                      G003.STCADAST,
                      G003.DTCADAST,
                      G002.NMESTADO,
                      COUNT(G003.IDG003) OVER () as COUNT_LINHA
                 From G003 G003
           INNER JOIN G002 G002 ON (G003.IDG002  = G002.IDG002)
                Where G003.IdG003   = : id
                  And G003.SnDelete = 0`,
        
        param: { id: req.body.IDG003 }

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

  api.salvarCidade = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G003',
        colunas: {

          IDG002: req.body.IDG002.id,
          CDMUNICI: req.body.CDMUNICI,
          CPCIDADE: req.body.CPCIDADE,
          NMCIDADE: req.body.NMCIDADE,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          STCADAST: req.body.STCADAST,
          NMCIDADE: req.body.NMCIDADE,
          IDS001: 1,
          DTCADAST: new Date(),

        },

        key: 'IdG003'

      }).then((result) => {
        return { response: req.__('hc.sucesso.insert') };

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

  api.atualizarCidade = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.update({
        tabela: 'G003',
        colunas: {
          IDG002: req.body.IDG002.id,
          CDMUNICI: req.body.CDMUNICI,
          CPCIDADE: req.body.CPCIDADE,
          NMCIDADE: req.body.NMCIDADE,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          STCADAST: req.body.STCADAST,
          NMCIDADE: req.body.NMCIDADE
        },
        condicoes: 'IdG003 = :id',
        parametros: {
          id: req.body.IDG003
        }
      }).then((result) => {
        return {response: req.__('hc.sucesso.update')};
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

  api.excluirCidade = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {
      
      let result = await con.update({
        tabela: 'G003',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG003 in (${req.body.IDG003})`
        
      }).then((result) => {
        return { response: req.__('hc.sucesso.delete') };

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

  api.buscarCidadesEstado = async function (req, res, next) {

    return await db.execute({
      sql: `SELECT
                  G003.IDG003,
                  G003.IDG002,
                  G003.CDMUNICI,
                  G003.CPCIDADE,
                  G003.NMCIDADE,
                  G003.NRLATITU,
                  G003.NRLONGIT,
                  G003.SNDELETE,
                  COUNT(G003.IDG003) OVER () AS COUNT_LINHA
            FROM  G003
            WHERE G003.SNDELETE = 0
              AND G003.IDG002 = ${req.params.id}`,
      param: [],

    }).then((result) => {
      return (result);
      
    }).catch((err) => {
      throw err;
    });
  };

  api.buscarClientesCidade = async function (req, res, next) {
    return await db.execute({
      sql: `SELECT
                  G005.IDG005,
                  G005.IDS001,
                  G005.IDG040,
                  G005.IDG003,
                  G005.NMCLIENT,
                  G005.RSCLIENT,
                  G005.TPPESSOA,
                  G005.CJCLIENT,
                  G005.IECLIENT,
                  G005.IMCLIENT,
                  G005.DSENDERE,
                  G005.NRENDERE,
                  G005.DSCOMEND,
                  G005.BIENDERE,
                  G005.CPENDERE,
                  G005.NRLATITU,
                  G005.NRLONGIT,
                  G005.STCADAST,
                  G005.SNDELETE,
                  G005.NRDEPART,
                  G005.NRSELLER,
                  S001.NMUSUARI,
                  TO_CHAR(G005.DTCADAST, 'DD/MM/YYYY') DTCADAST,
                  COUNT(G005.IDG005) OVER () AS COUNT_LINHA
            FROM 	G005
            INNER JOIN S001
              ON S001.IDS001 = G005.IDS001
            WHERE G005.SNDELETE = 0
              AND G005.IDG003 = ${req.params.id}`,
      param: [],
    }).then((result) => {
      return (result);
    }).catch((err) => {
      throw err;
    });
  };
  
  return api;
};
