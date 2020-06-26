module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  
  api.controller = app.config.ControllerBD;
  

  api.listarDePara = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G058',true);

      var user = null;
			if(req.UserId != null){
			  user = req.UserId;
			}else if(req.headers.ids001 != null){
			  user = req.headers.ids001;
			}else if(req.body.ids001 != null){
			  user = req.body.ids001;
      }
      
			var acl1 = '';
			acl1 = await acl.montar({
			  ids001: user,
			  dsmodulo: 'transportation',
			  nmtabela: [{
				G024: 'G024'
			  }],
			  //dioperad: ' ',
			  esoperad: 'And '
			});

			if(typeof acl1 == 'undefined'){
				acl1 = '';
			}

      let result = await con.execute(
        {
          sql: ` Select G058.IDG058,
                        G058.IDG005RE,
                        G058.IDG005DE,
                        G058.SNDELETE,
                        G058.STCADAST,
                        G058.DTCADAST,
                        G058.IDS001,
                        G058.IDG024,
                        G005RE.NMCLIENT AS NMCLIENTRE,
                        G005DE.NMCLIENT AS NMCLIENTDE,
                        G024.NMTRANSP,
                        COUNT(G058.IdG058) OVER () as COUNT_LINHA
                   From G058 G058
             INNER JOIN G005 G005RE ON (G058.IDG005RE  = G005RE.IDG005)
             INNER JOIN G005 G005DE ON (G058.IDG005DE  = G005DE.IDG005)
             INNER JOIN G024 G024   ON (G058.IDG024    = G024.IDG024)
                   `+
                    sqlWhere +
                    acl1 +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          return (utils.construirObjetoRetornoBD(result));
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

  api.buscarDePara = async function (req, res, next) {
    
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDG058;

      let result = await con.execute(
      {
        sql: ` Select G058.IDG058,
                      G058.IDG005RE,
                      G058.IDG005DE,
                      G058.SNDELETE,
                      G058.STCADAST,
                      G058.DTCADAST,
                      G058.IDS001,
                      G058.IDG024,
                      G005RE.NMCLIENT AS NMCLIENTRE,
                      G005DE.NMCLIENT AS NMCLIENTDE,
                      G024.NMTRANSP,
                      COUNT(G058.IdG058) OVER () as COUNT_LINHA
                 From G058 G058
           INNER JOIN G005 G005RE ON (G058.IDG005RE  = G005RE.IDG005)
           INNER JOIN G005 G005DE ON (G058.IDG005DE  = G005DE.IDG005)
           INNER JOIN G024 G024   ON (G058.IDG024    = G024.IDG024)
                Where G058.IdG058   = : id
                  And G058.SnDelete = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        return (result[0]);
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
 
  api.salvarDePara = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      let result = await con.insert({
        tabela: 'G058',
        colunas: {

          IDG005RE: req.body.IDG005RE.id,
          IDG005DE: req.body.IDG005DE.id,
          STCADAST: req.body.STCADAST,
          DTCADAST:  new Date(),
          IDS001: req.UserId,
          IDG024: req.body.IDG024.id,

        },
        key: 'IdG058'
      })
      .then((result) => {
        return { response: req.__('hc.sucesso.insert') };
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
 
  api.atualizarDePara = async function (req, res, next) {

    let con = await this.controller.getConnection();
    try {

      var id = req.body.IDG058;

      let result = await
        con.update({
          tabela: 'G058',
          colunas: {
            IDG005RE: req.body.IDG005RE.id,
            IDG005DE: req.body.IDG005DE.id,
            STCADAST: req.body.STCADAST,
            IDG024: req.body.IDG024.id,
          },
          condicoes: 'IdG058 = :id',
          parametros: {
            id: id
          }
        })
          .then((result) => {
          return {response: req.__('hc.sucesso.update')};
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
 
  api.excluirDePara = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var ids = req.body.IDG058;  
    
    let result = await
      con.update({
        tabela: 'G058',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG058 in (`+ids+`)`
      })
        .then((result) => {
        return { response: req.__('hc.sucesso.delete') };
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
