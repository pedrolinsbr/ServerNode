module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  api.listarMotorista = async function (req, res, next) {

    var params = req.query;
    var arrOrder = [];

    if (params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    } else {
      arrOrder = ' G031.IdG031';
    }

    return await db.execute(
      {
        sql: `Select
                G031.IdG031, G031.IdG024, G031.NmMotori ,G031.CjMotori,
                G031.DsEndere, G031.BiEndere, G031.NrEndere, G031.DsComend,
                G031.CpEndere, G031.IdG003, G031.NrCnhMot, G031.TpContra, 
                G031.RgMotori, G031.NrINsMot, G031.NrTitEle, G031.NrRegSin,
                G031.NrRegMot, G031.StCadast, S001.NmUsuari, G003.NmCidade, 
                G024.NmTransp,
                to_char(G031.DtValExa,  'dd/mm/yyyy') as DtValExa,
                to_char(G031.DtValCnh, 'dd/mm/yyyy') as DtValCnh,
                to_char(G031.DtValSeg,'dd/mm/yyyy') as DtValSeg,
                to_char(G031.DtVenMop,'dd/mm/yyyy') as DtVenMop,
                to_char(G031.DtDemmot,'dd/mm/yyyy') as DtDemmot,
                to_char(G031.DtAdmMot,'dd/mm/yyyy') as DtAdmMot,
                to_char(G031.DtNascim,'dd/mm/yyyy') as DtNascim,
                COUNT(G031.IdG031) OVER () as COUNT_LINHA
              From G031 G031
                Left Join G003 G003 on (G003.IdG003 = G031.IdG003)
                Join S001 S001 on (S001.IdS001 = G031.IdS001)
                Left Join G024 G024 on (G024.IdG024 = G031.IdG024)
                Where G031.SnDelete = 0
              Order By `+ arrOrder,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarMotorista = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: `Select
                G031.IDG031, G031.IDG024, G031.NMMOTORI, G031.CJMOTORI,
                G031.DSENDERE, G031.BIENDERE, G031.NRENDERE, G031.DSCOMEND,
                G031.CPENDERE, G031.IDG003, G031.NRCNHMOT, G031.NRREGMOT, 
                G031.STCADAST, G031.TPCONTRA, G031.RGMOTORI, G031.NRINSMOT, 
                G031.NRTITELE, G031.NRREGSIN,
                to_char(G031.DTVALEXA, 'dd/mm/yyyy') as DTVALEXA,
                to_char(G031.DTVALCNH, 'dd/mm/yyyy') as DTVALCNH,
                to_char(G031.DTVALSEG, 'dd/mm/yyyy') as DTVALSEG, 
                to_char(G031.DTVENMOP, 'dd/mm/yyyy') as DTVENMOP, 
                to_char(G031.DTDEMMOT, 'dd/mm/yyyy') as DTDEMMOT,
                to_char(G031.DTADMMOT, 'dd/mm/yyyy') as DTADMMOT,
                to_char(G031.DTNASCIM, 'dd/mm/yyyy') as DTNASCIM
              From   G031 G031 
              Where  G031.IdG031 = ` + id + `  
              and    G031.SnDelete = 0`,
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarMotorista = async function (req, res, next) {

    return await db.insert({
      tabela: 'G031',
      colunas: {
        IdS001: 4,
        DtCadast: new Date(),
        IdG024: req.body.IDG024,
        IdG003: req.body.IDG003,
        NmMotori: req.body.NMMOTORI,
        CjMotori: req.body.CJMOTORI,
        DsEndere: req.body.DSENDERE,
        BiEndere: req.body.BIENDERE,
        NrEndere: req.body.NRENDERE,
        DsComEnd: req.body.DSCOMEND,
        CpEndere: req.body.CPENDERE,
        NrCnhMot: req.body.NRCNHMOT,
        TpContra: req.body.TPCONTRA,
        RgMotori: req.body.RGMOTORI,
        NrInsMot: req.body.NRINSMOT,
        NrTitEle: req.body.NRTITELE,
        NrRegSin: req.body.NRREGSIN,
        NrRegMot: req.body.NRREGMOT,
        StCadast: req.body.STCADAST,
        DtValCnh: utils.dateFormatOracle(req.body.DTVALCNH),
        DtValSeg: utils.dateFormatOracle(req.body.DTVALSEG),
        DtVenMop: utils.dateFormatOracle(req.body.DTVENMOP),
        DtValExa: utils.dateFormatOracle(req.body.DTVALEXA),
        DtDemMot: utils.dateFormatOracle(req.body.DTDEMMOT),
        DtAdmMot: utils.dateFormatOracle(req.body.DTADMMOT),
        DtNascim: utils.dateFormatOracle(req.body.DTNASCIM)
      },
      key: 'IdG031'

    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.atualizarMotorista = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G031',
        colunas: {
          IdG024: req.body.IDG024,
          IdG003: req.body.IDG003,
          NmMotori: req.body.NMMOTORI,
          CjMotori: req.body.CJMOTORI,
          DsEndere: req.body.DSENDERE,
          BiEndere: req.body.BIENDERE,
          NrEndere: req.body.NRENDERE,
          DsComEnd: req.body.DSCOMEND,
          CpEndere: req.body.CPENDERE,
          NrCnhMot: req.body.NRCNHMOT,
          TpContra: req.body.TPCONTRA,
          RgMotori: req.body.RGMOTORI,
          NrInsMot: req.body.NRINSMOT,
          NrTitEle: req.body.NRTITELE,
          NrRegSin: req.body.NRREGSIN,
          NrRegMot: req.body.NRREGMOT,
          StCadast: req.body.STCADAST,
          DtValCnh: utils.dateFormatOracle(req.body.DTVALCNH),
          DtValSeg: utils.dateFormatOracle(req.body.DTVALSEG),
          DtVenMop: utils.dateFormatOracle(req.body.DTVENMOP),
          DtValExa: utils.dateFormatOracle(req.body.DTVALEXA),
          DtDemMot: utils.dateFormatOracle(req.body.DTDEMMOT),
          DtAdmMot: utils.dateFormatOracle(req.body.DTADMMOT)
        },
        condicoes: 'IdG031 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Motorista atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  api.excluirMotorista = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G031',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG031 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Motorista excluído com sucesso." };
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
