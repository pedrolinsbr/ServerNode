module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  api.listarVeiculo = async function (req, res, next) {

    var params    = req.query;
    var arrOrder = [];

    if(params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name']  + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    }else{
      arrOrder = ' G032.IDG032';
    }

    return await db.execute(
      {
        sql: `Select
                      G032.IdG032, G032.DsVeicul, G032.IdG003,   G032.NrPlaVei,
                      G032.IdG030, G032.DsRenava, G032.NrChassi, G032.IdG024,
                      G032.StCadast,G032.IdS001,G032.SnDelete,
                      to_char(G032.DtLiCamb, 'dd/mm/yyyy') AS DtLicab,
                      to_char(G032.DtCerReg, 'dd/mm/yyyy') AS DtCerReg,
                      to_char(G032.DtTesTac, 'dd/mm/yyyy') as DtTesTac,
                      to_char(G032.DtTesFum, 'dd/mm/yyyy') as DtTesFum,
                      to_char(G032.DtValAnt, 'dd/mm/yyyy') as DtValAnt,
                      to_char(G032.DtAetBit, 'dd/mm/yyyy') as DtAetBit,
                      to_char(G032.DtLieSSP, 'dd/mm/yyyy') as DtLieSSP,
                      to_char(G032.DtAetGo,  'dd/mm/yyyy') as DtAetGo,
                      to_char(G032.DtAetMG,  'dd/mm/yyyy') as DtAetMG,
                      to_char(G032.DtAetSP,  'dd/mm/yyyy') as DtAetSP,
                      to_char(G032.DtValEx2, 'dd/mm/yyyy') as DtValEx2,
                      to_char(G032.DtValE12, 'dd/mm/yyyy') as DtValE12,
                      to_char(G032.DtValCap, 'dd/mm/yyyy') as DtValCap,
                      to_char(G032.DtValPil, 'dd/mm/yyyy') as DtValPil,
                      to_char(G032.DtMasFac, 'dd/mm/yyyy') as DtMasFac,
                      to_char(G032.DtMasPo,  'dd/mm/yyyy') as DtMasPo,
                      to_char(G032.DtEx12Bi, 'dd/mm/yyyy') as DtEx12Bi,
                      to_char(G032.DtCadast, 'dd/mm/yyyy') as DtCadast,
                      G003.NmCidade, G030.DsTipVei, G024.NmTransp, S001.NmUsuari,
                      COUNT(G032.idG032) OVER () as COUNT_LINHA
             From     G032 G032
                      Join G003 G003 on G003.IdG003 = G032.IdG003
                      Join G030 G030 on G030.IdG030 = G032.IdG030
                      Join G024 G024 on G024.IdG024 = G032.IdG024
                      Join S001 S001 on S001.IdS001 = G032.IdS001
             Where    G032.SnDelete = 0
             Order By G032.idG032 desc`,

        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        return err;
      });
  };

  api.buscarVeiculo = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {

        sql: `Select
                      G032.IdG032, G032.DsVeicul, G032.IdG003,   G032.NrPlaVei,
                      G032.IdG030, G032.DsRenava, G032.NrChassi, G032.IdG024,
                      G032.StCadast, G032.IdS001, G032.SnDelete,
                      to_char(G032.DtLiCamb, 'dd/mm/yyyy') AS DtLicamb,
                      to_char(G032.DtCerReg, 'dd/mm/yyyy') AS DtCerReg,
                      to_char(G032.DtTesTac, 'dd/mm/yyyy') as DtTesTac,
                      to_char(G032.DtTesFum, 'dd/mm/yyyy') as DtTesFum,
                      to_char(G032.DtValAnt, 'dd/mm/yyyy') as DtValAnt,
                      to_char(G032.DtAetBit, 'dd/mm/yyyy') as DtAetBit,
                      to_char(G032.DtLieSSP, 'dd/mm/yyyy') as DtLieSSP,
                      to_char(G032.DtAetGo,  'dd/mm/yyyy') as DtAetGo,
                      to_char(G032.DtAetMG,  'dd/mm/yyyy') as DtAetMG,
                      to_char(G032.DtAetSP,  'dd/mm/yyyy') as DtAetSP,
                      to_char(G032.DtValEx2, 'dd/mm/yyyy') as DtValEx2,
                      to_char(G032.DtValE12, 'dd/mm/yyyy') as DtValE12,
                      to_char(G032.DtValCap, 'dd/mm/yyyy') as DtValCap,
                      to_char(G032.DtValPil, 'dd/mm/yyyy') as DtValPil,
                      to_char(G032.DtMasFac, 'dd/mm/yyyy') as DtMasFac,
                      to_char(G032.DtMasPo,  'dd/mm/yyyy') as DtMasPo,
                      to_char(G032.DtEx12Bi, 'dd/mm/yyyy') as DtEx12Bi,
                      to_char(G032.DtCadast, 'dd/mm/yyyy') as DtCadast
              From    G032 G032
              Where   G032.IdG032 = ` + id + ` and
                      G032.SnDelete = 0`,
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarVeiculo = async function (req, res, next) {
    return await db.insert({

      tabela: 'G032',
      colunas: {
        DsVeicul: req.body.DSVEICUL,
        IdG003:   req.body.IDG003,
        NrPlaVei: req.body.NRPLAVEI,
        IdG030:   req.body.IDG030,
        DsRenava: req.body.DSRENAVA,
        NrChassi: req.body.NRCHASSI,
        IdG024:   req.body.IDG024,
        DtLiCamb: req.body.DTLICAMB,
        DtCerReg: req.body.DTCERREG,
        DtTesTac: req.body.DTTESTAC,
        DtTesFum: req.body.DTTESFUM,
        DtValAnt: req.body.DTVALANT,
        DtAetBit: req.body.DTAETBIT,
        DtLieSSP: req.body.DTLIESSP,
        DtAetGo:  req.body.DTAETGO,
        DtAetMG:  req.body.DTAETMG,
        DtAetSP:  req.body.DTAETSP,
        DtValEx2: req.body.DTVALEX2,
        DtValE12: req.body.DTVALE12,
        DtValCap: req.body.DTVALCAP,
        DtValPil: req.body.DTVALPIL,
        DtMasFac: req.body.DTMASFAC,
        DtMasPo:  req.body.DTMASPO,
        DtEx12Bi: req.body.DTEX12BI,
        DtCadast: req.body.DTCADAST,
        StCadast: req.body.STCADAST,
        IdS001:   req.body.IDS001,
        SnDelete:  0,
      },
      key: 'IDG032'
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.atualizarVeiculo = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G032',
        colunas: {
          DSVEICUL: req.body.DSVEICUL,
          IDG003:   req.body.IDG003,
          NRPLAVEI: req.body.NRPLAVEI,
          IDG030:   req.body.IDG030,
          DSRENAVA: req.body.DSRENAVA,
          NRCHASSI: req.body.NRCHASSI,
          IDG024:   req.body.IDG024,
          DTLICAMB: utils.dateFormatOracle(req.body.DTLICAMB),
          DTCERREG: utils.dateFormatOracle(req.body.DTCERREG),
          DTTESTAC: utils.dateFormatOracle(req.body.DTTESTAC),
          DTTESFUM: utils.dateFormatOracle(req.body.DTTESFUM),
          DTVALANT: utils.dateFormatOracle(req.body.DTVALANT),
          DTAETBIT: utils.dateFormatOracle(req.body.DTAETBIT),
          DTLIESSP: utils.dateFormatOracle(req.body.DTLIESSP),
          DTAETGO:  utils.dateFormatOracle(req.body.DTAETGO),
          DTAETMG:  utils.dateFormatOracle(req.body.DTAETMG),
          DTAETSP:  utils.dateFormatOracle(req.body.DTAETSP),
          DTVALEX2: utils.dateFormatOracle(req.body.DTVALEX2),
          DTVALE12: utils.dateFormatOracle(req.body.DTVALE12),
          DTVALCAP: utils.dateFormatOracle(req.body.DTVALCAP),
          DTVALPIL: utils.dateFormatOracle(req.body.DTVALPIL),
          DTMASFAC: utils.dateFormatOracle(req.body.DTMASFAC),
          DTMASPO:  utils.dateFormatOracle(req.body.DTMASPO),
          DTEX12BI: utils.dateFormatOracle(req.body.DTEX12BI),
          DTCADAST: req.body.DTCADAST,
          STCADAST: req.body.STCADAST,
          IDS001:   req.body.IDS001,
          SNDELETE: req.body.SNDELETE,
        },
        condicoes: 'IdG032 = :id',
        parametros: {
          id: id
        }
      })
    .then((result) => {
      return { response : "Veículo atualizado com sucesso" };
    })
    .catch((err) => {
      throw err;
    });
  };

  api.excluirVeiculo = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G032',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IDG032 = :id',
        parametros: {
          id: id
        }
      })
      .then( (result) => {
        return { response : "Veículo deletado com sucesso" }
      })
      .catch((err) => {
        throw err;
      });
  };

  return api;
};
