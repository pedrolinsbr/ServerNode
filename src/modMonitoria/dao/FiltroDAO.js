module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  api.listar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S028', false);
    //bindValues.debug = true;
    try {
      let result = await con.execute({
        sql: `Select Distinct S028.IdS028,
                      S028.IdS026,
                      S028.IdS007,
                      S028.DsValue,
                      S007.NmTabela, 
                      S007.NmTabela || '.' || S010.NmAtribu As DsCampo,
                      S007.NmTabela || '.' || S010.RfColAcl As DsResCam,
                      S007.DsTabela,
                      COUNT(S028.IdS028) OVER () as COUNT_LINHA
              From S028 S028
              Join S026 S026 On (S026.IdS026 = S028.IdS026)
              Join S007 S007 On (S007.IdS007 = S028.IdS007)
              Join S010 S010 On (S010.IDS007 = S007.IDS007 AND S010.NMATRIBU LIKE '%ID%') `+
              sqlWhere +
              sqlOrder +
              sqlPaginate,
        param: bindValues,
        debug: true
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      //let sql = '';
      for ( let key in result.data ) {
        //sql = 'Select ' + result.data[key].DSRESCAM + ' From ' + result.data[key].NMTABELA + ' ' + result.data[key].NMTABELA + ' Where ' + result.data[key].DSCAMPO + ' = ' + result.data[key].DSVALUE;
        result.data[key] = Object.assign(result.data[key], await con.execute({
          sql:  ' Select ' + result.data[key].DSRESCAM + ' AS DSVLSTR' + /* Descrição do valor da string */
            ' From ' + result.data[key].NMTABELA + ' ' + result.data[key].NMTABELA +
            ' Where ' + result.data[key].DSCAMPO + ' = ' + result.data[key].DSVALUE,
          param: {}
        })
        .then((result) => {
          return result[0];
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
          })
        );
        delete result.data[key].NMTABELA;
        delete result.data[key].DSCAMPO;
        delete result.data[key].DSRESCAM;
      }
      
      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.salvar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //console.log('req', req.body);
    try {          
      let result = await con.insert({
        tabela: `S028`,
        colunas: req.body,
        key: `S028.IDS028`
      })
      .then((result1) => {
        return result1;
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
  }

  api.deletar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //console.log('req', req.body);
    try {
      let result = await con.execute({
        sql: `Delete From S028 Where IdS028 = :IDS028`,
        param: {
          IDS028: req.body.IDS028
        },
        debug: true
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  return api;
};
