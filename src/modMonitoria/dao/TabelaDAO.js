module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.buscarAcl = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.execute({
        sql: `Select  DISTINCT  
                      S007.IdS007,
                      S007.DsTabela
              From    S007 S007
              Join    S010 S010 On (S010.IDS007 = S007.IDS007)
              Where   Nvl(S007.SnACL, 0) = 1`,
        param: {},
        debug: false
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.buscarValueTabela = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    try {
      let result = await con.execute({
        sql: `Select  Distinct       S007.NmTabela, 
                      S007.NmTabela || '.' || S010.NmAtribu As DsCampo,
                      S007.NmTabela || '.' || S010.RfColAcl As DsResCam,
                      Nvl(S010.RfCustom,S007.NmTabela || '.' || S010.RfColAcl) As RfCustom
              From    S007 S007 
              Join    S010 S010 On (S010.IDS007 = S007.IDS007 AND S010.NMATRIBU LIKE '%ID%')
              Where   S007.IDS007 = :IDS007`,
        param: {
          IDS007: req.body.IDS007
        },
        debug: false
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      result = await con.execute({
        sql: `Select  `+result[0].DSCAMPO+` As "id", `+result[0].RFCUSTOM+` As "text"
              From    `+result[0].NMTABELA+` `+result[0].NMTABELA+`
              Where   Upper(`+result[0].DSRESCAM+`) Like Upper(:BUSCA) And `+ result[0].NMTABELA + `.SnDelete = 0`,
        param: {
          BUSCA: '%'+req.body.BUSCA+'%'
        },
        debug: false
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  return api;
};
